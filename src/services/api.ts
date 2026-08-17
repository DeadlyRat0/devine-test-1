import { Product, Order, AuditLogEntry, FraudAlert, OrderStatus } from '../types';

let adminAuthToken: string | null = null;

export function setAdminAuthToken(token: string | null) {
  adminAuthToken = token;
  if (token) {
    sessionStorage.setItem('divine_admin_jwt', token);
  } else {
    sessionStorage.removeItem('divine_admin_jwt');
  }
}

export function getAdminAuthToken(): string | null {
  if (!adminAuthToken) {
    adminAuthToken = sessionStorage.getItem('divine_admin_jwt');
  }
  return adminAuthToken;
}

function getAuthHeaders(): HeadersInit {
  const token = getAdminAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

// 1. Public Catalog
export async function fetchCatalogProducts(): Promise<Product[]> {
  try {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();
    return data.products || [];
  } catch (err) {
    console.error('Fetch products error:', err);
    return [];
  }
}

// 2. Validate Coupon
export async function validateCouponOnServer(code: string, items: { productId: string; quantity: number }[]): Promise<{
  valid: boolean;
  code?: string;
  discount?: number;
  message?: string;
  description?: string;
}> {
  try {
    const res = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, items })
    });
    return await res.json();
  } catch (err) {
    return { valid: false, message: 'Server communication error.' };
  }
}

// 3. Initiate Order & Server-Side Price Calculation
export async function initiateServerOrder(payload: {
  items: { productId: string; quantity: number }[];
  customer: any;
  couponCode?: string;
  paymentMethod: string;
  clientSubtotal?: number;
}): Promise<{
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  subtotal?: number;
  shippingFee?: number;
  discount?: number;
  total?: number;
  status?: OrderStatus;
  paymentSignature?: string;
  paymentVerificationRequired?: boolean;
  error?: string;
}> {
  try {
    const res = await fetch('/api/orders/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to initiate order.' };
    }
    return data;
  } catch (err) {
    return { success: false, error: 'Network error during order initiation.' };
  }
}

// 4. Verify Payment with Payment Gateway
export async function verifyGatewayPayment(payload: {
  orderId: string;
  orderNumber: string;
  transactionId: string;
  amount: number;
  currency: string;
  signature: string;
  gatewayRef?: string;
  method?: string;
}): Promise<{
  success: boolean;
  order?: Order;
  error?: string;
  code?: string;
}> {
  try {
    const res = await fetch('/api/payments/verify-gateway', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Payment verification failed.', code: data.code };
    }
    return data;
  } catch (err) {
    return { success: false, error: 'Network error during gateway verification.' };
  }
}

// 5. Track Order
export async function trackOrderServer(query: string): Promise<any> {
  const res = await fetch(`/api/orders/track/${encodeURIComponent(query.trim())}`);
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Order not found');
  }
  return await res.json();
}

// 6. Admin Authentication
export async function adminApiLogin(credentials: {
  username: string;
  password: string;
  securityPin?: string;
}): Promise<{
  success: boolean;
  token?: string;
  username?: string;
  error?: string;
  locked?: boolean;
  retryAfter?: number;
}> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await res.json();
    if (res.ok && data.token) {
      setAdminAuthToken(data.token);
    }
    return data;
  } catch (err) {
    return { success: false, error: 'Network error connecting to admin service.' };
  }
}

export async function adminApiLogout(): Promise<void> {
  try {
    await fetch('/api/admin/logout', {
      method: 'POST',
      headers: getAuthHeaders()
    });
  } catch (err) {
    console.error('Logout error:', err);
  } finally {
    setAdminAuthToken(null);
  }
}

export async function adminApiCheckMe(): Promise<{ authenticated: boolean; username?: string }> {
  try {
    const res = await fetch('/api/admin/me', {
      headers: getAuthHeaders()
    });
    if (!res.ok) return { authenticated: false };
    const data = await res.json();
    return data;
  } catch {
    return { authenticated: false };
  }
}

// 7. Admin Products Operations
export async function adminApiGetProducts(): Promise<Product[]> {
  const res = await fetch('/api/admin/products', { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Unauthorized or failed to load products');
  const data = await res.json();
  return data.products || [];
}

export async function adminApiUpdateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const res = await fetch(`/api/admin/products/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to update product');
  }
  const data = await res.json();
  return data.product;
}

export async function adminApiResetProducts(): Promise<Product[]> {
  const res = await fetch('/api/admin/products/reset-defaults', {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to reset products');
  const data = await res.json();
  return data.products;
}

// 8. Admin Orders Operations
export async function adminApiGetOrders(): Promise<Order[]> {
  const res = await fetch('/api/admin/orders', { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Unauthorized or failed to load orders');
  const data = await res.json();
  return data.orders || [];
}

export async function adminApiUpdateOrderStatus(id: string, status?: OrderStatus, trackingNumber?: string): Promise<Order> {
  const res = await fetch(`/api/admin/orders/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, trackingNumber })
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to update order status');
  }
  const data = await res.json();
  return data.order;
}

export async function adminApiReviewOrder(id: string, action: 'APPROVE' | 'CANCEL', notes?: string): Promise<Order> {
  const res = await fetch(`/api/admin/orders/${id}/review`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ action, notes })
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to review order');
  }
  const data = await res.json();
  return data.order;
}

// 9. Admin Audit Logs & Fraud Alerts
export async function adminApiGetAuditLogs(): Promise<AuditLogEntry[]> {
  const res = await fetch('/api/admin/audit-logs', { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to load audit logs');
  const data = await res.json();
  return data.logs || [];
}

export async function adminApiGetFraudAlerts(): Promise<FraudAlert[]> {
  const res = await fetch('/api/admin/fraud-alerts', { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to load fraud alerts');
  const data = await res.json();
  return data.alerts || [];
}
