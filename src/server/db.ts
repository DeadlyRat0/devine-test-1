import { Product, Order, AuditLogEntry, FraudAlert } from '../types';
import { INITIAL_PRODUCTS } from '../data/products';
import { CUSTOMER_REVIEWS } from '../data/reviews';

// Server-authoritative in-memory database
class ServerDatabase {
  private products: Product[] = [];
  private orders: Order[] = [];
  private auditLogs: AuditLogEntry[] = [];
  private fraudAlerts: FraudAlert[] = [];
  private processedTransactions: Set<string> = new Set();
  private processedWebhooks: Set<string> = new Set();

  constructor() {
    this.initDatabase();
  }

  private initDatabase() {
    // Deep clone initial products to prevent mutations
    this.products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));

    // Seed an initial demo order with confirmed server status
    this.orders = [
      {
        id: 'div-ord-1786701002',
        orderNumber: 'DIV-894102',
        createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        customer: {
          fullName: 'Ananya Sharma',
          phone: '9845012345',
          email: 'ananya.s@example.com',
          address: '42, Lotus Boulevard, Indiranagar',
          city: 'Bengaluru',
          district: 'Bengaluru Urban',
          state: 'Karnataka',
          pinCode: '560038'
        },
        items: [
          {
            productId: 'div-hair-oil-100',
            name: 'DIVINE 100% Natural Ayurvedic Hair Oil',
            price: 450,
            quantity: 2,
            size: '100 ml',
            image: this.products[0]?.image || ''
          },
          {
            productId: 'div-eye-roll-10',
            name: 'DIVINE Under Eye Roll On',
            price: 199,
            quantity: 1,
            size: '10 ml',
            image: this.products[1]?.image || ''
          }
        ],
        subtotal: 1099,
        discount: 50,
        couponCode: 'HERBAL50',
        shippingFee: 0,
        total: 1049,
        paymentMethod: 'upi',
        paymentStatus: 'paid',
        upiUtr: 'AXL98421092837',
        status: 'ORDER_CONFIRMED',
        trackingNumber: 'DIV-EX-99824',
        fraudStatus: 'CLEARED',
        paymentVerification: {
          transactionId: 'TXN-998421092837',
          gatewayRef: 'UPI-BANK-9984',
          verifiedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
          signatureValid: true,
          verifiedAmount: 1049,
          currency: 'INR',
          method: 'UPI'
        }
      }
    ];

    // Initial audit log entry
    this.auditLogs = [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'SYSTEM_BOOT',
        category: 'SECURITY',
        details: 'Server-side Security Engine initialized. Public write protection active.',
        status: 'SUCCESS',
        adminId: 'SYSTEM'
      }
    ];
  }

  // Products
  public getProducts(): Product[] {
    return JSON.parse(JSON.stringify(this.products));
  }

  public getProductById(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.products.findIndex(p => p.id === id);
    if (idx === -1) return null;

    const current = this.products[idx];
    const updated: Product = {
      ...current,
      ...updates,
      price: updates.price !== undefined ? Number(updates.price) : current.price,
      originalPrice: updates.originalPrice !== undefined ? Number(updates.originalPrice) : current.originalPrice,
      marketPrice: updates.marketPrice !== undefined ? Number(updates.marketPrice) : current.marketPrice,
      stockCount: updates.stockCount !== undefined ? Math.max(0, Number(updates.stockCount)) : current.stockCount,
      inStock: updates.inStock !== undefined ? Boolean(updates.inStock) : current.inStock
    };

    this.products[idx] = updated;
    return JSON.parse(JSON.stringify(updated));
  }

  public resetProductsToDefault(): Product[] {
    this.products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
    return this.getProducts();
  }

  public decrementStock(items: { productId: string; quantity: number }[]): boolean {
    // Atomic check first
    for (const it of items) {
      const prod = this.products.find(p => p.id === it.productId);
      if (!prod || prod.stockCount < it.quantity) {
        return false;
      }
    }
    // Deduct
    for (const it of items) {
      const prod = this.products.find(p => p.id === it.productId);
      if (prod) {
        prod.stockCount = Math.max(0, prod.stockCount - it.quantity);
        if (prod.stockCount === 0) {
          prod.inStock = false;
        }
      }
    }
    return true;
  }

  // Orders
  public getOrders(): Order[] {
    return JSON.parse(JSON.stringify(this.orders));
  }

  public getOrderById(id: string): Order | undefined {
    return this.orders.find(o => o.id === id || o.orderNumber === id);
  }

  public createOrder(order: Order): Order {
    this.orders.unshift(order);
    return JSON.parse(JSON.stringify(order));
  }

  public updateOrder(id: string, updates: Partial<Order>): Order | null {
    const idx = this.orders.findIndex(o => o.id === id || o.orderNumber === id);
    if (idx === -1) return null;

    this.orders[idx] = {
      ...this.orders[idx],
      ...updates
    };
    return JSON.parse(JSON.stringify(this.orders[idx]));
  }

  // Audit Logs
  public getAuditLogs(): AuditLogEntry[] {
    return JSON.parse(JSON.stringify(this.auditLogs));
  }

  public addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'> & { timestamp?: string }): AuditLogEntry {
    const log: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: entry.timestamp || new Date().toISOString(),
      ...entry
    };
    this.auditLogs.unshift(log);
    // Keep max 500 logs in memory
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
    return log;
  }

  // Fraud Alerts
  public getFraudAlerts(): FraudAlert[] {
    return JSON.parse(JSON.stringify(this.fraudAlerts));
  }

  public addFraudAlert(alert: Omit<FraudAlert, 'id' | 'timestamp'>): FraudAlert {
    const newAlert: FraudAlert = {
      id: `fa-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      ...alert
    };
    this.fraudAlerts.unshift(newAlert);
    return newAlert;
  }

  public updateFraudAlert(id: string, status: 'OPEN' | 'REVIEWED' | 'DISMISSED'): boolean {
    const item = this.fraudAlerts.find(a => a.id === id);
    if (item) {
      item.status = status;
      return true;
    }
    return false;
  }

  // Idempotency for transactions
  public isTransactionProcessed(txnId: string): boolean {
    return this.processedTransactions.has(txnId);
  }

  public recordTransaction(txnId: string): void {
    this.processedTransactions.add(txnId);
  }

  public isWebhookProcessed(webhookId: string): boolean {
    return this.processedWebhooks.has(webhookId);
  }

  public recordWebhook(webhookId: string): void {
    this.processedWebhooks.add(webhookId);
  }
}

export const serverDb = new ServerDatabase();
