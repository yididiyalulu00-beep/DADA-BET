/**
 * Server-authoritative Sportsbook Fixtures & Odds Database
 */
import { Fixture, League, Sport } from '../src/types/sportsbook';

export const SPORTS: Sport[] = [
  { id: 'football', name: 'Football', nameAm: 'እግር ኳስ', icon: '⚽', activeFixturesCount: 8 },
  { id: 'basketball', name: 'Basketball', nameAm: 'ቅርጫት ኳስ', icon: '🏀', activeFixturesCount: 2 },
  { id: 'tennis', name: 'Tennis', nameAm: 'ቴኒስ', icon: '🎾', activeFixturesCount: 3 },
];

export const LEAGUES: League[] = [
  { id: 'epl', sportId: 'football', name: 'English Premier League', nameAm: 'የእንግሊዝ ፕሪሚየር ሊግ', country: 'England', countryCode: 'ENG', priority: 1 },
  { id: 'ucl', sportId: 'football', name: 'UEFA Champions League', nameAm: 'የአውሮፓ ሻምፒዮንስ ሊግ', country: 'Europe', countryCode: 'EUR', priority: 2 },
  { id: 'laliga', sportId: 'football', name: 'La Liga', nameAm: 'የስፔን ላ ሊጋ', country: 'Spain', countryCode: 'ESP', priority: 3 },
  { id: 'seriea', sportId: 'football', name: 'Serie A', nameAm: 'የጣሊያን ሴሪ ኤ', country: 'Italy', countryCode: 'ITA', priority: 4 },
  { id: 'bundesliga', sportId: 'football', name: 'Bundesliga', nameAm: 'የጀርመን ቦንደስሊጋ', country: 'Germany', countryCode: 'GER', priority: 5 },
  { id: 'epl_et', sportId: 'football', name: 'Ethiopian Premier League', nameAm: 'የኢትዮጵያ ፕሪሚየር ሊግ', country: 'Ethiopia', countryCode: 'ETH', priority: 6 },
];

const now = new Date();
const inMinutes = (min: number) => new Date(now.getTime() + min * 60000).toISOString();
const pastMinutes = (min: number) => new Date(now.getTime() - min * 60000).toISOString();

