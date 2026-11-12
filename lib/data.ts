import type { AlmaDB, Person, Team, Match, Season, Division, Announcement, Document, FAQ, PaymentRecord, DuesRecord, PlayWindow } from '../types';

const DIVISIONS: Division[] = [
  { id: 'div-atl', name: 'Atlanta League', region: 'Atlanta' },
];

const PEOPLE: Record<string, Person> = {
  u1:  { id: 'u1', name: 'Margaret Holloway',   initials: 'MH', tile: 'plum', email: 'margaret.holloway@example.com', phone: '(404) 555-0100', skill: 'Experienced', zip: '30305', area: 'Buckhead', tint: 'bone' },
  u2:  { id: 'u2', name: 'Caroline Pritchett',  initials: 'CP', tile: 'orchid', email: 'caroline.pritchett@example.com', phone: '(404) 555-0137', skill: 'Experienced', zip: '30319', area: 'Brookhaven', tint: 'sky' },
  u3:  { id: 'u3', name: 'Eleanor Vance',       initials: 'EV', tile: 'mum', email: 'eleanor.vance@example.com', phone: '(404) 555-0174', skill: 'Experienced', zip: '30327', area: 'Sandy Springs', tint: 'sage' },
  u4:  { id: 'u4', name: 'Beatrice Whitfield',  initials: 'BW', tile: 'bamboo', email: 'beatrice.whitfield@example.com', phone: '(404) 555-0211', skill: 'Experienced', zip: '30338', area: 'Dunwoody', tint: 'cream' },
  u5:  { id: 'u5', name: 'Vivian Locke',        initials: 'VL', tile: 'red', email: 'vivian.locke@example.com', phone: '(404) 555-0248', skill: 'Experienced', zip: '30075', area: 'Roswell', tint: 'sky' },
  u6:  { id: 'u6', name: 'Adelaide Quinn',      initials: 'AQ', tile: 'green', email: 'adelaide.quinn@example.com', phone: '(404) 555-0285', skill: 'Experienced', zip: '30030', area: 'Decatur', tint: 'bone' },
  u7:  { id: 'u7', name: 'Frances Eberhardt',   initials: 'FE', tile: 'flower', email: 'frances.eberhardt@example.com', phone: '(404) 555-0322', skill: 'Experienced', zip: '30307', area: 'Druid Hills', tint: 'sage' },
  u8:  { id: 'u8', name: 'Harriet Compton',     initials: 'HC', tile: 'spring', email: 'harriet.compton@example.com', phone: '(404) 555-0359', skill: 'Experienced', zip: '30306', area: 'Va-Highland', tint: 'cream' },
  u9:  { id: 'u9', name: 'Lillian Marchetti',   initials: 'LM', tile: 'plum', email: 'lillian.marchetti@example.com', phone: '(404) 555-0396', skill: 'Experienced', zip: '30316', area: 'East Atlanta', tint: 'sky' },
  u10: { id: 'u10', name: 'Penelope Strathmore', initials: 'PS', tile: 'orchid', email: 'penelope.strathmore@example.com', phone: '(404) 555-0433', skill: 'Experienced', zip: '30068', area: 'Marietta', tint: 'bone' },
  u11: { id: 'u11', name: 'Cornelia Boatwright', initials: 'CB', tile: 'mum', email: 'cornelia.boatwright@example.com', phone: '(404) 555-0470', skill: 'Experienced', zip: '30307', area: 'Inman Park', tint: 'sage' },
  u12: { id: 'u12', name: 'Augusta Reeves',      initials: 'AR', tile: 'bamboo', email: 'augusta.reeves@example.com', phone: '(404) 555-0507', skill: 'Experienced', zip: '30306', area: 'Morningside', tint: 'cream' },
  u13: { id: 'u13', name: 'Rosalind Tate',       initials: 'RT', tile: 'red', email: 'rosalind.tate@example.com', phone: '(404) 555-0544', skill: 'Experienced', zip: '30305', area: 'Buckhead', tint: 'bone' },
  u14: { id: 'u14', name: 'Mary-Beth Ainsworth', initials: 'MA', tile: 'green', email: 'mary-beth.ainsworth@example.com', phone: '(404) 555-0581', skill: 'Experienced', zip: '30305', area: 'Buckhead', tint: 'sky' },
  u15: { id: 'u15', name: 'Sallie Devereaux',    initials: 'SD', tile: 'flower', email: 'sallie.devereaux@example.com', phone: '(404) 555-0618', skill: 'Experienced', zip: '30305', area: 'Buckhead', tint: 'sage' },
  u16: { id: 'u16', name: 'Tabitha Lockridge',   initials: 'TL', tile: 'spring', email: 'tabitha.lockridge@example.com', phone: '(404) 555-0655', skill: 'Experienced', zip: '30327', area: 'Buckhead', tint: 'cream' },
  u17: { id: 'u17', name: 'Winnie Carmichael',   initials: 'WC', tile: 'plum', email: 'winnie.carmichael@example.com', phone: '(404) 555-0692', skill: 'Experienced', zip: '30305', area: 'Buckhead', tint: 'bone' },
  u18: { id: 'u18', name: 'Edith Calloway',      initials: 'EC', tile: 'orchid', email: 'edith.calloway@example.com', phone: '(404) 555-0729', skill: 'Experienced', zip: '30305', area: 'Buckhead', tint: 'sky' },
  u19: { id: 'u19', name: 'Greta Mossbacher',    initials: 'GM', tile: 'mum', email: 'greta.mossbacher@example.com', phone: '(404) 555-0766', skill: 'Experienced', zip: '30327', area: 'Buckhead', tint: 'sage' },
  u20: { id: 'u20', name: 'Imogen Halliwell',    initials: 'IH', tile: 'bamboo', email: 'imogen.halliwell@example.com', phone: '(404) 555-0803', skill: 'Experienced', zip: '30319', area: 'Brookhaven', tint: 'bone' },
  u21: { id: 'u21', name: 'Josephine Karr',      initials: 'JK', tile: 'red', email: 'josephine.karr@example.com', phone: '(404) 555-0840', skill: 'Experienced', zip: '30319', area: 'Brookhaven', tint: 'sky' },
  u22: { id: 'u22', name: 'Delphine Forrest',    initials: 'DF', tile: 'green', email: 'delphine.forrest@example.com', phone: '(404) 555-0877', skill: 'Experienced', zip: '30319', area: 'Brookhaven', tint: 'sage' },
};

