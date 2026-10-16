/**
 * DADA BET — Full-Stack Server Entry Point
 * Express API Backend + Vite Middlewares on Port 3000
 */
import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  SPORTS,
  LEAGUES,
  fixturesStore,
  simulateOddsShift,
  toggleMarketSuspension,
  updateLiveMatch,
} from './server/sportsData';
import {
  usersStore,
  ledgerStore,
  auditLogsStore,
  recordLedgerTransaction,
  recordAuditLog,
  createSandboxPaymentIntent,
  paymentIntentsStore,
} from './server/walletLedger';
import {
  betTicketsStore,
  placeBet,
  settleFixture,
  calculateCashoutValue,
  cashoutTicket,
} from './server/betEngine';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json());

  // Request logger for audit
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // --- SPORTSBOOK PUBLIC APIS ---

  app.get('/api/sports', (req: Request, res: Response) => {
    res.json({ success: true, sports: SPORTS });
  });

  app.get('/api/leagues', (req: Request, res: Response) => {
    res.json({ success: true, leagues: LEAGUES });
  });

  app.get('/api/fixtures', (req: Request, res: Response) => {
    const { league, status, search } = req.query;
    let results = [...fixturesStore];

    if (league && typeof league === 'string') {
      results = results.filter(f => f.leagueId.toLowerCase() === league.toLowerCase());
    }
    if (status && typeof status === 'string') {
      if (status === 'LIVE') {
        results = results.filter(f => f.status === 'LIVE' || f.status === 'HALFTIME');
      } else if (status === 'PRE_MATCH') {
        results = results.filter(f => f.status === 'PRE_MATCH');
      } else if (status === 'FINISHED') {
        results = results.filter(f => f.status === 'FINISHED');
      }
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      results = results.filter(
        f =>
          f.homeTeam.name.toLowerCase().includes(q) ||
          f.awayTeam.name.toLowerCase().includes(q) ||
          f.leagueName.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, fixtures: results });
  });

  app.get('/api/fixtures/:id', (req: Request, res: Response) => {
    const fixture = fixturesStore.find(f => f.id === req.params.id);
    if (!fixture) {
      return res.status(404).json({ success: false, error: 'Match not found' });
    }
    res.json({ success: true, fixture });
  });

  // --- AUTHENTICATION & PROFILE APIS ---

  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const user = Object.values(usersStore).find(
      u => u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      // For convenience in demo sandbox, create instant session if non-existent
      const newId = `usr-demo-${Date.now().toString(36)}`;
      usersStore[newId] = {
        id: newId,
        username: email.split('@')[0] || 'Demo_Player',
        email,
        phone: '+251 91 000 0000',
        role: 'USER',
        kycLevel: 'TIER_1_DEMO',
        balance: 2000,
        currency: 'ETB',
        responsibleGambling: {
          dailyDepositLimit: 5000,
          maxSingleStake: 2000,
          selfExcluded: false,
        },
        createdAt: new Date().toISOString(),
      };
      recordLedgerTransaction(newId, 'DEPOSIT_DEMO', 2000, 'NEW-ACCT-BONUS', 'Welcome Sandbox Test Balance');
      return res.json({ success: true, user: usersStore[newId], token: `demo-token-${newId}` });
    }

    res.json({ success: true, user, token: `demo-token-${user.id}` });
  });

  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { username, email, phone, ageConfirmed } = req.body;
    if (!ageConfirmed) {
      return res.status(400).json({ success: false, error: 'You must verify that you are at least 18 years of age.' });
    }
    if (!email || !username) {
      return res.status(400).json({ success: false, error: 'Username and email are required.' });
    }

    const newId = `usr-reg-${Date.now().toString(36)}`;
    const newUser = {
      id: newId,
      username,
      email,
      phone: phone || '+251 91 000 0000',
      role: 'USER' as const,
      kycLevel: 'TIER_1_DEMO' as const,
      balance: 1500, // starting demo bonus
      currency: 'ETB' as const,
      responsibleGambling: {
        dailyDepositLimit: 5000,
        maxSingleStake: 1500,
        selfExcluded: false,
      },
      createdAt: new Date().toISOString(),
    };
    usersStore[newId] = newUser;
    recordLedgerTransaction(newId, 'DEPOSIT_DEMO', 1500, 'SIGNUP_DEMO', 'Registration Demo Credit');

    res.json({ success: true, user: newUser, token: `demo-token-${newId}` });
  });

  app.get('/api/auth/me', (req: Request, res: Response) => {
    const userId = (req.query.userId as string) || 'usr-demo-1';
    const user = usersStore[userId];
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, user });
  });

  // --- WALLET & LEDGER APIS ---

  app.get('/api/wallet/ledger', (req: Request, res: Response) => {
    const userId = (req.query.userId as string) || 'usr-demo-1';
    const entries = ledgerStore.filter(e => e.userId === userId);
    res.json({ success: true, ledger: entries });
  });

  app.post('/api/wallet/claim-demo', (req: Request, res: Response) => {
    const { userId = 'usr-demo-1', amount = 1000 } = req.body;
    const result = recordLedgerTransaction(
      userId,
      'BONUS_CLAIM',
      Number(amount),
      `CLAIM-${Date.now()}`,
      `Reloaded ${amount} ETB Demo Testing Credits`
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({ success: true, newBalance: result.newBalance, entry: result.entry });
  });

  // Sandbox Payment Provider Adapter Simulation (Telebirr & CBE Birr)
  app.post('/api/payment-providers/sandbox/intent', (req: Request, res: Response) => {
    const { userId = 'usr-demo-1', provider = 'TELEBIRR_SANDBOX', amount = 500 } = req.body;
    const intent = createSandboxPaymentIntent(userId, provider, Number(amount));
    res.json({
      success: true,
      intent,
      instructions: `Sandbox flow initiated for ${provider}. Use the simulated webhook trigger to finalize.`,
    });
  });

  app.post('/api/payment-providers/sandbox/webhook', (req: Request, res: Response) => {
    const { intentId, signature } = req.body;
    const intent = paymentIntentsStore.find(i => i.intentId === intentId);
    if (!intent) {
      return res.status(404).json({ success: false, error: 'Payment intent not found' });
    }

    if (intent.status === 'SUCCESS') {
      return res.json({ success: true, message: 'Payment already credited' });
    }

    // Verify signature
    if (intent.signature !== signature) {
      return res.status(401).json({ success: false, error: 'Invalid HMAC signature' });
    }

    intent.status = 'SUCCESS';
    const ledgerResult = recordLedgerTransaction(
      intent.userId,
      'DEPOSIT_DEMO',
      intent.amount,
      intent.intentId,
      `Simulated ${intent.provider} Sandbox Deposit`
    );

    res.json({
      success: true,
      message: 'Sandbox payment successfully credited to demo wallet',
      newBalance: ledgerResult.newBalance,
    });
  });

  // --- BET PLACEMENT & MY BETS APIS ---

  app.post('/api/bets/place', (req: Request, res: Response) => {
    const userId = req.body.userId || 'usr-demo-1';
    const response = placeBet(userId, req.body);

    if (!response.success) {
      return res.status(response.changedOdds ? 409 : 400).json(response);
    }

    res.json(response);
  });

  app.get('/api/bets/history', (req: Request, res: Response) => {
    const userId = (req.query.userId as string) || 'usr-demo-1';
    const tickets = betTicketsStore.filter(t => t.userId === userId);

    // Attach dynamic cashout value to open tickets
    const ticketsWithCashout = tickets.map(t => {
      const cashout = t.status === 'PENDING' ? calculateCashoutValue(t) : null;
      return { ...t, cashoutValue: cashout };
    });

    res.json({ success: true, tickets: ticketsWithCashout });
  });

  app.post('/api/bets/cashout', (req: Request, res: Response) => {
    const { userId = 'usr-demo-1', ticketId } = req.body;
    if (!ticketId) {
      return res.status(400).json({ success: false, error: 'Ticket ID is required' });
    }

    const result = cashoutTicket(userId, ticketId);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  });

  // --- RESPONSIBLE GAMBLING APIS ---

  app.post('/api/compliance/limits', (req: Request, res: Response) => {
    const { userId = 'usr-demo-1', dailyDepositLimit, maxSingleStake, selfExcluded } = req.body;
    const user = usersStore[userId];
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (dailyDepositLimit !== undefined) {
      user.responsibleGambling.dailyDepositLimit = Math.max(100, Number(dailyDepositLimit));
    }
    if (maxSingleStake !== undefined) {
      user.responsibleGambling.maxSingleStake = Math.max(10, Number(maxSingleStake));
    }
    if (selfExcluded !== undefined) {
      user.responsibleGambling.selfExcluded = Boolean(selfExcluded);
    }

    recordAuditLog(
      userId,
      'UPDATE_RG_LIMITS',
      'LIMIT',
      userId,
      `Updated limits: Deposit ${user.responsibleGambling.dailyDepositLimit} ETB, Stake ${user.responsibleGambling.maxSingleStake} ETB, SelfExcluded: ${user.responsibleGambling.selfExcluded}`
    );

    res.json({ success: true, responsibleGambling: user.responsibleGambling });
  });

  // --- ADMIN CONTROL APIS ---

  app.post('/api/admin/settle', (req: Request, res: Response) => {
    const { fixtureId, homeScore, awayScore, actorId = 'usr-admin-1' } = req.body;
    if (!fixtureId || homeScore === undefined || awayScore === undefined) {
      return res.status(400).json({ success: false, error: 'Fixture ID, home score, and away score are required' });
    }

    const result = settleFixture(fixtureId, { home: Number(homeScore), away: Number(awayScore) }, actorId);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  });

  app.post('/api/admin/odds/shift', (req: Request, res: Response) => {
    const { fixtureId, marketId, selectionId, newOdds } = req.body;
    const updated = simulateOddsShift(fixtureId, marketId, selectionId, Number(newOdds));
    if (!updated) {
      return res.status(400).json({ success: false, error: 'Could not update selection odds' });
    }
    res.json({ success: true, selection: updated });
  });

  app.post('/api/admin/markets/toggle-suspend', (req: Request, res: Response) => {
    const { fixtureId, marketId, suspended } = req.body;
    const updated = toggleMarketSuspension(fixtureId, marketId, suspended);
    if (!updated) {
      return res.status(400).json({ success: false, error: 'Could not toggle suspension' });
    }
    res.json({ success: true, market: updated });
  });

  app.post('/api/admin/fixtures/live-update', (req: Request, res: Response) => {
    const { fixtureId, homeScore, awayScore, minute, status } = req.body;
    const updated = updateLiveMatch(fixtureId, homeScore, awayScore, minute, status);
    if (!updated) {
      return res.status(400).json({ success: false, error: 'Could not update match' });
    }
    res.json({ success: true, fixture: updated });
  });

  app.get('/api/admin/metrics', (req: Request, res: Response) => {
    const totalBetsPlaced = betTicketsStore.length;
    const totalStakeVolume = betTicketsStore.reduce((acc, t) => acc + t.stake, 0);
    const totalPayouts = betTicketsStore.reduce((acc, t) => acc + (t.payoutAmount || 0), 0);
    const grossGamingRevenue = totalStakeVolume - totalPayouts;
    const pendingTickets = betTicketsStore.filter(t => t.status === 'PENDING').length;
    const activeUsers = Object.keys(usersStore).length;

    res.json({
      success: true,
      metrics: {
        totalBetsPlaced,
        totalStakeVolume: Number(totalStakeVolume.toFixed(2)),
        totalPayouts: Number(totalPayouts.toFixed(2)),
        grossGamingRevenue: Number(grossGamingRevenue.toFixed(2)),
        pendingTickets,
        activeUsers,
        feedStatus: 'ONLINE_ACTIVE (SPORT_DATA_FEED_SIM_01)',
        environment: 'SANDBOX_DEMO_MODE',
      },
    });
  });

  app.get('/api/admin/audit-logs', (req: Request, res: Response) => {
    res.json({ success: true, auditLogs: auditLogsStore });
  });

  // --- VITE MIDDLEWARES OR PRODUCTION SERVING ---

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DADA BET full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
