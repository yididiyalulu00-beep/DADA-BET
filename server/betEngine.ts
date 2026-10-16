/**
 * DADA BET — Server-Authoritative Bet Placement & Settlement Engine
 */
import {
  BetTicket,
  BetSelection,
  PlaceBetRequest,
  PlaceBetResponse,
} from '../src/types/sportsbook';
import { fixturesStore } from './sportsData';
import { usersStore, recordLedgerTransaction, recordAuditLog } from './walletLedger';

export const betTicketsStore: BetTicket[] = [];

/**
 * Place a bet ticket with strict server verification
 */
export function placeBet(userId: string, req: PlaceBetRequest): PlaceBetResponse {
  const user = usersStore[userId];
  if (!user) {
    return { success: false, error: 'User account not found' };
  }

  // 1. Validate Responsible Gambling & Limits
  if (user.responsibleGambling.selfExcluded) {
    return { success: false, error: 'Bet placement blocked: Account is currently self-excluded.' };
  }
  if (req.stake <= 0) {
    return { success: false, error: 'Stake must be greater than zero.' };
  }
  if (req.stake > user.responsibleGambling.maxSingleStake) {
    return {
      success: false,
      error: `Stake exceeds your maximum single stake limit of ${user.responsibleGambling.maxSingleStake} ETB. Adjust in Responsible Gambling settings.`,
    };
  }
  if (user.balance < req.stake) {
    return {
      success: false,
      error: `Insufficient demo balance. Available: ${user.balance} ETB, Required: ${req.stake} ETB`,
    };
  }

  if (!req.selections || req.selections.length === 0) {
    return { success: false, error: 'No selections provided.' };
  }

  // Prevent duplicate selections on the same fixture (unless operator allows Same Game Parlays)
  const fixtureIds = req.selections.map(s => s.fixtureId);
  const uniqueFixtures = new Set(fixtureIds);
  if (req.betType === 'ACCUMULATOR' && uniqueFixtures.size !== fixtureIds.length) {
    return { success: false, error: 'Multiple selections from the same match are not eligible for standard accumulators.' };
  }

  const validatedSelections: BetSelection[] = [];
  const changedOdds: Array<{ selectionId: string; oldOdds: number; newOdds: number }> = [];

  // 2. Validate every selection against authoritative live server data
  for (const selReq of req.selections) {
    const fixture = fixturesStore.find(f => f.id === selReq.fixtureId);
    if (!fixture) {
      return { success: false, error: `Match ${selReq.fixtureId} is no longer available.` };
    }
    if (fixture.status === 'FINISHED' || fixture.status === 'CANCELLED') {
      return { success: false, error: `Match ${fixture.homeTeam.name} vs ${fixture.awayTeam.name} has concluded.` };
    }

    const market = fixture.markets.find(m => m.id === selReq.marketId);
    if (!market) {
      return { success: false, error: `Market is no longer available on ${fixture.homeTeam.name} vs ${fixture.awayTeam.name}.` };
    }
    if (market.status !== 'OPEN') {
      return { success: false, error: `Market "${market.name}" is currently suspended.` };
    }

    const liveSelection = market.selections.find(s => s.id === selReq.selectionId);
    if (!liveSelection) {
      return { success: false, error: `Selection not found in market.` };
    }
    if (liveSelection.suspended) {
      return { success: false, error: `Selection "${liveSelection.label}" is suspended from betting.` };
    }

    // 3. Check for odds shift / version mismatch
    if (liveSelection.odds !== selReq.expectedOdds || liveSelection.oddsVersion !== selReq.oddsVersion) {
      changedOdds.push({
        selectionId: selReq.selectionId,
        oldOdds: selReq.expectedOdds,
        newOdds: liveSelection.odds,
      });
    }

    validatedSelections.push({
      fixtureId: fixture.id,
      fixtureName: `${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`,
      marketId: market.id,
      marketType: market.type,
      marketName: market.name,
      selectionId: liveSelection.id,
      outcomeKey: liveSelection.outcomeKey,
      selectionLabel: liveSelection.label,
      oddsAtPlacement: liveSelection.odds,
      oddsVersion: liveSelection.oddsVersion,
      currentOdds: liveSelection.odds,
    });
  }

  // If odds shifted and user hasn't explicitly authorized odds changes
  if (changedOdds.length > 0 && !req.acceptOddsChanges) {
    return {
      success: false,
      error: 'Odds on one or more selections have changed.',
      changedOdds,
    };
  }

  // 4. Calculate Combined Odds & Returns
  // Formula: stake * combined decimal odds
  let combinedOdds = 1.0;
  for (const sel of validatedSelections) {
    combinedOdds *= sel.oddsAtPlacement;
  }
  // Round combined odds to 2 decimal places for single, 3 for multi
  combinedOdds = Number(combinedOdds.toFixed(2));
  const estimatedReturn = Number((req.stake * combinedOdds).toFixed(2));

  // 5. Generate Ticket Number & Atomic Ledger Debit
  const ticketId = `TKT-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`;
  const ticketNumber = `DB-${Math.floor(Math.random() * 89999 + 10000)}`;

  const ledgerResult = recordLedgerTransaction(
    userId,
    'BET_STAKE',
    -req.stake,
    ticketId,
    `Stake on ${req.betType === 'ACCUMULATOR' ? `${validatedSelections.length}-Leg Acca` : validatedSelections[0]?.selectionLabel} (Ticket #${ticketNumber})`,
    req.idempotencyKey
  );

  if (!ledgerResult.success) {
    return { success: false, error: ledgerResult.error || 'Failed to reserve demo stake' };
  }

  const ticket: BetTicket = {
    id: ticketId,
    ticketNumber,
    userId,
    betType: req.betType,
    selections: validatedSelections,
    stake: req.stake,
    combinedOdds,
    estimatedReturn,
    potentialPayout: estimatedReturn,
    status: 'PENDING',
    placedAt: new Date().toISOString(),
    idempotencyKey: req.idempotencyKey,
    isDemo: true,
  };

  betTicketsStore.unshift(ticket);

  recordAuditLog(
    userId,
    'PLACE_BET',
    'BET',
    ticketId,
    `Placed ${req.betType} ticket #${ticketNumber} for stake ${req.stake} ETB with combined odds ${combinedOdds}`
  );

  return {
    success: true,
    ticket,
    newBalance: ledgerResult.newBalance,
  };
}

