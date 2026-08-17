import { Order, OrderItem, FraudStatus } from '../types';
import { serverDb } from './db';

interface VelocityRecord {
  timestamps: number[];
}

const ipOrderVelocity = new Map<string, VelocityRecord>();
const phoneOrderVelocity = new Map<string, VelocityRecord>();

export function evaluateOrderFraudRisk(params: {
  ip: string;
  phone: string;
  items: { productId: string; quantity: number }[];
  clientSubtotal?: number;
  serverSubtotal: number;
  paymentMethod: string;
}): { fraudStatus: FraudStatus; fraudReason?: string; fraudScore: number } {
  const now = Date.now();
  let fraudScore = 0;
  const reasons: string[] = [];

  // 1. IP Velocity Check (more than 4 checkouts in 10 minutes)
  let ipRecord = ipOrderVelocity.get(params.ip);
  if (!ipRecord) {
    ipRecord = { timestamps: [] };
    ipOrderVelocity.set(params.ip, ipRecord);
  }
  ipRecord.timestamps = ipRecord.timestamps.filter(t => now - t < 10 * 60 * 1000);
  ipRecord.timestamps.push(now);

  if (ipRecord.timestamps.length >= 4) {
    fraudScore += 45;
    reasons.push(`High order velocity from IP (${ipRecord.timestamps.length} orders in 10 min)`);
  }

  // 2. Phone Velocity Check
  const cleanPhone = params.phone.replace(/[^0-9]/g, '');
  if (cleanPhone) {
    let phoneRecord = phoneOrderVelocity.get(cleanPhone);
    if (!phoneRecord) {
      phoneRecord = { timestamps: [] };
      phoneOrderVelocity.set(cleanPhone, phoneRecord);
    }
    phoneRecord.timestamps = phoneRecord.timestamps.filter(t => now - t < 10 * 60 * 1000);
    phoneRecord.timestamps.push(now);

    if (phoneRecord.timestamps.length >= 3) {
      fraudScore += 40;
      reasons.push(`Multiple orders placed with same phone number in short interval`);
    }
  }

  // 3. Abnormally High Quantity Anomaly
  const totalUnits = params.items.reduce((acc, it) => acc + (it.quantity || 1), 0);
  if (totalUnits > 12) {
    fraudScore += 25;
    reasons.push(`Bulk order detected (${totalUnits} total units)`);
  }

  // 4. Client Price Tampering Check
  if (params.clientSubtotal !== undefined && params.clientSubtotal !== params.serverSubtotal) {
    fraudScore += 90;
    reasons.push(`Client submitted tampered price (Client: ₹${params.clientSubtotal} vs Server: ₹${params.serverSubtotal})`);
    
    serverDb.addFraudAlert({
      ip: params.ip,
      reason: `Client attempted price tampering: Client sent ₹${params.clientSubtotal}, Server calculated ₹${params.serverSubtotal}`,
      severity: 'HIGH',
      status: 'OPEN'
    });
  }

  // Evaluate final status
  let fraudStatus: FraudStatus = 'CLEARED';
  if (fraudScore >= 40) {
    fraudStatus = 'REVIEW_REQUIRED';
  }

  return {
    fraudStatus,
    fraudReason: reasons.length > 0 ? reasons.join('; ') : undefined,
    fraudScore
  };
}
