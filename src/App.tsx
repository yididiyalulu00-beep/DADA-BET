import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HeroBanner } from './components/HeroBanner';
import { LeagueFilter } from './components/LeagueFilter';
import { MatchCard } from './components/MatchCard';
import { MatchDetailsModal } from './components/MatchDetailsModal';
import { BetSlip } from './components/BetSlip';
import { MyBetsModal } from './components/MyBetsModal';
import { WalletModal } from './components/WalletModal';
import { AdminConsole } from './components/AdminConsole';
import { ResponsibleGamblingModal } from './components/ResponsibleGamblingModal';
import { AuthModal } from './components/AuthModal';
import {
  Fixture,
  League,
  Sport,
  MarketSelection,
  BetSlipItem,
  BetTicket,
  BetType,
  UserAccount,
  WalletLedgerEntry,
  SystemAuditLog,
} from './types/sportsbook';
import { Language, getTranslation } from './utils/i18n';
import { Trophy, Radio, Shield, Sparkles, AlertCircle } from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [currentTab, setCurrentTab] = useState<string>('home');

  // Core Data
  const [sports, setSports] = useState<Sport[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [selectedSportId, setSelectedSportId] = useState<string>('football');
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // User & Wallet
  const [user, setUser] = useState<UserAccount | null>(null);
  const [ledger, setLedger] = useState<WalletLedgerEntry[]>([]);
  const [myTickets, setMyTickets] = useState<(BetTicket & { cashoutValue?: number | null })[]>([]);

  // Bet Slip Items
  const [betSlipItems, setBetSlipItems] = useState<BetSlipItem[]>([]);
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  // Modals
  const [activeModal, setActiveModal] = useState<
    'NONE' | 'MATCH_DETAILS' | 'MY_BETS' | 'WALLET' | 'ADMIN' | 'RG' | 'AUTH' | 'MOBILE_BETSLIP'
  >('NONE');
  const [selectedFixtureForDetails, setSelectedFixtureForDetails] = useState<Fixture | null>(null);

  // Admin Metrics
  const [adminMetrics, setAdminMetrics] = useState({
    totalBetsPlaced: 0,
    totalStakeVolume: 0,
    totalPayouts: 0,
    grossGamingRevenue: 0,
    pendingTickets: 0,
    activeUsers: 2,
    feedStatus: 'ONLINE_ACTIVE',
    environment: 'SANDBOX_DEMO_MODE',
  });
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>([]);

  const t = (k: string) => getTranslation(k, language);

  // Fetch initial sportsbook state
  const loadInitialData = useCallback(async () => {
    try {
      const [sportsRes, leaguesRes, fixturesRes] = await Promise.all([
        fetch('/api/sports').then(r => r.json()),
        fetch('/api/leagues').then(r => r.json()),
        fetch('/api/fixtures').then(r => r.json()),
      ]);

      if (sportsRes.success) setSports(sportsRes.sports);
      if (leaguesRes.success) setLeagues(leaguesRes.leagues);
      if (fixturesRes.success) setFixtures(fixturesRes.fixtures);
    } catch (e) {
      console.error('Failed to load sportsbook initial state', e);
    }
  }, []);

  // Fetch User profile & wallet
  const loadUserData = useCallback(async (userId = 'usr-demo-1') => {
    try {
      const [userRes, ledgerRes, ticketsRes] = await Promise.all([
        fetch(`/api/auth/me?userId=${userId}`).then(r => r.json()),
        fetch(`/api/wallet/ledger?userId=${userId}`).then(r => r.json()),
        fetch(`/api/bets/history?userId=${userId}`).then(r => r.json()),
      ]);

      if (userRes.success) setUser(userRes.user);
      if (ledgerRes.success) setLedger(ledgerRes.ledger);
      if (ticketsRes.success) setMyTickets(ticketsRes.tickets);
    } catch (e) {
      console.error('Failed to load user state', e);
    }
  }, []);

  // Fetch Admin metrics
  const loadAdminMetrics = useCallback(async () => {
    try {
      const [metricRes, logsRes] = await Promise.all([
        fetch('/api/admin/metrics').then(r => r.json()),
        fetch('/api/admin/audit-logs').then(r => r.json()),
      ]);

      if (metricRes.success) setAdminMetrics(metricRes.metrics);
      if (logsRes.success) setAuditLogs(logsRes.auditLogs);
    } catch (e) {
      console.error('Failed to load admin metrics', e);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
    loadUserData();
    loadAdminMetrics();

    // Auto-refresh live scores and odds every 12 seconds
    const interval = setInterval(() => {
      fetch('/api/fixtures')
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setFixtures(data.fixtures);
          }
        })
        .catch(() => {});
    }, 12000);

    return () => clearInterval(interval);
  }, [loadInitialData, loadUserData, loadAdminMetrics]);

  // Odds Selection Toggle
  const handleSelectOdds = (fixture: Fixture, marketId: string, selection: MarketSelection) => {
    const market = fixture.markets.find(m => m.id === marketId);
    if (!market) return;

    setBetSlipItems(prev => {
      // If already selected, remove it
      const exists = prev.find(item => item.selectionId === selection.id);
      if (exists) {
        return prev.filter(item => item.selectionId !== selection.id);
      }

      // If selection from same market exists, replace it
      const filtered = prev.filter(item => item.marketId !== marketId);

      const newItem: BetSlipItem = {
        fixtureId: fixture.id,
        fixtureName: `${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`,
        marketId: market.id,
        marketType: market.type,
        marketName: market.name,
        selectionId: selection.id,
        outcomeKey: selection.outcomeKey,
        selectionLabel: selection.label,
        oddsAtPlacement: selection.odds,
        oddsVersion: selection.oddsVersion,
        currentOdds: selection.odds,
      };

      return [...filtered, newItem];
    });
  };

  const handleRemoveBetSlipItem = (selectionId: string) => {
    setBetSlipItems(prev => prev.filter(item => item.selectionId !== selectionId));
  };

  const handleClearAllBetSlip = () => {
    setBetSlipItems([]);
  };

  // Submit Bet placement to server
  const handlePlaceBet = async (stake: number, betType: BetType, acceptOddsChanges: boolean) => {
    setIsPlacingBet(true);
    try {
      const idempotencyKey = `IDEMP-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
      const payload = {
        userId: user?.id || 'usr-demo-1',
        selections: betSlipItems.map(item => ({
          fixtureId: item.fixtureId,
          marketId: item.marketId,
          selectionId: item.selectionId,
          expectedOdds: item.oddsAtPlacement,
          oddsVersion: item.oddsVersion,
        })),
        stake,
        betType,
        idempotencyKey,
        acceptOddsChanges,
      };

      const res = await fetch('/api/bets/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        // Clear bet slip on successful placement
        setBetSlipItems([]);
        // Reload wallet & tickets
        if (user) loadUserData(user.id);
        loadAdminMetrics();
        return { success: true, ticket: data.ticket };
      } else if (data.changedOdds) {
        // Update local items with changed odds
        setBetSlipItems(prev =>
          prev.map(item => {
            const shift = data.changedOdds.find((c: any) => c.selectionId === item.selectionId);
            return shift ? { ...item, oddsAtPlacement: shift.newOdds } : item;
          })
        );
        return { success: false, changedOdds: data.changedOdds, error: data.error };
      } else {
        return { success: false, error: data.error };
      }
    } catch (e: any) {
      return { success: false, error: e.message || 'Server connection error' };
    } finally {
      setIsPlacingBet(false);
    }
  };

  // Early Cash Out Trigger
  const handleCashout = async (ticketId: string) => {
    if (!user) return;
    try {
      const res = await fetch('/api/bets/cashout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ticketId }),
      });
      const data = await res.json();
      if (data.success) {
        loadUserData(user.id);
        loadAdminMetrics();
      }
    } catch (e) {
      console.error('Failed to cash out', e);
    }
  };

  // Claim Test Credits
  const handleClaimCredits = async (amount: number) => {
    if (!user) return;
    try {
      const res = await fetch('/api/wallet/claim-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, amount }),
      });
      const data = await res.json();
      if (data.success) {
        loadUserData(user.id);
        loadAdminMetrics();
      }
    } catch (e) {
      console.error('Failed to claim credits', e);
    }
  };

  // Payment Sandbox Webhook Simulation
  const handleTriggerPaymentSandbox = async (
    provider: 'TELEBIRR_SANDBOX' | 'CBE_BIRR_SANDBOX',
    amount: number
  ) => {
    if (!user) return;
    try {
      // 1. Create intent
      const intentRes = await fetch('/api/payment-providers/sandbox/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, provider, amount }),
      }).then(r => r.json());

      if (intentRes.success && intentRes.intent) {
        // 2. Trigger verified webhook
        await fetch('/api/payment-providers/sandbox/webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            intentId: intentRes.intent.intentId,
            signature: intentRes.intent.signature,
          }),
        });

        loadUserData(user.id);
        loadAdminMetrics();
      }
    } catch (e) {
      console.error('Failed to trigger payment sandbox', e);
    }
  };

  // Admin Settle Fixture
  const handleSettleFixture = async (fixtureId: string, homeScore: number, awayScore: number) => {
    try {
      const res = await fetch('/api/admin/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fixtureId, homeScore, awayScore, actorId: user?.id || 'admin' }),
      });
      const data = await res.json();
      if (data.success) {
        loadInitialData();
        if (user) loadUserData(user.id);
        loadAdminMetrics();
      }
      return data;
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  // Admin Update Odds
  const handleUpdateOdds = async (fixtureId: string, marketId: string, selectionId: string, newOdds: number) => {
    try {
      await fetch('/api/admin/odds/shift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fixtureId, marketId, selectionId, newOdds }),
      });
      loadInitialData();
    } catch (e) {
      console.error(e);
    }
  };

  // Admin Toggle Suspension
  const handleToggleMarketSuspension = async (fixtureId: string, marketId: string, suspended?: boolean) => {
    try {
      await fetch('/api/admin/markets/toggle-suspend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fixtureId, marketId, suspended }),
      });
      loadInitialData();
    } catch (e) {
      console.error(e);
    }
  };

  // Admin Live Score Update
  const handleUpdateLiveMatch = async (
    fixtureId: string,
    homeScore: number,
    awayScore: number,
    minute: number,
    status?: Fixture['status']
  ) => {
    try {
      await fetch('/api/admin/fixtures/live-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fixtureId, homeScore, awayScore, minute, status }),
      });
      loadInitialData();
    } catch (e) {
      console.error(e);
    }
  };

  // Responsible Gambling Limits Update
  const handleUpdateLimits = async (
    dailyDepositLimit: number,
    maxSingleStake: number,
    selfExcluded: boolean
  ) => {
    if (!user) return;
    try {
      const res = await fetch('/api/compliance/limits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          dailyDepositLimit,
          maxSingleStake,
          selfExcluded,
        }),
      });
      const data = await res.json();
      if (data.success) {
        loadUserData(user.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Login Handler
  const handleLogin = async (email: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        loadUserData(data.user.id);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  // Register Handler
  const handleRegister = async (
    username: string,
    email: string,
    phone: string,
    ageConfirmed: boolean
  ) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, phone, ageConfirmed }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        loadUserData(data.user.id);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  // Filtering Logic
  const filteredFixtures = fixtures.filter(f => {
    if (selectedLeagueId !== 'ALL' && f.leagueId !== selectedLeagueId) return false;
    if (selectedStatus === 'LIVE' && f.status !== 'LIVE' && f.status !== 'HALFTIME') return false;
    if (selectedStatus === 'PRE_MATCH' && f.status !== 'PRE_MATCH') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchHome = f.homeTeam.name.toLowerCase().includes(q);
      const matchAway = f.awayTeam.name.toLowerCase().includes(q);
      const matchLeague = f.leagueName.toLowerCase().includes(q);
      if (!matchHome && !matchAway && !matchLeague) return false;
    }
    return true;
  });

  const featuredFixtures = fixtures.filter(f => f.isFeatured);
  const selectedSelectionIds = new Set(betSlipItems.map(item => item.selectionId));
  const activeBetsCount = myTickets.filter(t => t.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-[#080d14] text-slate-100 flex flex-col pb-16 lg:pb-0">
      {/* Top Navigation */}
      <Navbar
        user={user}
        language={language}
        onLanguageChange={setLanguage}
        onOpenWallet={() => setActiveModal('WALLET')}
        onOpenMyBets={() => setActiveModal('MY_BETS')}
        onOpenAdmin={() => setActiveModal('ADMIN')}
        onOpenAuth={() => setActiveModal('AUTH')}
        onOpenRG={() => setActiveModal('RG')}
        onOpenBetSlip={() => setActiveModal('MOBILE_BETSLIP')}
        activeBetsCount={activeBetsCount}
        betSlipCount={betSlipItems.length}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
      />

      {/* Main Container: Desktop Multi-Column Grid Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-5 py-4">
        {/* Promotion Tab View */}
        {currentTab === 'promotions' ? (
          <div className="space-y-6 max-w-4xl mx-auto py-6">
            <div className="text-center space-y-2">
              <span className="text-xs uppercase font-mono font-bold text-amber-400 tracking-widest">
                DADA BET REWARDS PROGRAM
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Active Sportsbook Promotions
              </h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Boost your accumulator winnings and claim daily demonstration sandbox reload bonuses.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0e1522] border border-amber-500/40 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 font-mono">ACCA MULTIPLIER</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded">
                    UP TO +50%
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">
                  Multi-Leg Accumulator Boost
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Combine 3 or more selections on any football leagues to automatically receive enhanced cash bonus payouts upon winning settlement.
                </p>
                <div className="text-xs font-mono text-emerald-400 font-semibold">
                  3 legs: +5% · 4 legs: +10% · 5+ legs: +20%
                </div>
              </div>

              <div className="bg-[#0e1522] border border-emerald-500/40 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 font-mono">TESTING FAUCET</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded">
                    FREE DEMO COINS
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">
                  Daily 1,000 ETB Demo Reload
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Never run out of test credits while evaluating DADA BET. Refill your sandbox ledger anytime with one click.
                </p>
                <button
                  onClick={() => handleClaimCredits(1000)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Claim 1,000 ETB Now
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Sportsbook Home / Live View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Center Main Content Area (8 Cols on Desktop) */}
            <div className="lg:col-span-8 space-y-5">
              {/* Hero Banner Carousel with Real Images */}
              <HeroBanner
                featuredFixtures={featuredFixtures}
                onSelectOdds={handleSelectOdds}
                language={language}
              />

              {/* League & Search Filter Bar */}
              <LeagueFilter
                sports={sports}
                leagues={leagues}
                selectedSportId={selectedSportId}
                selectedLeagueId={selectedLeagueId}
                selectedStatus={selectedStatus}
                searchQuery={searchQuery}
                onSelectSport={setSelectedSportId}
                onSelectLeague={setSelectedLeagueId}
                onSelectStatus={setSelectedStatus}
                onSearchChange={setSearchQuery}
                language={language}
              />

              {/* Match Fixture Cards Feed */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span className="font-bold text-slate-200 uppercase tracking-wider">
                    {selectedStatus === 'LIVE' ? '🔴 Live Matches' : 'Matches & Markets'} ({filteredFixtures.length})
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Decimal Odds (1X2)
                  </span>
                </div>

                {filteredFixtures.length === 0 ? (
                  <div className="bg-[#0e1420] border border-slate-800 rounded-xl p-8 text-center space-y-2">
                    <p className="text-sm font-semibold text-slate-300">No matches found matching filter criteria.</p>
                    <p className="text-xs text-slate-500">Try selecting 'All Competitions' or clearing your search query.</p>
                    <button
                      onClick={() => {
                        setSelectedLeagueId('ALL');
                        setSelectedStatus('ALL');
                        setSearchQuery('');
                      }}
                      className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-emerald-400 cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  filteredFixtures.map(fixture => (
                    <MatchCard
                      key={fixture.id}
                      fixture={fixture}
                      selectedSelectionIds={selectedSelectionIds}
                      onSelectOdds={handleSelectOdds}
                      onOpenDetails={f => {
                        setSelectedFixtureForDetails(f);
                        setActiveModal('MATCH_DETAILS');
                      }}
                      language={language}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Desktop Sticky Bet Slip (4 Cols on Desktop) */}
            <div className="hidden lg:block lg:col-span-4 sticky top-20">
              <div className="h-[calc(100vh-6.5rem)]">
                <BetSlip
                  items={betSlipItems}
                  user={user}
                  onRemoveItem={handleRemoveBetSlipItem}
                  onClearAll={handleClearAllBetSlip}
                  onPlaceBet={handlePlaceBet}
                  isSubmitting={isPlacingBet}
                  language={language}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#060a10] py-8 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white tracking-wider">
              DADA <span className="text-emerald-400">BET</span>
            </span>
            <span>·</span>
            <span>Ethiopia & Global Sportsbook Engine</span>
            <span>·</span>
            <span className="text-amber-400/90 font-mono font-medium">DEMO OPERATOR SANDBOX</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={() => setActiveModal('RG')} className="hover:text-slate-300 cursor-pointer">
              Responsible Gambling (18+)
            </button>
            <button onClick={() => setActiveModal('ADMIN')} className="hover:text-amber-400 text-amber-300/80 cursor-pointer">
              Admin & Settlement
            </button>
            <span>© 2026 DADA BET Inc.</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenBetSlip={() => setActiveModal('MOBILE_BETSLIP')}
        onOpenMyBets={() => setActiveModal('MY_BETS')}
        onOpenRG={() => setActiveModal('RG')}
        activeBetsCount={activeBetsCount}
        betSlipCount={betSlipItems.length}
        language={language}
      />

      {/* Mobile Bet Slip Drawer */}
      {activeModal === 'MOBILE_BETSLIP' && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-sm lg:hidden">
          <div className="h-[80vh] w-full">
            <BetSlip
              items={betSlipItems}
              user={user}
              onRemoveItem={handleRemoveBetSlipItem}
              onClearAll={handleClearAllBetSlip}
              onPlaceBet={handlePlaceBet}
              isSubmitting={isPlacingBet}
              onCloseMobile={() => setActiveModal('NONE')}
              language={language}
            />
          </div>
        </div>
      )}

      {/* Match Details Modal */}
      {activeModal === 'MATCH_DETAILS' && selectedFixtureForDetails && (
        <MatchDetailsModal
          fixture={selectedFixtureForDetails}
          selectedSelectionIds={selectedSelectionIds}
          onSelectOdds={handleSelectOdds}
          onClose={() => setActiveModal('NONE')}
          language={language}
        />
      )}

      {/* My Bets Modal */}
      {activeModal === 'MY_BETS' && (
        <MyBetsModal
          tickets={myTickets}
          onCashout={handleCashout}
          onClose={() => setActiveModal('NONE')}
          language={language}
        />
      )}

      {/* Wallet Modal */}
      {activeModal === 'WALLET' && (
        <WalletModal
          user={user}
          ledger={ledger}
          onClaimCredits={handleClaimCredits}
          onTriggerPaymentSandbox={handleTriggerPaymentSandbox}
          onClose={() => setActiveModal('NONE')}
          language={language}
        />
      )}

      {/* Admin Console Modal */}
      {activeModal === 'ADMIN' && (
        <AdminConsole
          fixtures={fixtures}
          auditLogs={auditLogs}
          metrics={adminMetrics}
          onSettleFixture={handleSettleFixture}
          onUpdateOdds={handleUpdateOdds}
          onToggleMarketSuspension={handleToggleMarketSuspension}
          onUpdateLiveMatch={handleUpdateLiveMatch}
          onRefreshMetrics={loadAdminMetrics}
          onClose={() => setActiveModal('NONE')}
          language={language}
        />
      )}

      {/* Responsible Gambling & Profile Modal */}
      {activeModal === 'RG' && (
        <ResponsibleGamblingModal
          user={user}
          onUpdateLimits={handleUpdateLimits}
          onClose={() => setActiveModal('NONE')}
          language={language}
        />
      )}

      {/* Authentication Modal */}
      {activeModal === 'AUTH' && (
        <AuthModal
          onLogin={handleLogin}
          onRegister={handleRegister}
          onClose={() => setActiveModal('NONE')}
          language={language}
        />
      )}
    </div>
  );
}
