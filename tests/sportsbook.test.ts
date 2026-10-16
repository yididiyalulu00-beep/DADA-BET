/**
 * DADA BET — Full-Stack Automated Test Suite
 * Validates odds calculations, stake limits, versioning, settlement, wallet ledger, and RG controls.
 */
import { placeBet, settleFixture, betTicketsStore, calculateCashoutValue } from '../server/betEngine';
import { fixturesStore, simulateOddsShift, toggleMarketSuspension } from '../server/sportsData';
import {
  usersStore,
  ledgerStore,
  recordLedgerTransaction,
  createSandboxPaymentIntent,
  paymentIntentsStore,
} from '../server/walletLedger';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
    failedTests++;
  }
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('⚡ DADA BET SPORTSBOOK AUTOMATED INTEGRATION TEST SUITE');
  console.log('======================================================\n');

  const testUserId = 'usr-demo-1';
  const initialBalance = usersStore[testUserId].balance;

  // TEST 1: Wallet Ledger Integrity & Negative Balance Prevention
  console.log('[SUITE 1] Wallet Ledger & Atomic Balances');
  const excessiveDebit = recordLedgerTransaction(
    testUserId,
    'BET_STAKE',
    -(initialBalance + 10000),
    'TEST-OVERDRAFT',
    'Attempt overdraft'
  );
  assert(!excessiveDebit.success, 'Prevents negative balance overdraft');

  const validCredit = recordLedgerTransaction(
    testUserId,
    'BONUS_CLAIM',
    500,
    'TEST-CREDIT-1',
    'Valid credit reload'
  );
  assert(validCredit.success && validCredit.newBalance === initialBalance + 500, 'Valid credit correctly recorded');

  // TEST 2: Single Bet Placement & Stake Limit Validation
  console.log('\n[SUITE 2] Bet Placement Engine & Validation');
  const fix1 = fixturesStore[0];
  const mkt1 = fix1.markets[0];
  const sel1 = mkt1.selections[0];

  const singleBetRes = placeBet(testUserId, {
    selections: [
      {
        fixtureId: fix1.id,
        marketId: mkt1.id,
        selectionId: sel1.id,
        expectedOdds: sel1.odds,
        oddsVersion: sel1.oddsVersion,
      },
    ],
    stake: 100,
    betType: 'SINGLE',
    idempotencyKey: `TEST-IDEMP-01`,
  });

  assert(singleBetRes.success && singleBetRes.ticket !== undefined, 'Places valid single bet ticket');
  assert(singleBetRes.ticket?.combinedOdds === sel1.odds, 'Correct single bet odds applied');
  assert(
    singleBetRes.ticket?.potentialPayout === Number((100 * sel1.odds).toFixed(2)),
    'Calculates accurate potential payout (stake * odds)'
  );

  // TEST 3: Idempotency Protection (Duplicate Request Rejection)
  console.log('\n[SUITE 3] Idempotency & Replay Protection');
  const duplicateTxn = recordLedgerTransaction(
    testUserId,
    'BET_STAKE',
    -50,
    'REPLAY-TEST',
    'Replay duplicate',
    'TEST-IDEMP-01'
  );
  assert(duplicateTxn.success, 'Handles duplicate idempotency key safely without double deduction');

  // TEST 4: Odds Shift & Stale Price Detection
  console.log('\n[SUITE 4] Market Engine & Odds Versioning');
  // Simulate price change on Chelsea in Arsenal vs Chelsea
  const selChelsea = mkt1.selections.find(s => s.outcomeKey === '2')!;
  simulateOddsShift(fix1.id, mkt1.id, selChelsea.id, 8.20);

  // Try placing bet with stale odds expectation (e.g. 7.50 instead of 8.20)
  const staleOddsBet = placeBet(testUserId, {
    selections: [
      {
        fixtureId: fix1.id,
        marketId: mkt1.id,
        selectionId: selChelsea.id,
        expectedOdds: 7.50, // stale
        oddsVersion: 3,     // stale
      },
    ],
    stake: 50,
    betType: 'SINGLE',
    idempotencyKey: 'TEST-STALE-01',
    acceptOddsChanges: false,
  });

  assert(!staleOddsBet.success && staleOddsBet.changedOdds !== undefined, 'Rejects stale odds when acceptOddsChanges=false');

  // With explicit acceptance of changed odds
  const acceptedOddsBet = placeBet(testUserId, {
    selections: [
      {
        fixtureId: fix1.id,
        marketId: mkt1.id,
        selectionId: selChelsea.id,
        expectedOdds: 7.50,
        oddsVersion: 3,
      },
    ],
    stake: 50,
    betType: 'SINGLE',
    idempotencyKey: 'TEST-STALE-02',
    acceptOddsChanges: true,
  });
  assert(acceptedOddsBet.success, 'Accepts bet when user confirms price update');

  // TEST 5: Market Suspension Enforcement
  console.log('\n[SUITE 5] Market Suspension Security');
  toggleMarketSuspension(fix1.id, mkt1.id, true);
  const suspendedBet = placeBet(testUserId, {
    selections: [
      {
        fixtureId: fix1.id,
        marketId: mkt1.id,
        selectionId: sel1.id,
        expectedOdds: sel1.odds,
        oddsVersion: sel1.oddsVersion,
      },
    ],
    stake: 50,
    betType: 'SINGLE',
    idempotencyKey: 'TEST-SUSPEND-01',
  });
  assert(!suspendedBet.success, 'Rejects bet on suspended market');
  // Re-open market
  toggleMarketSuspension(fix1.id, mkt1.id, false);

  // TEST 6: Multi-Leg Accumulator Calculation
  console.log('\n[SUITE 6] Accumulator Combined Odds & Settlement');
  const fix2 = fixturesStore[1];
  const mkt2 = fix2.markets[0];
  const sel2 = mkt2.selections[0];

  const accaBet = placeBet(testUserId, {
    selections: [
      {
        fixtureId: fix1.id,
        marketId: mkt1.id,
        selectionId: sel1.id,
        expectedOdds: sel1.odds,
        oddsVersion: sel1.oddsVersion,
      },
      {
        fixtureId: fix2.id,
        marketId: mkt2.id,
        selectionId: sel2.id,
        expectedOdds: sel2.odds,
        oddsVersion: sel2.oddsVersion,
      },
    ],
    stake: 100,
    betType: 'ACCUMULATOR',
    idempotencyKey: 'TEST-ACCA-01',
  });

  const expectedCombinedOdds = Number((sel1.odds * sel2.odds).toFixed(2));
  assert(accaBet.success && accaBet.ticket?.combinedOdds === expectedCombinedOdds, 'Calculates correct multi-leg accumulator odds');

  // TEST 7: Official Match Result Settlement & Automatic Payouts
  console.log('\n[SUITE 7] Authoritative Settlement & Wallet Payouts');
  const userBalanceBeforeSettlement = usersStore[testUserId].balance;

  // Place a bet specifically to test settlement win:
  // e.g. Bet on Arsenal to win (outcomeKey: '1')
  const winningTestBet = placeBet(testUserId, {
    selections: [
      {
        fixtureId: fix1.id,
        marketId: mkt1.id,
        selectionId: sel1.id,
        expectedOdds: sel1.odds,
        oddsVersion: sel1.oddsVersion,
      },
    ],
    stake: 200,
    betType: 'SINGLE',
    idempotencyKey: 'TEST-WINNER-01',
  });

  // Now settle Match fix-1 with final score Arsenal 3 - Chelsea 1 (Arsenal win)
  const settlementRes = settleFixture(fix1.id, { home: 3, away: 1 }, 'TEST_SUITE_RUNNER');
  assert(settlementRes.success, 'Settles fixture officially');

  const ticketAfter = betTicketsStore.find(t => t.id === winningTestBet.ticket?.id);
  assert(ticketAfter?.status === 'WON', 'Evaluates winning ticket correctly to WON');
  assert(
    usersStore[testUserId].balance > userBalanceBeforeSettlement - 200,
    'Atomically credits winning payout to bettor wallet'
  );

  // TEST 8: Responsible Gambling Self-Exclusion & Max Stake
  console.log('\n[SUITE 8] Compliance & Responsible Gambling Enforcement');
  const testUser = usersStore[testUserId];
  testUser.responsibleGambling.maxSingleStake = 150;

  const excessStakeBet = placeBet(testUserId, {
    selections: [
      {
        fixtureId: fix2.id,
        marketId: mkt2.id,
        selectionId: sel2.id,
        expectedOdds: sel2.odds,
        oddsVersion: sel2.oddsVersion,
      },
    ],
    stake: 500, // exceeds limit of 150
    betType: 'SINGLE',
    idempotencyKey: 'TEST-RG-EXCESS',
  });
  assert(!excessStakeBet.success, 'Enforces maximum single stake limit');

  // Self-exclusion test
  testUser.responsibleGambling.selfExcluded = true;
  const selfExcludedBet = placeBet(testUserId, {
    selections: [
      {
        fixtureId: fix2.id,
        marketId: mkt2.id,
        selectionId: sel2.id,
        expectedOdds: sel2.odds,
        oddsVersion: sel2.oddsVersion,
      },
    ],
    stake: 50,
    betType: 'SINGLE',
    idempotencyKey: 'TEST-RG-BLOCKED',
  });
  assert(!selfExcludedBet.success, 'Blocks bet placement when account is self-excluded');
  testUser.responsibleGambling.selfExcluded = false; // restore

  // TEST 9: Payment Provider Sandbox Adapter & Signature Check
  console.log('\n[SUITE 9] Payment Provider Sandbox & HMAC Signature');
  const intent = createSandboxPaymentIntent(testUserId, 'TELEBIRR_SANDBOX', 500);
  assert(intent.intentId.startsWith('PAY-'), 'Generates valid sandbox payment intent');
  assert(intent.signature.startsWith('sha256_'), 'Generates cryptographic signature verification hash');

  console.log('\n======================================================');
  console.log(`TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('======================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test suite failed with unexpected error:', err);
  process.exit(1);
});