export let fixturesStore: Fixture[] = [
  {
    id: 'fix-1',
    sportId: 'football',
    leagueId: 'epl',
    leagueName: 'English Premier League',
    leagueNameAm: 'የእንግሊዝ ፕሪሚየር ሊግ',
    homeTeam: { id: 'ars', name: 'Arsenal', nameAm: 'አርሰናል', shortCode: 'ARS', badgeEmoji: '🔴', primaryColor: '#EF0107' },
    awayTeam: { id: 'che', name: 'Chelsea', nameAm: 'ቼልሲ', shortCode: 'CHE', badgeEmoji: '🔵', primaryColor: '#034694' },
    kickoffTime: pastMinutes(62),
    status: 'LIVE',
    minute: 62,
    currentScore: { home: 2, away: 1 },
    halfTimeScore: { home: 1, away: 1 },
    stats: {
      possession: [58, 42],
      shotsOnTarget: [6, 4],
      corners: [7, 3],
      yellowCards: [2, 3],
      redCards: [0, 0],
    },
    isFeatured: true,
    providerId: 'SPORT_DATA_FEED_SIM_01',
    lastUpdated: new Date().toISOString(),
    markets: [
      {
        id: 'mkt-fix1-1x2',
        type: '1X2',
        name: 'Full Time Result',
        nameAm: 'ሙሉ ጊዜ 1X2',
        status: 'OPEN',
        selections: [
          { id: 'sel-1-1', outcomeKey: '1', label: 'Arsenal', labelAm: 'አርሰናል', odds: 1.45, oddsVersion: 3, suspended: false, updatedAt: new Date().toISOString() },
          { id: 'sel-1-x', outcomeKey: 'X', label: 'Draw', labelAm: 'አቻ', odds: 4.20, oddsVersion: 3, suspended: false, updatedAt: new Date().toISOString() },
          { id: 'sel-1-2', outcomeKey: '2', label: 'Chelsea', labelAm: 'ቼልሲ', odds: 7.50, oddsVersion: 3, suspended: false, updatedAt: new Date().toISOString() },
        ],
      },
      {
        id: 'mkt-fix1-dc',
        type: 'DOUBLE_CHANCE',
        name: 'Double Chance',
        nameAm: 'እጥፍ እድል',
        status: 'OPEN',
        selections: [
          { id: 'sel-1-dc-1x', outcomeKey: '1X', label: 'Arsenal or Draw', labelAm: 'አርሰናል ወይም አቻ', odds: 1.12, oddsVersion: 1, suspended: false, updatedAt: new Date().toISOString() },
          { id: 'sel-1-dc-12', outcomeKey: '12', label: 'Arsenal or Chelsea', labelAm: 'አርሰናል ወይም ቼልሲ', odds: 1.22, oddsVersion: 1, suspended: false, updatedAt: new Date().toISOString() },
          { id: 'sel-1-dc-x2', outcomeKey: 'X2', label: 'Draw or Chelsea', labelAm: 'አቻ ወይም ቼልሲ', odds: 2.65, oddsVersion: 1, suspended: false, updatedAt: new Date().toISOString() },
        ],
      },
      {
        id: 'mkt-fix1-ou25',
        type: 'OVER_UNDER',
        name: 'Over/Under 3.5 Goals',
        nameAm: 'ከ/በታች 3.5 ጎሎች',
        specifier: '3.5',
        status: 'OPEN',
        selections: [
          { id: 'sel-1-o35', outcomeKey: 'OVER', label: 'Over 3.5', labelAm: 'ከ 3.5 በላይ', odds: 1.88, oddsVersion: 2, suspended: false, updatedAt: new Date().toISOString() },
          { id: 'sel-1-u35', outcomeKey: 'UNDER', label: 'Under 3.5', labelAm: 'ከ 3.5 በታች', odds: 1.92, oddsVersion: 2, suspended: false, updatedAt: new Date().toISOString() },
        ],
      },
      {
        id: 'mkt-fix1-btts',
        type: 'BTTS',
        name: 'Both Teams to Score',
        nameAm: 'ሁለቱም ቡድኖች ያገባሉ',
        status: 'SETTLED',
        winningOutcomeKey: 'YES',
        selections: [
          { id: 'sel-1-btts-y', outcomeKey: 'YES', label: 'Yes (Settled)', labelAm: 'አዎ', odds: 1.65, oddsVersion: 1, suspended: true, updatedAt: new Date().toISOString() },
          { id: 'sel-1-btts-n', outcomeKey: 'NO', label: 'No', labelAm: 'አይደለም', odds: 2.20, oddsVersion: 1, suspended: true, updatedAt: new Date().toISOString() },
        ],
      },
      {
        id: 'mkt-fix1-cs',
        type: 'CORRECT_SCORE',
        name: 'Correct Score',
        nameAm: 'ትክክለኛ ውጤት',
        status: 'OPEN',
        selections: [
          { id: 'sel-1-cs-21', outcomeKey: '2-1', label: '2 - 1', labelAm: '2 - 1', odds: 2.70, oddsVersion: 2, suspended: false, updatedAt: new Date().toISOString() },
          { id: 'sel-1-cs-31', outcomeKey: '3-1', label: '3 - 1', labelAm: '3 - 1', odds: 3.40, oddsVersion: 2, suspended: false, updatedAt: new Date().toISOString() },
          { id: 'sel-1-cs-22', outcomeKey: '2-2', label: '2 - 2', labelAm: '2 - 2', odds: 5.80, oddsVersion: 2, suspended: false, updatedAt: new Date().toISOString() },
          { id: 'sel-1-cs-32', outcomeKey: '3-2', label: '3 - 2', labelAm: '3 - 2', odds: 11.0, oddsVersion: 2, suspended: false, updatedAt: new Date().toISOString() },
        ],
      },
    ],
  },
  {
    id: 'fix-2',
    sportId: 'football',
    leagueId: 'epl',
    leagueName: 'English Premier League',
    leagueNameAm: 'የእንግሊዝ ፕሪሚየር ሊግ',
    homeTeam: { id: 'mci', name: 'Manchester City', nameAm: 'ማንቸስተር ሲቲ', shortCode: 'MCI', badgeEmoji: '🩵', primaryColor: '#6CABDD' },
    awayTeam: { id: 'liv', name: 'Liverpool', nameAm: 'ሊቨርፑል', shortCode: 'LIV', badgeEmoji: '🔴', primaryColor: '#C8102E' },
    kickoffTime: inMinutes(120),
    status: 'PRE_MATCH',
    currentScore: { home: 0, away: 0 },
    isFeatured: true,
    providerId: 'SPORT_DATA_FEED_SIM_01',
    lastUpdated: new Date().toISOString(),
    markets: [
      {
        id: 'mkt-fix2-1x2',
        type: '1X2',
        name: 'Full Time Result',
        nameAm: 'ሙሉ ጊዜ 1X2',
        status: 'OPEN',
        selections: [
          { id: 'sel-2-1', outcomeKey: '1', label: 'Man City', labelAm: 'ማን ሲቲ', odds: 2.15, oddsVersion: 1, suspended: false, updatedAt: new Date().toISOString() },
          { id: 'sel-2-x', outcomeKey: 'X', label: 'Draw', labelAm: 'አቻ', odds: 3.60, oddsVersion: 1, suspended: false, updatedAt: new Date().toISOString() },
          { id: 'sel-2-2', outcomeKey: '2', label: 'Liverpool', labelAm: 'ሊቨርፑል', odds: 3.25, oddsVersion: 1, suspended: false, updatedAt: new Date().toISOString() },
        ],
      },
      {
        id: 'mkt-fix2-dc',
        type: 'DOUBLE_CHANCE',
        name: 'Double Chance',
        nameAm: 'እጥፍ እድል',
        status: 'OPEN',
        selections: [
          { id: 'sel-2-dc-1x', outcomeKey: '1X', label: 'City or Draw', labelAm: 'ሲቲ ወይም አቻ', odds: 1.34, oddsVersion: 1, suspended: false, updatedAt: new Date().toISOString() },
          { id: 'sel-2-dc-12', outcomeKey: '12', label: 'City or Liverpool', labelAm: 'ሲቲ ወይም ሊቨርፑል', odds: 1.28, oddsVersion: 1, suspended: false, updatedAt: new Date().toISOString() },
          { id: 'sel-2-dc-x2', outcomeKey: 'X2', label: 'Draw or Liverpool', labelAm: 'አቻ ወይም ሊቨርፑል', odds: 1.70, oddsVersion: 1, suspended: false, updatedAt: new Date().toISOString() },
        ],
      },
      {
        id: 'mkt-fix2-ou25',
        type: 'OVER_UNDER',
        name: 'Total Goals Over/Under 2.5',
        nameAm: 'ከ/በታች 2.5 ጎሎች',
        specifier: '2.5',
        status: 'OPEN',
        selections: [
          { id: 'sel-2-o25', outcomeKey: 'OVER', label: 'Over 2.5', labelAm: 'ከ 2.5 በላይ', odds: 1.62, oddsVersion: 1, suspended: false, updatedAt: new Date().toISOString() },
          { id: 'sel-2-u25', outcomeKey: 'UNDER', label: 'Under 2.5', labelAm: 'ከ 2.5 በታች', odds: 2.30, oddsVersion: 1, suspended: false, updatedAt: new Date().toISOString() },
        ],
      },
      {
        id: 'mkt-fix2-btts',
        type: 'BTTS',
        name: 'Both Teams to Score',
        nameAm: 'ሁለቱም ቡድኖች ያገባሉ',
        status: 'OPEN',
        selections: [
          { id: 'sel-2-btts-y', outcomeKey: 'YES', label: 'Yes', labelAm: 'አዎ', odds: 1.52, oddsVersion: 1, suspended: false, updatedAt: new Date().toISOString() },
          { id: 'sel-2-btts-n', outcomeKey: 'NO', label: 'No', labelAm: 'አይደለም', odds: 2.45, oddsVersion: 1, suspended: false, updatedAt: new Date().toISOString() },
        ],
      },
    ],
  },
  {
    id: 'fix-3',
    sportId: 'football',
    leagueId: 'laliga',
    leagueName: 'La Liga',
    leagueNameAm: 'የስፔን ላ ሊጋ',
    homeTeam: { id: 'rma', name: 'Real Madrid', nameAm: 'ሪያል ማድሪድ', shortCode: 'RMA', badgeEmoji: '⚪', primaryColor: '#FFFFFF' },
    awayTeam: { id: 'bar', name: 'Barcelona', nameAm: 'ባርሴሎና', shortCode: 'BAR', badgeEmoji: '🔵🔴', primaryColor: '#004D98' },
    kickoffTime: inMinutes(240),
    status: 'PRE_MATCH',
    currentScore: { home: 0, away: 0 },
    isFeatured: true,
    providerId: 'SPORT_DATA_FEED_SIM_01',
    lastUpdated: new Date().toISOString(),
    markets: [
      {
        id: 'mkt-fix3-1x2',
        type: '1X2',
        name: 'Full Time Result',
        nameAm: 'ሙሉ ጊዜ 1X2',
        status: 'OPEN',
        selections: [
          { id: 'sel-3-1', outcomeKey: '1', label: 'Real Madrid', labelAm: 'ሪያል ማድሪድ', odds: 2.05, oddsVersion: 1, suspended: false, updatedAt: new Date().toISOString() },
          { id: 'sel-3-x', outcomeKey: 'X', label: 'Draw', labelAm: 'አቻ', odds: 3.80, oddsVersion: 1, suspended: false, updatedAt: new Date().toISOString() },
          { id: 'sel-3-2', outcomeKey: '2', label: 'Barcelona', labelAm: 'ባርሴሎና', odds: 3.30, oddsVersion: 1, suspended: false, updatedAt: new Date().toISOString() },
        ],
      },
      {
        id: 'mkt-fix3-ou25',
        type: 'OVER_UNDER',
        name: 'Total Goals Over/Under 2.5',
        nameAm: 'ከ/በታች 2.5 ጎሎች',
        specifier: '2.5',
        status: 'OPEN',
        selections: [
          { id: 'sel-3-o25', outcomeKey: 'OVER', label: 'Over 2.5', labelAm: 'ከ 2.5 በላይ', odds: 1.55, oddsVersion: 1, suspended: false, updatedAt: new Date().toISOString() },
          { id: 'sel-3-u25', outcomeKey: 'UNDER', label: 'Under 2.5', labelAm: 'ከ 2.5 በታች', odds: 2.45, oddsVersion: 1, suspended: false, updatedAt: new Date().toISOString() },
        ],
      },
      {
        id: 'mkt-fix3-btts',
        type: 'BTTS',
        name: 'Both Teams to Score',
        nameAm: 'ሁለቱም ቡድኖች ያገባሉ',
        status: 'OPEN',
        selections: [
          { id: 'sel-3-btts-y', outcomeKey: 'YES', label: 'Yes', labelAm: 'አዎ', odds: 1.48, oddsVersion: 1, suspended: false, updatedAt: new Date().toISOString() },
          { id: 'sel-3-btts-n', outcomeKey: 'NO', label: 'No', labelAm: 'አይደለም', odds: 2.55, oddsVersion: 1, suspended: false, updatedAt: new Date().toISOString() },
        ],
      },
    ],
  },
  {
    id: 'fix-4',
    sportId: 'football',
    leagueId: 'epl_et',
    leagueName: 'Ethiopian Premier League',
    leagueNameAm: 'የኢትዮጵያ ፕሪሚየር ሊግ',
    homeTeam: { id: 'stg', name: 'Saint George SC', nameAm: 'ቅዱስ ጊዮርጊስ', shortCode: 'STG', badgeEmoji: '🟡🔴', primaryColor: '#F59E0B' },
    awayTeam: { id: 'etc', name: 'Ethiopian Coffee SC', nameAm: 'ኢትዮጵያ ቡና', shortCode: 'COF', badgeEmoji: '🟤☕', primaryColor: '#844200' },
    kickoffTime: pastMinutes(35),
    status: 'LIVE',
    minute: 35,
    currentScore: { home: 1, away: 0 },
    stats: {
      possession: [52, 48],
      shotsOnTarget: [4, 2],
      corners: [3, 2],
      yellowCards: [1, 2],
      redCards: [0, 0],
    },
    isFeatured: true,
    providerId: 'SPORT_DATA_FEED_SIM_01',
    lastUpdated: new Date().toISOString(),
    markets: [
      {
        id: 'mkt-fix4-1x2',
        type: '1X2',
        name: 'Full Time Result',
        nameAm: 'ሙሉ ጊዜ 1X2',
        status: 'OPEN',
        selections: [
          { id: 'sel-4-1', outcomeKey: '1', label: 'Saint George', labelAm: 'ቅዱስ ጊዮርጊስ', odds: 1.72, oddsVersion: 2, suspended: false, updatedAt: new Date().toISOString() },
          { id: 'sel-4-x', outcomeKey: 'X', label: 'Draw', labelAm: 'አቻ', odds: 3.10, oddsVersion: 2, suspended: false, updatedAt: new Date().toISOString() },
          { id: 'sel-4-2', outcomeKey: '2', label: 'Ethiopian Coffee', labelAm: 'ኢትዮጵያ ቡና', odds: 4.80, oddsVersion: 2, suspended: false, updatedAt: new Date().toISOString() },
        ],
      },
      {
        id: 'mkt-fix4-ou15',
        type: 'OVER_UNDER',
        name: 'Total Goals Over/Under 1.5',
        nameAm: 'ከ/በታች 1.5 ጎሎች',
        specifier: '1.5',
        status: 'OPEN',
        selections: [
          { id: 'sel-4-o15', outcomeKey: 'OVER', label: 'Over 1.5', labelAm: 'ከ 1.5 በላይ', odds: 1.38, oddsVersion: 1, suspended: false, updatedAt: new Date().toISOString() },
          { id: 'sel-4-u15', outcomeKey: 'UNDER', label: 'Under 1.5', labelAm: 'ከ 1.5 በታች', odds: 2.85, oddsVersion: 1, suspended: false, updatedAt: new Date().toISOString() },
        ],
      },
    ],
  },
  {
    id: 'fix-5',
    sportId: 'football',
    leagueId: 'bundesliga',
    leagueName: 'Bundesliga',
    leagueNameAm: 'የጀርመን ቦንደስሊጋ',
    homeTeam: { id: 'bay', name: 'Bayern Munich', nameAm: 'ባየር ሙኒክ', shortCode: 'BAY', badgeEmoji: '🔴⚪', primaryColor: '#DC052D' },
    awayTeam: { id: 'bvb', name: 'Borussia Dortmund', nameAm: 'ዶርትሙንድ', shortCode: 'BVB', badgeEmoji: '🟡⚫', primaryColor: '#FDE100' },
    kickoffTime: inMinutes(360),
    status: 'PRE_MATCH',
    currentScore: { home: 0, away: 0 },
    isFeatured: false,
    providerId: 'SPORT_DATA_FEED_SIM_01',
    lastUpdated: new Date().toISOString(),
    markets: [
      {
        id: 'mkt-fix5-1x2',
        type: '1X2',
        name: 'Full Time Result',
        nameAm: 'ሙሉ ጊዜ 1X2',
        status: 'OPEN',
        selections: [
          { id: 'sel-5-1', outcomeKey: '1', label: 'Bayern Munich', labelAm: 'ባየር ሙኒክ', odds: 1.60, oddsVersion: 1, suspended: false, updatedAt: new Date().toISOString() },
          { id: 'sel-5-x', outcomeKey: 'X', label: 'Draw', labelAm: 'አቻ', odds: 4.50, oddsVersion: 1, suspended: false, updatedAt: new Date().toISOString() },
          { id: 'sel-5-2', outcomeKey: '2', label: 'Dortmund', labelAm: 'ዶርትሙንድ', odds: 5.00, oddsVersion: 1, suspended: false, updatedAt: new Date().toISOString() },
        ],
      },
    ],
  },
  {
    id: 'fix-6',
    sportId: 'football',
    leagueId: 'seriea',
    leagueName: 'Serie A',
    leagueNameAm: 'የጣሊያን ሴሪ ኤ',
    homeTeam: { id: 'int', name: 'Inter Milan', nameAm: 'ኢንተር ሚላን', shortCode: 'INT', badgeEmoji: '🔵⚫', primaryColor: '#0068A8' },
    awayTeam: { id: 'juv', name: 'Juventus', nameAm: 'ጁቬንቱስ', shortCode: 'JUV', badgeEmoji: '⚪⚫', primaryColor: '#000000' },
    kickoffTime: inMinutes(480),
    status: 'PRE_MATCH',
    currentScore: { home: 0, away: 0 },
    isFeatured: false,
    providerId: 'SPORT_DATA_FEED_SIM_01',
    lastUpdated: new Date().toISOString(),
    markets: [
      {
        id: 'mkt-fix6-1x2',
        type: '1X2',
        name: 'Full Time Result',
        nameAm: 'ሙሉ ጊዜ 1X2',
        status: 'OPEN',
        selections: [
          { id: 'sel-6-1', outcomeKey: '1', label: 'Inter', labelAm: 'ኢንተር', odds: 2.10, oddsVersion: 1, suspended: false, updatedAt: new Date().toISOString() },
          { id: 'sel-6-x', outcomeKey: 'X', label: 'Draw', labelAm: 'አቻ', odds: 3.20, oddsVersion: 1, suspended: false, updatedAt: new Date().toISOString() },
          { id: 'sel-6-2', outcomeKey: '2', label: 'Juventus', labelAm: 'ጁቬንቱስ', odds: 3.75, oddsVersion: 1, suspended: false, updatedAt: new Date().toISOString() },
        ],
      },
    ],
  },
  {
    id: 'fix-7',
    sportId: 'football',
    leagueId: 'ucl',
    leagueName: 'UEFA Champions League',
    leagueNameAm: 'የአውሮፓ ሻምፒዮንስ ሊግ',
    homeTeam: { id: 'psg', name: 'Paris Saint-Germain', nameAm: 'ፒኤስጂ', shortCode: 'PSG', badgeEmoji: '🔵🔴', primaryColor: '#004170' },
    awayTeam: { id: 'atm', name: 'Atletico Madrid', nameAm: 'አትሌቲኮ ማድሪድ', shortCode: 'ATM', badgeEmoji: '🔴⚪', primaryColor: '#CB3524' },
    kickoffTime: inMinutes(720),
    status: 'PRE_MATCH',
    currentScore: { home: 0, away: 0 },
    isFeatured: true,
    providerId: 'SPORT_DATA_FEED_SIM_01',
    lastUpdated: new Date().toISOString(),
    markets: [
      {
        id: 'mkt-fix7-1x2',
        type: '1X2',
        name: 'Full Time Result',
        nameAm: 'ሙሉ ጊዜ 1X2',
        status: 'OPEN',
        selections: [
          { id: 'sel-7-1', outcomeKey: '1', label: 'PSG', labelAm: 'ፒኤስጂ', odds: 1.85, oddsVersion: 1, suspended: false, updatedAt: new Date().toISOString() },
          { id: 'sel-7-x', outcomeKey: 'X', label: 'Draw', labelAm: 'አቻ', odds: 3.50, oddsVersion: 1, suspended: false, updatedAt: new Date().toISOString() },
          { id: 'sel-7-2', outcomeKey: '2', label: 'Atletico Madrid', labelAm: 'አትሌቲኮ', odds: 4.40, oddsVersion: 1, suspended: false, updatedAt: new Date().toISOString() },
        ],
      },
    ],
  },
  {
    id: 'fix-8',
    sportId: 'football',
    leagueId: 'epl_et',
    leagueName: 'Ethiopian Premier League',
    leagueNameAm: 'የኢትዮጵያ ፕሪሚየር ሊግ',
    homeTeam: { id: 'fas', name: 'Fasil Kenema SC', nameAm: 'ፋሲል ከነማ', shortCode: 'FAS', badgeEmoji: '🔴⚪', primaryColor: '#DC2626' },
    awayTeam: { id: 'bhd', name: 'Bahir Dar Kenema', nameAm: 'ባህር ዳር ከነማ', shortCode: 'BHD', badgeEmoji: '🔵🌊', primaryColor: '#2563EB' },
    kickoffTime: inMinutes(300),
    status: 'PRE_MATCH',
    currentScore: { home: 0, away: 0 },
    isFeatured: false,
    providerId: 'SPORT_DATA_FEED_SIM_01',
    lastUpdated: new Date().toISOString(),
    markets: [
      {
        id: 'mkt-fix8-1x2',
        type: '1X2',
        name: 'Full Time Result',
        nameAm: 'ሙሉ ጊዜ 1X2',
        status: 'OPEN',
        selections: [
          { id: 'sel-8-1', outcomeKey: '1', label: 'Fasil Kenema', labelAm: 'ፋሲል ከነማ', odds: 2.25, oddsVersion: 1, suspended: false, updatedAt: new Date().toISOString() },
          { id: 'sel-8-x', outcomeKey: 'X', label: 'Draw', labelAm: 'አቻ', odds: 2.95, oddsVersion: 1, suspended: false, updatedAt: new Date().toISOString() },
          { id: 'sel-8-2', outcomeKey: '2', label: 'Bahir Dar', labelAm: 'ባህር ዳር', odds: 3.40, oddsVersion: 1, suspended: false, updatedAt: new Date().toISOString() },
        ],
      },
    ],
  },
];