const TEAMS: Team[] = [
  { id: 't1', name: 'Jade Sparrows',    shortName: 'Sparrows',   captains: ['u1','u13'], divisionId: 'div-atl', points: 4980, prev: 2,  home: 'Cherokee Town Club',
    roster: ['u1','u13','u14','u15','u16','u17','u18','u19','u9','u10','u11'] },
  { id: 't2', name: 'Golden Bamboos',   shortName: 'Bamboos',    captains: ['u2','u20'], divisionId: 'div-atl', points: 5210, prev: 1,  home: 'Capital City Country Club',
    roster: ['u2','u20','u21','u22'] },
  { id: 't3', name: 'White Magnolias',  shortName: 'Magnolias',  captains: ['u3'], divisionId: 'div-atl', points: 5090, prev: 1,  home: 'The Cathedral Antique Show Hall',
    roster: ['u3'] },
  { id: 't4', name: 'Red Dragons',      shortName: 'Dragons',    captains: ['u4'], divisionId: 'div-atl', points: 4720, prev: -1, home: 'Dunwoody Country Club',
    roster: ['u4'] },
  { id: 't5', name: 'Silver Cranes',    shortName: 'Cranes',     captains: ['u5'], divisionId: 'div-atl', points: 4460, prev: 0,  home: 'Roswell Garden Club',
    roster: ['u5'] },
  { id: 't6', name: 'Pearl Doves',      shortName: 'Doves',      captains: ['u6'], divisionId: 'div-atl', points: 4210, prev: -1, home: 'Decatur Recreation Center',
    roster: ['u6'] },
  { id: 't7', name: 'Wild Orchids',     shortName: 'Orchids',    captains: ['u7'], divisionId: 'div-atl', points: 3980, prev: 1,  home: 'Druid Hills Golf Club',
    roster: ['u7'] },
  { id: 't8', name: 'Autumn Peonies',   shortName: 'Peonies',    captains: ['u8'], divisionId: 'div-atl', points: 3640, prev: -1, home: 'Frasier Center',
    roster: ['u8'] },
];