/**
 * Authoritative Match Settlement Engine
 * Calculates market outcomes from verified match scores and settles all tickets atomically
 */
export function settleFixture(
  fixtureId: string,
  finalScore: { home: number; away: number },
  actorId: string = 'ADMIN_SETTLEMENT_CONSOLE'
) {
  const fixture = fixturesStore.find(f => f.id === fixtureId);
  if (!fixture) return { success: false, error: 'Fixture not found' };

  fixture.status = 'FINISHED';
  fixture.currentScore = finalScore;
  fixture.minute = 90;

  const totalGoals = finalScore.home + finalScore.away;
  const matchResult1X2 = finalScore.home > finalScore.away ? '1' : finalScore.home === finalScore.away ? 'X' : '2';

  // Mark all fixture markets with winning outcomes
  for (const mkt of fixture.markets) {
    mkt.status = 'SETTLED';
    if (mkt.type === '1X2') {
      mkt.winningOutcomeKey = matchResult1X2;
    } else if (mkt.type === 'DOUBLE_CHANCE') {
      if (matchResult1X2 === '1') mkt.winningOutcomeKey = '1X'; // or '12'
      else if (matchResult1X2 === 'X') mkt.winningOutcomeKey = '1X'; // or 'X2'
      else mkt.winningOutcomeKey = 'X2'; // or '12'
    } else if (mkt.type === 'OVER_UNDER') {
      const threshold = parseFloat(mkt.specifier || '2.5');
      mkt.winningOutcomeKey = totalGoals > threshold ? 'OVER' : 'UNDER';
    } else if (mkt.type === 'BTTS') {
      mkt.winningOutcomeKey = (finalScore.home > 0 && finalScore.away > 0) ? 'YES' : 'NO';
    } else if (mkt.type === 'CORRECT_SCORE') {
      mkt.winningOutcomeKey = `${finalScore.home}-${finalScore.away}`;
    }
  }

  // Find all pending tickets that include this fixture
  let settledTicketsCount = 0;
  let totalPayoutAmount = 0;

  for (const ticket of betTicketsStore) {
    if (ticket.status !== 'PENDING') continue;

    // Check if this ticket contains selections from this fixture
    const fixtureSelections = ticket.selections.filter(s => s.fixtureId === fixtureId);
    if (fixtureSelections.length === 0) continue;

    // Evaluate each selection on this fixture
    let hasLoss = false;
    let allLegsWon = true;

    for (const sel of ticket.selections) {
      const legFixture = fixturesStore.find(f => f.id === sel.fixtureId);
      if (!legFixture || legFixture.status !== 'FINISHED') {
        allLegsWon = false; // still waiting on another leg
        continue;
      }

      const legMarket = legFixture.markets.find(m => m.id === sel.marketId);
      if (!legMarket || !legMarket.winningOutcomeKey) {
        allLegsWon = false;
        continue;
      }

      // Check win condition
      const isWinner = checkSelectionWon(sel.marketType, sel.outcomeKey, legMarket.winningOutcomeKey, legFixture.currentScore);
      if (!isWinner) {
        hasLoss = true;
        allLegsWon = false;
        break;
      }
    }

    if (hasLoss) {
      ticket.status = 'LOST';
      ticket.settledAt = new Date().toISOString();
      ticket.settlementNotes = `Settled as LOST after ${fixture.homeTeam.name} vs ${fixture.awayTeam.name} ended ${finalScore.home}-${finalScore.away}`;
      settledTicketsCount++;
    } else if (allLegsWon) {
      ticket.status = 'WON';
      ticket.settledAt = new Date().toISOString();
      ticket.payoutAmount = ticket.potentialPayout;
      ticket.settlementNotes = `Settled as WON! Final result: ${finalScore.home}-${finalScore.away}`;

      // Credit payout to user wallet atomically via ledger!
      recordLedgerTransaction(
        ticket.userId,
        'BET_PAYOUT',
        ticket.potentialPayout,
        ticket.id,
        `Winning Payout for Ticket #${ticket.ticketNumber} (${ticket.betType})`
      );

      totalPayoutAmount += ticket.potentialPayout;
      settledTicketsCount++;
    }
  }

  recordAuditLog(
    actorId,
    'SETTLE_FIXTURE',
    'FIXTURE',
    fixtureId,
    `Fixture settled with score ${finalScore.home}-${finalScore.away}. Settled ${settledTicketsCount} tickets, total payout: ${totalPayoutAmount} ETB.`
  );

  return {
    success: true,
    settledTicketsCount,
    totalPayoutAmount,
    fixture,
  };
}

