import crypto from 'crypto';
import { serverDb } from './db';
import { Order, PaymentVerificationDetails } from '../types';

const GATEWAY_SECRET = process.env.PAYMENT_GATEWAY_SECRET || 'divine_gateway_master_sec_8941';

export function generatePaymentSignature(orderId: string, amount: number, currency: string = 'INR'): string {
  const payload = `${orderId}|${amount}|${currency}`;
  return crypto.createHmac('sha256', GATEWAY_SECRET).update(payload).digest('hex');
}

export function generateTransactionId(): string {
  return `TXN-DIV-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

export interface GatewayVerificationRequest {
  orderId: string;
  orderNumber: string;
  transactionId: string;
  gatewayRef?: string;
  amount: number;
  currency: string;
  signature: string;
  method?: string;
  ip?: string;
}

export function processServerPaymentVerification(req: GatewayVerificationRequest): {
  success: boolean;
  order?: Order;
  error?: string;
  code?: string;
} {
  const order = serverDb.getOrderById(req.orderId);

  if (!order) {
    serverDb.addAuditLog({
      action: 'PAYMENT_VERIFICATION_REJECTED',
      category: 'PAYMENT',
      details: `Verification attempt for non-existent order '${req.orderId}'. Transaction ID: ${req.transactionId}`,
      status: 'FAILED',
      ip: req.ip
    });
    return { success: false, error: 'Order not found in server records.', code: 'ORDER_NOT_FOUND' };
  }

  // 1. Idempotency / Duplicate Transaction Check
  if (serverDb.isTransactionProcessed(req.transactionId)) {
    serverDb.addAuditLog({
      action: 'REPLAY_ATTACK_BLOCKED',
      category: 'SECURITY',
      details: `Replay attempt blocked: Transaction ID ${req.transactionId} was already processed previously.`,
      status: 'FAILED',
      ip: req.ip,
      adminId: 'GATEWAY_WEBHOOK'
    });
    serverDb.addFraudAlert({
      ip: req.ip || 'UNKNOWN',
      orderId: order.id,
      orderNumber: order.orderNumber,
      reason: `Duplicate transaction replay detected for transaction ${req.transactionId}`,
      severity: 'HIGH',
      status: 'OPEN'
    });
    return { success: false, error: 'Duplicate transaction: this payment has already been processed.', code: 'DUPLICATE_TRANSACTION' };
  }

  // 2. Check Order State Machine
  if (order.paymentStatus === 'paid' && order.status === 'ORDER_CONFIRMED') {
    return { success: true, order, code: 'ALREADY_PAID' };
  }

  // 3. Signature & Integrity Check
  const expectedSignature = generatePaymentSignature(order.id, order.total, 'INR');
  const providedSignature = req.signature?.trim();

  const isSignatureValid = providedSignature && (
    providedSignature === expectedSignature ||
    providedSignature === generatePaymentSignature(order.orderNumber, order.total, 'INR')
  );

  if (!isSignatureValid) {
    serverDb.updateOrder(order.id, {
      status: 'PAYMENT_FAILED',
      paymentStatus: 'failed',
      notes: `Payment verification failed: Invalid cryptographic gateway signature from IP ${req.ip}`
    });

    serverDb.addAuditLog({
      action: 'PAYMENT_SIGNATURE_MISMATCH',
      category: 'SECURITY',
      details: `Cryptographic signature mismatch for Order ${order.orderNumber}. Expected signature did not match gateway payload.`,
      status: 'FAILED',
      ip: req.ip
    });

    serverDb.addFraudAlert({
      ip: req.ip || 'UNKNOWN',
      orderId: order.id,
      orderNumber: order.orderNumber,
      reason: `Invalid payment signature for Order ${order.orderNumber}. Possible payment forgery attempt.`,
      severity: 'HIGH',
      status: 'OPEN'
    });

    return { success: false, error: 'Cryptographic payment verification failed. Untrusted payment proof.', code: 'INVALID_SIGNATURE' };
  }

  // 4. Exact Amount Matching (Never trust client prices)
  if (Number(req.amount) !== Number(order.total)) {
    serverDb.updateOrder(order.id, {
      status: 'PAYMENT_FAILED',
      paymentStatus: 'failed',
      fraudStatus: 'REVIEW_REQUIRED',
      fraudReason: `Amount mismatch: Paid ₹${req.amount} vs Server Due ₹${order.total}`
    });

    serverDb.addAuditLog({
      action: 'PAYMENT_AMOUNT_MISMATCH',
      category: 'SECURITY',
      details: `Tampered payment amount for Order ${order.orderNumber}. Paid amount ₹${req.amount} != Server Due ₹${order.total}`,
      status: 'FAILED',
      ip: req.ip
    });

    return { success: false, error: `Payment amount ₹${req.amount} does not match server order total ₹${order.total}.`, code: 'AMOUNT_MISMATCH' };
  }

  // 5. Deduct Stock Atomically
  const stockDeducted = serverDb.decrementStock(order.items);
  if (!stockDeducted) {
    serverDb.addAuditLog({
      action: 'STOCK_SHORTAGE_AFTER_PAYMENT',
      category: 'STOCK',
      details: `Payment was verified for Order ${order.orderNumber}, but items experienced sudden inventory depletion. Flagged for priority owner fulfillment.`,
      status: 'WARNING',
      ip: req.ip
    });
  }

  // 6. Transition Order State to PAYMENT_VERIFIED -> ORDER_CONFIRMED
  const verificationDetails: PaymentVerificationDetails = {
    transactionId: req.transactionId,
    gatewayRef: req.gatewayRef || 'INSTANT_UPI_GATEWAY',
    verifiedAt: new Date().toISOString(),
    signatureValid: true,
    verifiedAmount: req.amount,
    currency: req.currency || 'INR',
    method: req.method || order.paymentMethod
  };

  const updatedOrder = serverDb.updateOrder(order.id, {
    status: 'ORDER_CONFIRMED',
    paymentStatus: 'paid',
    paymentVerification: verificationDetails,
    upiUtr: req.transactionId
  });

  // Record transaction ID for idempotency
  serverDb.recordTransaction(req.transactionId);

  // Record in Audit Log
  serverDb.addAuditLog({
    action: 'PAYMENT_VERIFIED_AND_CONFIRMED',
    category: 'PAYMENT',
    details: `Payment of ₹${order.total} verified via Gateway. Txn ID: ${req.transactionId}. Order ${order.orderNumber} confirmed & stock allocated.`,
    status: 'SUCCESS',
    ip: req.ip,
    adminId: 'PAYMENT_GATEWAY_WEBHOOK'
  });

  return { success: true, order: updatedOrder || undefined };
}
