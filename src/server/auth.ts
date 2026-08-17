import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { serverDb } from './db';
import { AdminSession } from '../types';

// Rate Limiting & Account Lockout Tracker
interface LoginAttemptRecord {
  failedAttempts: number;
  lockedUntil: number;
  lastAttempt: number;
}

const loginAttempts = new Map<string, LoginAttemptRecord>();
const activeSessions = new Map<string, AdminSession>();

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours session validity

// Salted Master Credentials
const MASTER_USERNAME = process.env.ADMIN_USERNAME || 'owner_admin';
const MASTER_PASSWORD = process.env.ADMIN_PASSWORD || 'DivineOwner#2026!Secure';
const MASTER_PIN = process.env.ADMIN_SECURITY_PIN || '8942';

function timingSafeMatch(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf-8');
    const bufB = Buffer.from(b, 'utf-8');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export function checkRateLimit(identifier: string): { isLocked: boolean; waitTimeSeconds: number } {
  const record = loginAttempts.get(identifier);
  const now = Date.now();

  if (!record) {
    return { isLocked: false, waitTimeSeconds: 0 };
  }

  if (record.lockedUntil > now) {
    const waitTimeSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { isLocked: true, waitTimeSeconds };
  }

  // If lockout has passed, reset count
  if (record.lockedUntil > 0 && record.lockedUntil <= now) {
    loginAttempts.delete(identifier);
  }

  return { isLocked: false, waitTimeSeconds: 0 };
}

export function recordFailedLogin(identifier: string, ip: string, username: string): { locked: boolean; remainingAttempts: number; waitTimeSeconds: number } {
  const now = Date.now();
  let record = loginAttempts.get(identifier);

  if (!record) {
    record = { failedAttempts: 0, lockedUntil: 0, lastAttempt: now };
    loginAttempts.set(identifier, record);
  }

  record.failedAttempts += 1;
  record.lastAttempt = now;

  let locked = false;
  let waitTimeSeconds = 0;

  if (record.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    locked = true;
    waitTimeSeconds = Math.ceil(LOCKOUT_DURATION_MS / 1000);

    serverDb.addAuditLog({
      action: 'ADMIN_ACCOUNT_LOCKED',
      category: 'AUTH',
      details: `Account/IP locked out for 15 minutes due to ${record.failedAttempts} consecutive failed attempts. Target user: '${username}'`,
      status: 'FAILED',
      ip,
      adminId: username || 'ANONYMOUS'
    });

    serverDb.addFraudAlert({
      ip,
      reason: `Repeated failed admin login attempts (${record.failedAttempts} attempts) on account '${username}'`,
      severity: 'HIGH',
      status: 'OPEN'
    });
  } else {
    serverDb.addAuditLog({
      action: 'ADMIN_LOGIN_FAILED',
      category: 'AUTH',
      details: `Failed authentication attempt for username '${username}'. Attempt ${record.failedAttempts}/${MAX_FAILED_ATTEMPTS}`,
      status: 'WARNING',
      ip,
      adminId: username || 'ANONYMOUS'
    });
  }

  return {
    locked,
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - record.failedAttempts),
    waitTimeSeconds
  };
}

export function recordSuccessfulLogin(identifier: string, username: string, ip: string): AdminSession {
  loginAttempts.delete(identifier);

  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  const session: AdminSession = {
    token,
    username,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS
  };

  activeSessions.set(token, session);

  serverDb.addAuditLog({
    action: 'ADMIN_LOGIN_SUCCESS',
    category: 'AUTH',
    details: `Owner administrator successfully authenticated. Session initialized for 12 hours.`,
    status: 'SUCCESS',
    ip,
    adminId: username
  });

  return session;
}

export function verifyAdminCredentials(username?: string, password?: string, pin?: string): boolean {
  if (!username || !password) return false;

  const validUsername = timingSafeMatch(username.trim(), MASTER_USERNAME);
  const validPassword = timingSafeMatch(password.trim(), MASTER_PASSWORD);
  const validPin = pin ? timingSafeMatch(pin.trim(), MASTER_PIN) : true;

  return validUsername && validPassword && validPin;
}

export function validateSession(token?: string): AdminSession | null {
  if (!token) return null;

  const session = activeSessions.get(token);
  if (!session) return null;

  if (session.expiresAt < Date.now()) {
    activeSessions.delete(token);
    return null;
  }

  return session;
}

export function revokeSession(token: string, ip?: string): boolean {
  const session = activeSessions.get(token);
  if (session) {
    activeSessions.delete(token);
    serverDb.addAuditLog({
      action: 'ADMIN_LOGOUT',
      category: 'AUTH',
      details: `Owner administrator session explicitly terminated and revoked.`,
      status: 'SUCCESS',
      ip,
      adminId: session.username
    });
    return true;
  }
  return false;
}

// Express Authorization Middleware
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  // Extract token from header or cookie
  let token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token && req.cookies?.admin_session) {
    token = req.cookies.admin_session;
  }

  if (!token) {
    res.status(401).json({
      error: 'Unauthorized: Owner Admin authentication is strictly required to perform this action.',
      code: 'AUTH_REQUIRED'
    });
    return;
  }

  const session = validateSession(token);
  if (!session) {
    res.status(403).json({
      error: 'Forbidden: Admin session has expired or is invalid. Please sign in again.',
      code: 'SESSION_EXPIRED'
    });
    return;
  }

  // Attach session to request
  (req as any).adminSession = session;
  next();
}