function checkSelectionWon(
  marketType: string,
  selectionOutcomeKey: string,
  winningOutcomeKey: string,
  score: { home: number; away: number }
): boolean {
  if (marketType === 'DOUBLE_CHANCE') {
    const result = score.home > score.away ? '1' : score.home === score.away ? 'X' : '2';
    if (selectionOutcomeKey === '1X') return result === '1' || result === 'X';
    if (selectionOutcomeKey === '12') return result === '1' || result === '2';
    if (selectionOutcomeKey === 'X2') return result === 'X' || result === '2';
  }
  return selectionOutcomeKey === winningOutcomeKey;
}

/**
 * Calculate dynamic cashout value for an open ticket
 */
export function calculateCashoutValue(ticket: BetTicket): number | null {
  if (ticket.status !== 'PENDING') return null;

  let currentCombinedProb = 1.0;
  for (const sel of ticket.selections) {
    const fixture = fixturesStore.find(f => f.id === sel.fixtureId);
    if (!fixture) return null;
    const market = fixture.markets.find(m => m.id === sel.marketId);
    if (!market || market.status === 'SUSPENDED') return null;
    const liveSel = market.selections.find(s => s.id === sel.selectionId);
    if (!liveSel || liveSel.suspended) return null;

    // Probability estimate based on 1 / odds
    currentCombinedProb *= (1 / liveSel.odds);
  }

  // Cashout formula with 8% operator margin: Stake * initialOdds * liveProbability * 0.92
  const fairValue = ticket.stake * ticket.combinedOdds * currentCombinedProb * 0.92;
  const clampedValue = Math.min(ticket.potentialPayout * 0.95, Math.max(ticket.stake * 0.2, fairValue));
  return Number(clampedValue.toFixed(2));
}

/**
 * Execute early cashout
 */
export function cashoutTicket(userId: string, ticketId: string) {
  const ticket = betTicketsStore.find(t => t.id === ticketId && t.userId === userId);
  if (!ticket) return { success: false, error: 'Ticket not found' };
  if (ticket.status !== 'PENDING') return { success: false, error: 'Ticket is already settled' };

  const cashoutAmount = calculateCashoutValue(ticket);
  if (!cashoutAmount || cashoutAmount <= 0) {
    return { success: false, error: 'Cash out is temporarily unavailable for this ticket' };
  }

  ticket.status = 'WON';
  ticket.payoutAmount = cashoutAmount;
  ticket.settledAt = new Date().toISOString();
  ticket.settlementNotes = `Cashed out early for ${cashoutAmount} ETB`;

  recordLedgerTransaction(
    userId,
    'CASHOUT_PAYOUT',
    cashoutAmount,
    ticket.id,
    `Early Cash Out for Ticket #${ticket.ticketNumber}`
  );

  return { success: true, cashoutAmount, ticket };
}
