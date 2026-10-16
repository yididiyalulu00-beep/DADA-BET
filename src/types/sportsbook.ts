/**
 * DADA BET — Sportsbook Types and Domain Interfaces
 */

export type SportId = 'football' | 'basketball' | 'tennis';

export interface Sport {
  id: SportId;
  name: string;
  nameAm: string;
  icon: string;
  activeFixturesCount: number;
}

export interface League {
  id: string;
  sportId: SportId;
  name: string;
  nameAm: string;
  country: string;
  countryCode: string;
  priority: number;
}

export interface Team {
  id: string;
  name: string;
  nameAm: string;
  shortCode: string;
  badgeEmoji: string;
  primaryColor?: string;
}

export type MarketType =
  | '1X2'
  | 'DOUBLE_CHANCE'
  | 'OVER_UNDER'
  | 'BTTS'
  | 'CORRECT_SCORE';

export interface MarketSelection {
  id: string;
  outcomeKey: string; // '1', 'X', '2', '1X', '12', 'X2', 'OVER', 'UNDER', 'YES', 'NO', '2-1', etc.
  label: string;
  labelAm: string;
  odds: number;
  previousOdds?: number;
  suspended: boolean;
  oddsVersion: number;
  updatedAt: string;
}

export interface Market {
  id: string;
  type: MarketType;
  name: string;
  nameAm: string;
  specifier?: string; // e.g. "2.5" for Over/Under 2.5
  status: 'OPEN' | 'SUSPENDED' | 'SETTLED' | 'VOID';
  selections: MarketSelection[];
  winningOutcomeKey?: string;
}

export type MatchStatus =
  | 'PRE_MATCH'
  | 'LIVE'
  | 'HALFTIME'
  | 'FINISHED'
  | 'POSTPONED'
  | 'CANCELLED';

export interface FixtureScore {
  home: number;
  away: number;
}

export interface MatchStats {
  possession: [number, number]; // [home, away] %
  shotsOnTarget: [number, number];
  corners: [number, number];
  yellowCards: [number, number];
  redCards: [number, number];
}

export interface Fixture {
  id: string;
  sportId: SportId;
  leagueId: string;
  leagueName: string;
  leagueNameAm: string;
  homeTeam: Team;
  awayTeam: Team;
  kickoffTime: string;
  status: MatchStatus;
  minute?: number;
  currentScore: FixtureScore;
  halfTimeScore?: FixtureScore;
  stats?: MatchStats;
  markets: Market[];
  isFeatured?: boolean;
  providerId: string; // e.g. "FEED-SPORT-RADAR-SIM"
  lastUpdated: string;
}

export interface BetSelection {
  fixtureId: string;
  fixtureName: string;
  marketId: string;
  marketType: MarketType;
  marketName: string;
  selectionId: string;
  outcomeKey: string;
  selectionLabel: string;
  oddsAtPlacement: number;
  oddsVersion: number;
  currentOdds?: number;
  isSuspended?: boolean;
}

export type BetSlipItem = BetSelection;

export type BetTicketStatus = 'PENDING' | 'WON' | 'LOST' | 'VOID' | 'CANCELLED';
export type BetType = 'SINGLE' | 'ACCUMULATOR';

export interface BetTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  betType: BetType;
  selections: BetSelection[];
  stake: number;
  combinedOdds: number;
  estimatedReturn: number;
  potentialPayout: number;
  status: BetTicketStatus;
  payoutAmount?: number;
  placedAt: string;
  settledAt?: string;
  settlementNotes?: string;
  idempotencyKey: string;
  isDemo: boolean;
}

export type LedgerTransactionType =
  | 'DEPOSIT_DEMO'
  | 'BET_STAKE'
  | 'BET_PAYOUT'
  | 'CASHOUT_PAYOUT'
  | 'BONUS_CLAIM'
  | 'ADMIN_ADJUSTMENT';

export interface WalletLedgerEntry {
  id: string;
  userId: string;
  type: LedgerTransactionType;
  amount: number; // positive for credits, negative for debits
  balanceAfter: number;
  referenceId: string; // Bet ID or Payment ID
  timestamp: string;
  description: string;
  idempotencyKey?: string;
}

export type KYCLevel = 'TIER_1_DEMO' | 'TIER_2_VERIFIED' | 'TIER_3_ENHANCED';

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: 'USER' | 'ADMIN' | 'COMPLIANCE_OFFICER';
  kycLevel: KYCLevel;
  balance: number;
  currency: 'ETB';
  responsibleGambling: {
    dailyDepositLimit: number;
    maxSingleStake: number;
    timeoutUntil?: string;
    selfExcluded: boolean;
  };
  createdAt: string;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  action: string;
  entityType: 'BET' | 'FIXTURE' | 'WALLET' | 'LIMIT' | 'SYSTEM';
  entityId: string;
  details: string;
}

export interface PlaceBetRequest {
  selections: Array<{
    fixtureId: string;
    marketId: string;
    selectionId: string;
    expectedOdds: number;
    oddsVersion: number;
  }>;
  stake: number;
  betType: BetType;
  idempotencyKey: string;
  acceptOddsChanges?: boolean;
}

export interface PlaceBetResponse {
  success: boolean;
  ticket?: BetTicket;
  newBalance?: number;
  error?: string;
  changedOdds?: Array<{
    selectionId: string;
    oldOdds: number;
    newOdds: number;
  }>;
}
