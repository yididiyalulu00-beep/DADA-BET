/**
 * Server-Authoritative Wallet & Immutable Ledger Engine
 */
import { UserAccount, WalletLedgerEntry, LedgerTransactionType, SystemAuditLog } from '../src/types/sportsbook';

// Pre-seeded test accounts
export const usersStore: Record<string, UserAccount> = {
  'usr-demo-1': {
    id: 'usr-demo-1',
    username: 'Abebe_Bettor',
    email: 'abebe@dadabet.demo',
    phone: '+251 91 123 4567',
    role: 'USER',
    kycLevel: 'TIER_1_DEMO',
    balance: 2500, // 2,500 ETB Demo Coins
    currency: 'ETB',
    responsibleGambling: {
      dailyDepositLimit: 5000,
      maxSingleStake: 2000,
      selfExcluded: false,
    },
    createdAt: new Date().toISOString(),
  },
  'usr-admin-1': {
    id: 'usr-admin-1',
    username: 'Dada_Admin',
    email: 'admin@dadabet.com',
    phone: '+251 90 000 0001',
    role: 'ADMIN',
    kycLevel: 'TIER_3_ENHANCED',
    balance: 50000,
    currency: 'ETB',
    responsibleGambling: {
      dailyDepositLimit: 100000,
      maxSingleStake: 50000,
      selfExcluded: false,
    },
    createdAt: new Date().toISOString(),
  },
};

// Immutable Ledger Store
export const ledgerStore: WalletLedgerEntry[] = [
  {
    id: 'TXN-GENESIS-01',
    userId: 'usr-demo-1',
    type: 'DEPOSIT_DEMO',
    amount: 2500,
    balanceAfter: 2500,
    referenceId: 'DEMO-SEED-A1',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    description: 'Initial Demo Sandbox Credits Granted',
  },
];

// Audit Log Store
export const auditLogsStore: SystemAuditLog[] = [
  {
    id: 'AUD-001',
    timestamp: new Date().toISOString(),
    actorId: 'SYSTEM',
    action: 'SYSTEM_BOOT',
    entityType: 'SYSTEM',
    entityId: 'DADA-BET-CORE',
    details: 'Sportsbook engine initialized in DEMO SANDBOX MODE',
  },
];

// Processed idempotency keys cache to prevent double-spending or replay attacks
const processedIdempotencyKeys = new Map<string, { result: any; timestamp: number }>();

/**
 * Execute an atomic ledger transaction
 */
export function recordLedgerTransaction(
  userId: string,
  type: LedgerTransactionType,
  amount: number,
  referenceId: string,
  description: string,
  idempotencyKey?: string
): { success: boolean; entry?: WalletLedgerEntry; newBalance?: number; error?: string } {
  // Idempotency check
  if (idempotencyKey && processedIdempotencyKeys.has(idempotencyKey)) {
    const cached = processedIdempotencyKeys.get(idempotencyKey)!;
    return cached.result;
  }

  const user = usersStore[userId];
  if (!user) {
    return { success: false, error: 'User account not found' };
  }

  // Check self exclusion
  if (user.responsibleGambling.selfExcluded) {
    return { success: false, error: 'Account is currently under self-exclusion / time out.' };
  }

  // Calculate new balance
  const projectedBalance = user.balance + amount;
  if (projectedBalance < 0) {
    return {
      success: false,
      error: `Insufficient demo balance. Available: ${user.balance} ETB, Requested: ${Math.abs(amount)} ETB`,
    };
  }

  // Atomic state update
  user.balance = Number(projectedBalance.toFixed(2));

  const entry: WalletLedgerEntry = {
    id: `TXN-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`,
    userId,
    type,
    amount: Number(amount.toFixed(2)),
    balanceAfter: user.balance,
    referenceId,
    timestamp: new Date().toISOString(),
    description,
    idempotencyKey,
  };

  ledgerStore.unshift(entry);

  const result = { success: true, entry, newBalance: user.balance };
  if (idempotencyKey) {
    processedIdempotencyKeys.set(idempotencyKey, { result, timestamp: Date.now() });
  }

  return result;
}

/**
 * Audit log recording
 */
export function recordAuditLog(
  actorId: string,
  action: string,
  entityType: SystemAuditLog['entityType'],
  entityId: string,
  details: string
) {
  const log: SystemAuditLog = {
    id: `AUD-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`,
    timestamp: new Date().toISOString(),
    actorId,
    action,
    entityType,
    entityId,
    details,
  };
  auditLogsStore.unshift(log);
  return log;
}

/**
 * Payment Provider Sandbox Adapter Simulator
 * Documents Telebirr, CBE Birr, Chapa webhook verification interface
 */
export interface PaymentProviderSandboxIntent {
  intentId: string;
  provider: 'TELEBIRR_SANDBOX' | 'CBE_BIRR_SANDBOX' | 'CHAPA_SANDBOX';
  amount: number;
  currency: 'ETB';
  userId: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  signature: string;
  webhookPayload: Record<string, any>;
  createdAt: string;
}

export const paymentIntentsStore: PaymentProviderSandboxIntent[] = [];

export function createSandboxPaymentIntent(
  userId: string,
  provider: 'TELEBIRR_SANDBOX' | 'CBE_BIRR_SANDBOX' | 'CHAPA_SANDBOX',
  amount: number
): PaymentProviderSandboxIntent {
  const intentId = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  // Simulated HMAC-SHA256 signature
  const signature = `sha256_${Buffer.from(`${intentId}:${amount}:sandbox_secret`).toString('base64').slice(0, 24)}`;

  const intent: PaymentProviderSandboxIntent = {
    intentId,
    provider,
    amount,
    currency: 'ETB',
    userId,
    status: 'PENDING',
    signature,
    webhookPayload: {
      provider,
      transactionId: intentId,
      amount,
      currency: 'ETB',
      operatorStatus: 'SANDBOX_SIMULATION_APPROVED',
      timestamp: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
  };

  paymentIntentsStore.unshift(intent);
  return intent;
}