// Matches are empty until the admin generates and finalizes the schedule
const MATCHES: Match[] = [];

const ANNOUNCEMENTS: Announcement[] = [
  { id: 'a1', date: '2026-05-13', title: 'East Wind Open registration is open',
    body: 'The mid-season tournament returns to the Cathedral on June 12-14. Reserve your seat - first 64 in.' },
  { id: 'a2', date: '2026-05-11', title: 'Welcome our new members',
    body: 'Yuko and Renata join Marietta this week. Say hello when you see them at the table.' },
];

const DOCUMENTS: Document[] = [
  { id: 'd1', cat: 'Rules',   title: 'Tournament Rulebook · 2026 Season',     pages: 14, role: 'all',     updated: '2026-04-02' },
  { id: 'd2', cat: 'Rules',   title: 'Scoring Conventions',                    pages: 6,  role: 'all',     updated: '2026-04-02' },
  { id: 'd3', cat: 'Captain', title: 'Captain Handbook',                       pages: 22, role: 'captain', updated: '2026-04-10' },
  { id: 'd4', cat: 'Captain', title: 'Availability Email Templates',           pages: 3,  role: 'captain', updated: '2026-04-10' },
  { id: 'd5', cat: 'League',  title: 'Code of Conduct & Hold-Harmless',        pages: 4,  role: 'all',     updated: '2026-03-01' },
  { id: 'd6', cat: 'League',  title: 'Spring 2026 Season Packet',              pages: 18, role: 'all',     updated: '2026-03-25' },
  { id: 'd7', cat: 'League',  title: 'Atlanta League · Member Directory',      pages: 9,  role: 'all',     updated: '2026-05-01' },
  { id: 'd8', cat: 'Rules',   title: 'ALMA Scorecard',                         pages: 1,  role: 'all',     updated: '2026-09-15' },
];

const FAQS: FAQ[] = [
  { id: 'f1', cat: 'Account',    q: 'How do I reset my password?',
    a: "From the sign-in screen, tap \"Forgot password\" and we'll send a link to your registered email." },
  { id: 'f2', cat: 'Teams',      q: 'Can I be on more than one team in a season?',
    a: "No. Each player belongs to one team per eight-week season. After the season closes, you're free to join a different captain's roster the next round." },
  { id: 'f3', cat: 'Scheduling', q: 'How many matches does my team play each week?',
    a: 'Three. Each week you face one other team, and both sides split into pairs of two - so there are three tables running.' },
  { id: 'f9', cat: 'Scoring',    q: 'How does scoring work?',
    a: "Every match is scored from 1 to 999 points. Your team's score for the week is the sum of all four match scores." },
  { id: 'f4', cat: 'Scoring',    q: 'A score was entered wrong - what now?',
    a: "Ask either team's captain. Scores lock as soon as a player submits them, and only a captain can override the entry." },
  { id: 'f5', cat: 'Payments',   q: 'When are season dues due?',
    a: "Dues are due by the start of Week 1. Captains can pay for their whole roster; we'll send an itemized receipt to each player." },
];

const PAYMENTS_HISTORY: PaymentRecord[] = [
  { id: 'p1', season: 'Spring 2026', amount: 75, method: 'Square', status: 'Paid', date: '2026-03-18' },
  { id: 'p2', season: 'Fall 2025',   amount: 75, method: 'Square', status: 'Paid', date: '2025-09-04' },
  { id: 'p3', season: 'Spring 2025', amount: 75, method: 'Square', status: 'Paid', date: '2025-03-12' },
];

