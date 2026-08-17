import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';

import { serverDb } from './src/server/db';
import {
  requireAdmin,
  verifyAdminCredentials,
  recordFailedLogin,
  recordSuccessfulLogin,
  checkRateLimit,
  revokeSession,
  validateSession
} from './src/server/auth';
import { evaluateOrderFraudRisk } from './src/server/fraud';
import {
  generatePaymentSignature,
  generateTransactionId,
  processServerPaymentVerification
} from './src/server/payment';
import { BUSINESS_CONFIG } from './src/data/products';
import { COUPONS } from './src/data/reviews';
import { Order, OrderStatus } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body and Cookie Parsers
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Security Headers Middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    next();
  });

  // Client IP helper
  const getClientIp = (req: Request): string => {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      '127.0.0.1'
    );
  };

  // ==========================================
  // PUBLIC STORE API ENDPOINTS
  // ==========================================

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      security: 'active',
      publicAccess: 'read_only'
    });
  });

  // 1. Get Public Catalog (Read-Only)
  app.get('/api/products', (req: Request, res: Response) => {
    const products = serverDb.getProducts();
    res.json({
      success: true,
      products
    });
  });

  // 2. Validate Coupon (Server-calculated discount)
  app.post('/api/coupons/validate', (req: Request, res: Response) => {
    const { code, items } = req.body;
    if (!code || typeof code !== 'string') {
      res.status(400).json({ valid: false, message: 'Invalid coupon code.' });
      return;
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = COUPONS.find(c => c.code.toUpperCase() === cleanCode);

    if (!coupon) {
      res.status(404).json({ valid: false, message: 'Coupon code not recognized.' });
      return;
    }

    // Calculate server subtotal
    let subtotal = 0;
    if (Array.isArray(items)) {
      for (const item of items) {
        const prod = serverDb.getProductById(item.productId);
        if (prod) {
          subtotal += prod.price * (Math.max(1, Number(item.quantity)) || 1);
        }
      }
    }

    if (subtotal < coupon.minOrder) {
      res.status(400).json({
        valid: false,
        message: `Cart minimum value of ₹${coupon.minOrder} required for coupon ${coupon.code}. Current: ₹${subtotal}`
      });
      return;
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((subtotal * coupon.value) / 100);
    } else {
      discount = coupon.value;
    }

    res.json({
      valid: true,
      code: coupon.code,
      discount,
      description: coupon.description,
      minOrder: coupon.minOrder
    });
  });

  // 3. Initiate Order & Server-Side Price Calculation
  app.post('/api/orders/initiate', (req: Request, res: Response) => {
    try {
      const { items, customer, couponCode, paymentMethod, clientSubtotal } = req.body;
      const ip = getClientIp(req);

      if (!Array.isArray(items) || items.length === 0) {
        res.status(400).json({ error: 'Order must contain at least one item.' });
        return;
      }

      if (!customer || !customer.fullName || !customer.phone || !customer.address || !customer.pinCode) {
        res.status(400).json({ error: 'Incomplete shipping details provided.' });
        return;
      }

      // Check Real Product Prices and Stock Availability on Server
      const orderItems = [];
      let serverSubtotal = 0;

      for (const item of items) {
        const product = serverDb.getProductById(item.productId);
        if (!product) {
          res.status(400).json({ error: `Product ID '${item.productId}' not found in catalog.` });
          return;
        }

        const quantity = Math.max(1, Math.min(50, Number(item.quantity) || 1));
        if (product.stockCount < quantity) {
          res.status(400).json({
            error: `Insufficient stock for '${product.name}'. Available: ${product.stockCount}`
          });
          return;
        }

        // Use ONLY the official server price
        const verifiedItemPrice = product.price;
        serverSubtotal += verifiedItemPrice * quantity;

        orderItems.push({
          productId: product.id,
          name: product.name,
          price: verifiedItemPrice,
          quantity,
          size: product.size,
          image: product.image
        });
      }

      // Calculate Shipping Fee
      const shippingFee = serverSubtotal >= BUSINESS_CONFIG.freeShippingThreshold ? 0 : BUSINESS_CONFIG.defaultShippingFee;

      // Validate Coupon Server-side
      let discount = 0;
      let appliedCouponCode: string | undefined = undefined;

      if (couponCode && typeof couponCode === 'string') {
        const cleanCoupon = couponCode.trim().toUpperCase();
        const found = COUPONS.find(c => c.code.toUpperCase() === cleanCoupon);
        if (found && serverSubtotal >= found.minOrder) {
          appliedCouponCode = found.code;
          discount = found.discountType === 'percentage'
            ? Math.round((serverSubtotal * found.value) / 100)
            : found.value;
        }
      }

      const total = Math.max(0, serverSubtotal + shippingFee - discount);

      // Server-side Fraud Evaluation
      const fraudCheck = evaluateOrderFraudRisk({
        ip,
        phone: customer.phone,
        items,
        clientSubtotal,
        serverSubtotal,
        paymentMethod: paymentMethod || 'upi'
      });

      const orderId = `div-ord-${Date.now()}`;
      const orderNumber = `DIV-${Math.floor(100000 + Math.random() * 900000)}`;

      // State machine logic
      let initialStatus: OrderStatus = 'PENDING_PAYMENT';
      let initialPaymentStatus: 'paid' | 'pending' = 'pending';

      if (paymentMethod === 'cod') {
        // COD orders can move to confirmed after validation
        initialStatus = 'ORDER_CONFIRMED';
        initialPaymentStatus = 'pending';
        // Deduct stock for confirmed COD order
        serverDb.decrementStock(orderItems);
      }

      const newOrder: Order = {
        id: orderId,
        orderNumber,
        createdAt: new Date().toISOString(),
        customer: {
          fullName: customer.fullName.trim(),
          phone: customer.phone.trim(),
          email: (customer.email || '').trim(),
          address: customer.address.trim(),
          landmark: customer.landmark?.trim(),
          city: customer.city.trim(),
          district: customer.district?.trim() || customer.city.trim(),
          state: customer.state?.trim() || 'India',
          pinCode: customer.pinCode.trim(),
          orderNotes: customer.orderNotes?.trim()
        },
        items: orderItems,
        subtotal: serverSubtotal,
        discount,
        couponCode: appliedCouponCode,
        shippingFee,
        total,
        paymentMethod: paymentMethod || 'upi',
        paymentStatus: initialPaymentStatus,
        status: initialStatus,
        fraudStatus: fraudCheck.fraudStatus,
        fraudReason: fraudCheck.fraudReason,
        fraudScore: fraudCheck.fraudScore
      };

      serverDb.createOrder(newOrder);

      // Generate server payment signature for secure gateway handoff
      const paymentSignature = generatePaymentSignature(orderId, total, 'INR');

      serverDb.addAuditLog({
        action: 'ORDER_INITIATED',
        category: 'ORDER',
        details: `Order ${orderNumber} initiated for ₹${total}. Payment method: ${paymentMethod}. Fraud Status: ${fraudCheck.fraudStatus}`,
        status: fraudCheck.fraudStatus === 'REVIEW_REQUIRED' ? 'WARNING' : 'SUCCESS',
        ip
      });

      res.json({
        success: true,
        orderId,
        orderNumber,
        subtotal: serverSubtotal,
        shippingFee,
        discount,
        total,
        status: initialStatus,
        paymentSignature,
        paymentVerificationRequired: paymentMethod !== 'cod'
      });
    } catch (err: any) {
      console.error('Order initiation error:', err);
      res.status(500).json({ error: 'Failed to initiate order. Please try again.' });
    }
  });

  // 4. Server-to-Server Payment Gateway Verification Endpoint
  app.post('/api/payments/verify-gateway', (req: Request, res: Response) => {
    try {
      const { orderId, orderNumber, transactionId, amount, currency, signature, gatewayRef, method } = req.body;
      const ip = getClientIp(req);

      if (!orderId || !transactionId || !amount || !signature) {
        res.status(400).json({
          success: false,
          error: 'Missing required payment verification parameters.'
        });
        return;
      }

      const result = processServerPaymentVerification({
        orderId,
        orderNumber: orderNumber || orderId,
        transactionId,
        gatewayRef: gatewayRef || 'INSTANT_UPI_GATEWAY',
        amount: Number(amount),
        currency: currency || 'INR',
        signature,
        method: method || 'upi',
        ip
      });

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.error || 'Payment verification failed.',
          code: result.code
        });
        return;
      }

      res.json({
        success: true,
        order: result.order,
        message: 'Payment cryptographically verified and order confirmed.'
      });
    } catch (err: any) {
      console.error('Payment verification error:', err);
      res.status(500).json({ success: false, error: 'Internal payment verification error.' });
    }
  });

  // 5. Payment Gateway Webhook (Signed by Payment Provider)
  app.post('/api/webhooks/payment', (req: Request, res: Response) => {
    try {
      const webhookSignature = req.headers['x-gateway-signature'] as string;
      const { event, data } = req.body;
      const ip = getClientIp(req);

      if (!event || !data || !data.orderId || !data.transactionId) {
        res.status(400).json({ error: 'Malformed webhook payload.' });
        return;
      }

      // Deduplicate webhook event
      const webhookId = data.webhookId || data.transactionId;
      if (serverDb.isWebhookProcessed(webhookId)) {
        res.json({ status: 'ignored_duplicate' });
        return;
      }

      serverDb.recordWebhook(webhookId);

      const result = processServerPaymentVerification({
        orderId: data.orderId,
        orderNumber: data.orderNumber || data.orderId,
        transactionId: data.transactionId,
        amount: Number(data.amount),
        currency: data.currency || 'INR',
        signature: webhookSignature || data.signature,
        gatewayRef: data.gatewayRef,
        method: data.method,
        ip
      });

      if (result.success) {
        res.json({ status: 'payment_verified', orderNumber: result.order?.orderNumber });
      } else {
        res.status(400).json({ status: 'rejected', error: result.error });
      }
    } catch (err: any) {
      res.status(500).json({ error: 'Webhook processing error.' });
    }
  });

  // 6. Public Order Tracking (Sanitized Data)
  app.get('/api/orders/track/:query', (req: Request, res: Response) => {
    const query = req.params.query?.trim();
    if (!query) {
      res.status(400).json({ error: 'Tracking query required.' });
      return;
    }

    const cleanQuery = query.toLowerCase();
    const orders = serverDb.getOrders();

    const matched = orders.find(
      o =>
        o.orderNumber.toLowerCase() === cleanQuery ||
        o.id.toLowerCase() === cleanQuery ||
        o.customer.phone.replace(/[^0-9]/g, '') === query.replace(/[^0-9]/g, '')
    );

    if (!matched) {
      res.status(404).json({ error: 'No order found matching the provided details.' });
      return;
    }

    // Return sanitized tracking view
    res.json({
      orderNumber: matched.orderNumber,
      createdAt: matched.createdAt,
      status: matched.status,
      paymentStatus: matched.paymentStatus,
      paymentMethod: matched.paymentMethod,
      trackingNumber: matched.trackingNumber,
      customer: {
        fullName: matched.customer?.fullName || 'Customer',
        address: matched.customer?.address || '',
        city: matched.customer?.city || '',
        district: matched.customer?.district || '',
        state: matched.customer?.state || '',
        pinCode: matched.customer?.pinCode || '',
        phone: matched.customer?.phone || ''
      },
      customerName: matched.customer?.fullName || 'Customer',
      city: matched.customer?.city || '',
      state: matched.customer?.state || '',
      total: matched.total,
      items: matched.items.map(it => ({
        productId: it.productId,
        name: it.name,
        price: it.price,
        quantity: it.quantity,
        size: it.size,
        image: it.image
      }))
    });
  });

  // ==========================================
  // PROTECTED OWNER ADMIN API ENDPOINTS
  // ==========================================

  // Admin Login (Rate Limited & Account Lockout Protected)
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const { username, password, securityPin } = req.body;
    const ip = getClientIp(req);
    const identifier = `${ip}:${(username || '').toLowerCase()}`;

    // 1. Check Rate Limit
    const rateLimit = checkRateLimit(identifier);
    if (rateLimit.isLocked) {
      res.status(429).json({
        error: `Too many failed login attempts. Access temporarily locked for security. Please retry in ${rateLimit.waitTimeSeconds} seconds.`,
        locked: true,
        retryAfter: rateLimit.waitTimeSeconds
      });
      return;
    }

    // 2. Validate Credentials
    const isValid = verifyAdminCredentials(username, password, securityPin);

    if (!isValid) {
      const failInfo = recordFailedLogin(identifier, ip, username || 'UNKNOWN');
      res.status(401).json({
        error: failInfo.locked
          ? `Invalid credentials. Maximum attempts reached. Account locked for 15 minutes.`
          : `Invalid administrator credentials. ${failInfo.remainingAttempts} attempts remaining before temporary lockout.`,
        locked: failInfo.locked,
        remainingAttempts: failInfo.remainingAttempts,
        retryAfter: failInfo.waitTimeSeconds
      });
      return;
    }

    // 3. Successful Login
    const session = recordSuccessfulLogin(identifier, username.trim(), ip);

    // Set HttpOnly Secure SameSite Cookie
    res.cookie('admin_session', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 12 * 60 * 60 * 1000 // 12 hours
    });

    res.json({
      success: true,
      message: 'Owner administrator authenticated successfully.',
      token: session.token,
      username: session.username,
      expiresAt: session.expiresAt
    });
  });

  // Admin Logout
  app.post('/api/admin/logout', (req: Request, res: Response) => {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.cookies?.admin_session;
    const ip = getClientIp(req);

    if (token) {
      revokeSession(token, ip);
    }

    res.clearCookie('admin_session');
    res.json({ success: true, message: 'Admin signed out and session revoked.' });
  });

  // Admin Me / Session Status
  app.get('/api/admin/me', requireAdmin, (req: Request, res: Response) => {
    const session = (req as any).adminSession;
    res.json({
      authenticated: true,
      username: session.username,
      expiresAt: session.expiresAt
    });
  });

  // Admin Get All Products (Protected)
  app.get('/api/admin/products', requireAdmin, (req: Request, res: Response) => {
    const products = serverDb.getProducts();
    res.json({ success: true, products });
  });

  // Admin Update Product (Price, Stock, Details - Protected)
  app.put('/api/admin/products/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const session = (req as any).adminSession;
    const ip = getClientIp(req);
    const oldProduct = serverDb.getProductById(id);

    if (!oldProduct) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    const updated = serverDb.updateProduct(id, req.body);
    if (!updated) {
      res.status(500).json({ error: 'Failed to update product.' });
      return;
    }

    // Detail changes in audit log
    const changes: string[] = [];
    if (req.body.price !== undefined && req.body.price !== oldProduct.price) {
      changes.push(`Price: ₹${oldProduct.price} -> ₹${req.body.price}`);
    }
    if (req.body.stockCount !== undefined && req.body.stockCount !== oldProduct.stockCount) {
      changes.push(`Stock: ${oldProduct.stockCount} -> ${req.body.stockCount}`);
    }
    if (req.body.inStock !== undefined && req.body.inStock !== oldProduct.inStock) {
      changes.push(`In Stock: ${oldProduct.inStock} -> ${req.body.inStock}`);
    }

    serverDb.addAuditLog({
      action: 'PRODUCT_UPDATED',
      category: changes.some(c => c.startsWith('Price')) ? 'PRICE' : 'STOCK',
      details: `Product '${oldProduct.name}' updated by Admin ${session.username}. Changes: ${changes.join(', ') || 'Metadata updated'}`,
      status: 'SUCCESS',
      ip,
      adminId: session.username
    });

    res.json({ success: true, product: updated });
  });

  // Admin Reset Products to Default (Protected)
  app.post('/api/admin/products/reset-defaults', requireAdmin, (req: Request, res: Response) => {
    const session = (req as any).adminSession;
    const ip = getClientIp(req);

    const resetProducts = serverDb.resetProductsToDefault();

    serverDb.addAuditLog({
      action: 'PRODUCTS_RESET_DEFAULT',
      category: 'PRICE',
      details: `All catalog prices, inventory levels, and details reset to factory defaults by Admin ${session.username}`,
      status: 'SUCCESS',
      ip,
      adminId: session.username
    });

    res.json({ success: true, products: resetProducts });
  });

  // Admin Get All Orders (Protected)
  app.get('/api/admin/orders', requireAdmin, (req: Request, res: Response) => {
    const orders = serverDb.getOrders();
    res.json({ success: true, orders });
  });

  // Admin Update Order Status / Tracking Number (Protected)
  app.put('/api/admin/orders/:id/status', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;
    const session = (req as any).adminSession;
    const ip = getClientIp(req);

    const order = serverDb.getOrderById(id);
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    const updates: Partial<Order> = {};
    if (status) updates.status = status;
    if (trackingNumber !== undefined) updates.trackingNumber = trackingNumber.trim();

    const updated = serverDb.updateOrder(id, updates);

    serverDb.addAuditLog({
      action: 'ORDER_STATUS_CHANGED',
      category: 'ORDER',
      details: `Order ${order.orderNumber} status changed from '${order.status}' to '${status || order.status}'. Tracking: ${trackingNumber || order.trackingNumber || 'N/A'}`,
      status: 'SUCCESS',
      ip,
      adminId: session.username
    });

    res.json({ success: true, order: updated });
  });

  // Admin Review Flagged Fraud Orders (Protected)
  app.put('/api/admin/orders/:id/review', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const { action, notes } = req.body; // action: 'APPROVE' | 'CANCEL'
    const session = (req as any).adminSession;
    const ip = getClientIp(req);

    const order = serverDb.getOrderById(id);
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    const updates: Partial<Order> = {
      fraudStatus: action === 'APPROVE' ? 'CLEARED' : 'FLAGGED',
      notes: notes ? `${order.notes || ''} [Admin Review: ${notes}]` : order.notes
    };

    if (action === 'APPROVE' && order.status === 'PENDING_PAYMENT') {
      updates.status = 'ORDER_CONFIRMED';
    } else if (action === 'CANCEL') {
      updates.status = 'ORDER_CANCELLED';
    }

    const updated = serverDb.updateOrder(id, updates);

    serverDb.addAuditLog({
      action: 'FRAUD_ORDER_REVIEWED',
      category: 'SECURITY',
      details: `Flagged Order ${order.orderNumber} reviewed by Admin ${session.username}. Action taken: ${action}`,
      status: 'SUCCESS',
      ip,
      adminId: session.username
    });

    res.json({ success: true, order: updated });
  });

  // Admin Get Audit Logs (Protected)
  app.get('/api/admin/audit-logs', requireAdmin, (req: Request, res: Response) => {
    const logs = serverDb.getAuditLogs();
    res.json({ success: true, logs });
  });

  // Admin Get Fraud Alerts (Protected)
  app.get('/api/admin/fraud-alerts', requireAdmin, (req: Request, res: Response) => {
    const alerts = serverDb.getFraudAlerts();
    res.json({ success: true, alerts });
  });

  // Admin Dismiss Fraud Alert (Protected)
  app.put('/api/admin/fraud-alerts/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    serverDb.updateFraudAlert(id, status || 'REVIEWED');
    res.json({ success: true });
  });

  // 404 handler for unmatched /api routes
  app.all('/api/*', (req: Request, res: Response) => {
    res.status(404).json({ error: 'Endpoint not found.' });
  });

  // ==========================================
  // VITE & FRONTEND SERVING
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled server error:', err);
    if (res.headersSent) {
      return next(err);
    }
    res.status(500).json({ error: 'An unexpected secure server error occurred.' });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DIVINE Herbal Cosmetics Secure Server running at http://0.0.0.0:${PORT}`);
    console.log(`Security: Owner-Only Admin Authentication + Server-Verified Orders active.`);
  });
}

startServer().catch(err => {
  console.error('Fatal Server Start Error:', err);
  process.exit(1);
});
