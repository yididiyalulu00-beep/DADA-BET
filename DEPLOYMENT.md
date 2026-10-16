# DADA BET — Full-Stack Sportsbook Platform Architecture & Deployment

This document provides production readiness guidelines, database architecture, security controls, and regulatory compliance requirements for **DADA BET**.

---

## 1. Regulatory Sandbox Status (Current Mode)

The platform is running in **DEMO SANDBOX MODE**. 
- Real-money betting, real cash deposits, credit card processing, and live bank withdrawals are disabled by design.
- All bet tickets and wallet ledger records operate on simulated demo units (`ETB Demo Coins`).
- No genuine live sports data feed is claimed; data is clearly identified as `SPORT_DATA_FEED_SIM_01`.
- Transitioning to production real money requires operator gaming licensing approval, National Lottery Administration / Regulatory Authority certification, and KYC/AML verification.

---

## 2. Server Architecture & Data Model

### Collections / Tables
1. **users**: Account identity, contact info, credential hashes (Argon2/bcrypt in production), user role (`USER`, `ADMIN`, `COMPLIANCE_OFFICER`).
2. **userProfiles & verificationRecords**: Identity documents, Tier 1/2/3 KYC status, age verification flag (18+), residency verification.
3. **sports & leagues**: Supported sports (Football, Basketball, Tennis) and leagues (EPL, La Liga, Serie A, Bundesliga, Champions League, Ethiopian Premier League).
4. **events / fixtures**: Kickoff time, match status (`PRE_MATCH`, `LIVE`, `HALFTIME`, `FINISHED`), live score, match statistics, data provider source ID.
5. **markets**: 1X2, Double Chance, Over/Under Goals, BTTS, Correct Score, market status (`OPEN`, `SUSPENDED`, `SETTLED`), winning outcome key.
6. **oddsSnapshots**: Immutable historical odds record with timestamps and version numbers (`oddsVersion`).
7. **betTickets & betSelections**: Unique ticket number (`DB-xxxxx`), selections array, stake, combined odds, potential payout, ticket status (`PENDING`, `WON`, `LOST`, `VOID`), settlement timestamp, payout amount.
8. **walletLedger**: Server-authoritative append-only immutable ledger. Entries contain `TXN-ID`, `userId`, `type` (`DEPOSIT_DEMO`, `BET_STAKE`, `BET_PAYOUT`, `CASHOUT_PAYOUT`, `BONUS_CLAIM`), `amount`, `balanceAfter`, `referenceId`, and timestamp.
9. **paymentIntents & paymentWebhookEvents**: Provider ID (`TELEBIRR`, `CBE_BIRR`, `CHAPA`), cryptographic signature, idempotency key, webhook replay tracking.
10. **responsibleGamblingLimits**: Daily deposit limit, maximum single stake limit, timeout expiration, self-exclusion flag.
11. **systemAuditLogs**: Tamper-evident actor-action-entity audit log trail.

---

## 3. Environment Variables (`.env.example`)

```bash
# Server Runtime
PORT=3000
NODE_ENV=production

# App Hosting URL
APP_URL="https://your-domain.com"

# Authorized Sports Data Provider (e.g. Sportradar, BetGenius, LiveScore)
SPORTS_DATA_API_KEY="YOUR_SPORTS_DATA_API_KEY"
SPORTS_DATA_API_URL="https://api.sportradar.com/v4"

# Payment Gateways (Ethiopian & International Sandboxes)
TELEBIRR_APP_ID="YOUR_TELEBIRR_APP_ID"
TELEBIRR_APP_KEY="YOUR_TELEBIRR_APP_KEY"
TELEBIRR_PUBLIC_KEY="YOUR_TELEBIRR_PUBLIC_KEY"
TELEBIRR_NOTIFY_URL="https://your-domain.com/api/payment-providers/telebirr/webhook"

CBE_BIRR_MERCHANT_ID="YOUR_CBE_BIRR_MERCHANT_ID"
CBE_BIRR_API_SECRET="YOUR_CBE_BIRR_SECRET"

# JWT / Session Secrets
SESSION_SECRET="GENERATE_HIGH_ENTROPY_RANDOM_SECRET_KEY_64_CHARS"
ADMIN_MFA_ENFORCED=true
```

---

## 4. Security & Concurrency Safeguards

1. **Server-Authoritative Balances**: The client never calculates or sends balances. All balances are derived by the server-side ledger.
2. **Double Spending & Concurrency**: Atomic operations ensure that pending stakes are reserved before tickets are issued. If account balance is insufficient, bet placement is rejected with 400.
3. **Odds Versioning & Stale Price Protection**: If live odds shift between when a user adds a match to the slip and clicks "Place Bet", the server detects the `oddsVersion` mismatch and halts placement until the user explicitly accepts updated odds.
4. **Idempotency Keys**: Every bet placement request requires a client-generated UUID/idempotency key (`idempotencyKey`). Duplicate transmissions (e.g. network retries) yield the cached ticket rather than deducting funds twice.
5. **HMAC Webhook Verification**: Provider callbacks (Telebirr/CBE) require cryptographic signature validation before ledger credits are applied.

---

## 5. Deployment Checklist Before Production Go-Live

- [ ] Complete jurisdictional licensing application with the relevant Gaming Board / National Lottery Administration.
- [ ] Contract with an authorized commercial live sports data provider with guaranteed low-latency WebSockets.
- [ ] Implement production KYC identity document scanning and AML sanctions checks (e.g., Sumsub or Persona).
- [ ] Execute formal contracts and production API credentials with Telebirr, Commercial Bank of Ethiopia (CBE Birr), and Chapa.
- [ ] Complete independent CREST-certified third-party penetration testing.
- [ ] Enforce automated continuous database backups with point-in-time recovery (PITR) to Cloud Storage.
- [ ] Establish 24/7 problem gambling helpline integrations and self-exclusion database synchronization.