function expandWeeklyAnswers(base: Record<string, Record<string, string>>, weeks = 8): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  const uids = Object.keys(base);
  uids.forEach((uid, ui) => {
    const mine: Record<string, string> = {};
    for (let w = 1; w <= weeks; w++) {
      const slotIds = Object.keys(base[uid]);
      slotIds.forEach((slotId, si) => {
        if (w >= 6 && (ui + si + w) % 4 === 0) return;
        const flip = (ui * 3 + si * 5 + w * 7) % 11 === 0;
        const v = base[uid][slotId];
        mine[`w${w}-${slotId}`] = flip ? (v === 'yes' ? 'no' : 'yes') : v;
      });
    }
    out[uid] = mine;
  });
  return out;
}

const SEASON: Season = {
  id: 'local-season',
  name: 'Spring 2026',
  startDate: '2026-04-28',
  endDate: '2026-06-16',
  weekCount: 8,
  currentWeek: 1,
  fee: 75,
  forfeitPoints: 75,
  weekWinBonus: 50,
  shortHandedBonus: 15,
  proposeByWeeksOut: 2,
  acceptByWeeksOut: 1,
  playWindows: [
    { id: 'pw1', days: [2, 3], start: '09:00', end: '15:00' },
    { id: 'pw2', days: [6],    start: '10:00', end: '14:00' },
  ],
  published: false,
  scheduleFinalized: false,
  awayRoster: {},
  awayAlternates: {},
  slotAvailability: expandWeeklyAnswers({
    u1:  { 'pw1-2': 'yes', 'pw1-3': 'yes', 'pw2-6': 'yes' },
    u2:  { 'pw1-2': 'yes', 'pw1-3': 'no',  'pw2-6': 'yes' },
    u3:  { 'pw1-2': 'no',  'pw1-3': 'yes', 'pw2-6': 'yes' },
    u4:  { 'pw1-2': 'yes', 'pw1-3': 'yes', 'pw2-6': 'no'  },
    u5:  { 'pw1-2': 'yes', 'pw1-3': 'no',  'pw2-6': 'no'  },
    u13: { 'pw1-2': 'yes', 'pw1-3': 'no',  'pw2-6': 'yes' },
    u14: { 'pw1-2': 'no',  'pw1-3': 'yes', 'pw2-6': 'yes' },
    u15: { 'pw1-2': 'yes', 'pw1-3': 'yes', 'pw2-6': 'no'  },
    u16: { 'pw1-2': 'yes', 'pw1-3': 'no',  'pw2-6': 'no'  },
    u17: { 'pw1-2': 'yes', 'pw1-3': 'yes', 'pw2-6': 'yes' },
    u18: { 'pw1-2': 'no',  'pw1-3': 'yes', 'pw2-6': 'yes' },
    u19: { 'pw1-2': 'yes', 'pw1-3': 'yes', 'pw2-6': 'no'  },
  }),
};

// Substitutes
PEOPLE.majigan = { id: 'majigan', name: 'The Majigan', initials: 'MJ', tile: 'joker', sub: true,
  note: 'Guest player · not a league member', email: '', phone: '', skill: 'Guest', area: '' };

// Admin account
PEOPLE.admin1 = { id: 'admin1', name: 'ALMA Admin', initials: 'AA', tile: 'flower', email: 'info@almamahj.com', phone: '', skill: '-',
  zip: '', area: '', tint: 'sky', title: 'League administrator' };

const ADMIN_USER   = 'admin1';
const CAPTAIN_USER = 'u1';
const PLAYER_USER  = 'u15';

const TEAM_CODES: Record<string, string> = {
  t1: 'SPAR-4471', t2: 'BAMB-2903', t3: 'MAGN-7714', t4: 'DRAG-5182',
  t5: 'CRAN-6340', t6: 'DOVE-8125', t7: 'ORCH-3097', t8: 'PEON-9256',
};