/**
 * Trigger an update or odds fluctuation on a fixture
 */
export function simulateOddsShift(fixtureId: string, marketId: string, selectionId: string, newOdds: number) {
  const fix = fixturesStore.find(f => f.id === fixtureId);
  if (!fix) return null;
  const mkt = fix.markets.find(m => m.id === marketId);
  if (!mkt) return null;
  const sel = mkt.selections.find(s => s.id === selectionId);
  if (!sel) return null;

  sel.previousOdds = sel.odds;
  sel.odds = Number(newOdds.toFixed(2));
  sel.oddsVersion += 1;
  sel.updatedAt = new Date().toISOString();
  fix.lastUpdated = new Date().toISOString();

  return sel;
}

/**
 * Toggle market suspension
 */
export function toggleMarketSuspension(fixtureId: string, marketId: string, suspended?: boolean) {
  const fix = fixturesStore.find(f => f.id === fixtureId);
  if (!fix) return null;
  const mkt = fix.markets.find(m => m.id === marketId);
  if (!mkt) return null;

  mkt.status = (suspended !== undefined ? suspended : mkt.status !== 'SUSPENDED') ? 'SUSPENDED' : 'OPEN';
  mkt.selections.forEach(s => {
    s.suspended = mkt.status === 'SUSPENDED';
  });
  fix.lastUpdated = new Date().toISOString();
  return mkt;
}

/**
 * Update live match score and minute
 */
export function updateLiveMatch(fixtureId: string, homeScore: number, awayScore: number, minute: number, status?: Fixture['status']) {
  const fix = fixturesStore.find(f => f.id === fixtureId);
  if (!fix) return null;

  fix.currentScore = { home: homeScore, away: awayScore };
  fix.minute = minute;
  if (status) fix.status = status;
  fix.lastUpdated = new Date().toISOString();
  return fix;
}