// Fill rosters to 8 players each
const firstNames = ['Genevieve','Cecilia','Marguerite','Ophelia','Clementine','Rosamund','Theodora','Arabella','Millicent','Prudence','Wilhelmina','Constance','Georgiana','Henrietta','Evangeline','Dorothea','Cordelia','Philippa','Seraphina','Antonia','Isadora','Lavinia','Octavia','Bernadette','Guinevere','Hortense','Josepha','Katharine','Leonora','Matilda','Nadine','Odette'];
const lastNames  = ['Ashford','Berkeley','Chamberlain','Delacroix','Ellsworth','Fairbanks','Grantham','Harrington','Ingram','Kingsley','Ledbetter','Montague','Northcott','Ormsby','Prescott','Radcliffe','Sedgwick','Thornbury','Underwood','Vandergriff','Winthrop','Yardley'];
const tints = ['bone','cream','sky','sage'];

let n = 0;
TEAMS.forEach(team => {
  while (team.roster.length < 8) {
    const id = `${team.id}-f${team.roster.length}`;
    const fn = firstNames[n % firstNames.length];
    const ln = lastNames[(n + team.roster.length) % lastNames.length];
    const tiles = ['plum','orchid','mum','bamboo','red','green','flower','spring'];
    PEOPLE[id] = {
      id, name: `${fn} ${ln}`, initials: (fn[0] + ln[0]).toUpperCase(),
      tile: tiles[n % tiles.length],
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@example.com`,
      phone: `(404) 555-${String(1000 + n).slice(-4)}`,
      skill: 'Experienced', zip: '30305', area: 'Buckhead', tint: tints[n % tints.length],
    };
    SEASON.slotAvailability[id] = expandWeeklyAnswers({ [id]: {
      'pw1-2': n % 4 === 1 ? 'no' : 'yes', 'pw1-3': n % 3 === 0 ? 'no' : 'yes', 'pw2-6': n % 5 === 2 ? 'no' : 'yes',
    } }, SEASON.weekCount)[id];
    team.roster.push(id);
    n++;
  }
});

// Build dues
const DUES: Record<string, DuesRecord> = {};
const unpaid = ['u19', 'u21', 'u22'];
const manual = ['u8'];
Object.keys(PEOPLE).forEach((id, i) => {
  if (unpaid.includes(id)) { DUES[id] = { status: 'unpaid' }; return; }
  DUES[id] = manual.includes(id)
    ? { status: 'paid', amount: 75, method: 'manual', date: '2026-03-11', ref: 'Cash · recorded by admin' }
    : { status: 'paid', amount: 75, method: 'square', date: `2026-03-${String(4 + (i % 21)).padStart(2, '0')}`, ref: `SQ-${4471 + i * 37}` };
});

export function createInitialDB(): AlmaDB {
  return {
    DIVISIONS,
    PEOPLE: { ...PEOPLE },
    TEAMS: TEAMS.map(tm => ({ ...tm, roster: [...tm.roster] })),
    MATCHES: MATCHES.map(m => ({ ...m, seats: { home: [...m.seats.home], away: [...m.seats.away] } })),
    ANNOUNCEMENTS,
    DOCUMENTS,
    FAQS,
    PAYMENTS_HISTORY,
    DUES: { ...DUES },
    SEASON: {
      ...SEASON,
      playWindows: SEASON.playWindows.map(w => ({ ...w, days: [...w.days] })),
      slotAvailability: Object.fromEntries(
        Object.entries(SEASON.slotAvailability).map(([k, v]) => [k, { ...v }])
      ),
    },
    CURRENT_USER: CAPTAIN_USER,
    TEAM_CODES: { ...TEAM_CODES },
    ADMIN_USER,
    CAPTAIN_USER,
    PLAYER_USER,
    SUBSTITUTES: ['majigan'],
  };
}
