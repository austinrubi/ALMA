#!/usr/bin/env node
// Seeds the hosted Supabase project with fake data via the Admin API.
// Usage: node scripts/seed-remote.mjs

const SUPABASE_URL = 'https://scqpsifwmtkxooubhyiy.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('Set SUPABASE_SERVICE_ROLE_KEY env var');
  process.exit(1);
}

const headers = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=minimal',
};

async function api(path, method, body) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers: { ...headers, ...(method === 'POST' || method === 'PATCH' ? {} : { 'Content-Type': undefined }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path}: ${res.status} ${text}`);
  }
  const ct = res.headers.get('content-type');
  if (ct && ct.includes('json')) return res.json();
  return null;
}

async function restPost(table, rows) {
  return api(`/rest/v1/${table}`, 'POST', rows);
}

async function restUpsert(table, rows) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`UPSERT ${table}: ${res.status} ${text}`);
  }
}

async function createAuthUser(id, email, name) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id,
      email,
      password: 'password123',
      email_confirm: true,
      user_metadata: { name },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    if (text.includes('already been registered') || text.includes('already exists')) {
      console.log(`  (exists) ${email}`);
      return;
    }
    throw new Error(`Create user ${email}: ${res.status} ${text}`);
  }
  console.log(`  + ${email}`);
}

// ── User definitions ──────────────────────────────────────────
const USERS = [
  { id: 'd0000000-0000-0000-0000-000000000001', email: 'margaret.holloway@example.com', name: 'Margaret Holloway', phone: '(404) 555-0100', tile: 'plum', tint: 'bone', zip: '30305', area: 'Buckhead', role: 'captain' },
  { id: 'd0000000-0000-0000-0000-000000000002', email: 'caroline.pritchett@example.com', name: 'Caroline Pritchett', phone: '(404) 555-0137', tile: 'orchid', tint: 'sky', zip: '30319', area: 'Brookhaven', role: 'captain' },
  { id: 'd0000000-0000-0000-0000-000000000003', email: 'eleanor.vance@example.com', name: 'Eleanor Vance', phone: '(404) 555-0174', tile: 'mum', tint: 'sage', zip: '30327', area: 'Sandy Springs', role: 'captain' },
  { id: 'd0000000-0000-0000-0000-000000000004', email: 'beatrice.whitfield@example.com', name: 'Beatrice Whitfield', phone: '(404) 555-0211', tile: 'bamboo', tint: 'cream', zip: '30338', area: 'Dunwoody', role: 'captain' },
  { id: 'd0000000-0000-0000-0000-000000000005', email: 'vivian.locke@example.com', name: 'Vivian Locke', phone: '(404) 555-0248', tile: 'red', tint: 'sky', zip: '30075', area: 'Roswell', role: 'captain' },
  { id: 'd0000000-0000-0000-0000-000000000006', email: 'adelaide.quinn@example.com', name: 'Adelaide Quinn', phone: '(404) 555-0285', tile: 'green', tint: 'bone', zip: '30030', area: 'Decatur', role: 'captain' },
  { id: 'd0000000-0000-0000-0000-000000000007', email: 'frances.eberhardt@example.com', name: 'Frances Eberhardt', phone: '(404) 555-0322', tile: 'flower', tint: 'sage', zip: '30307', area: 'Druid Hills', role: 'captain' },
  { id: 'd0000000-0000-0000-0000-000000000008', email: 'harriet.compton@example.com', name: 'Harriet Compton', phone: '(404) 555-0359', tile: 'spring', tint: 'cream', zip: '30306', area: 'Va-Highland', role: 'captain' },
  { id: 'd0000000-0000-0000-0000-000000000009', email: 'lillian.marchetti@example.com', name: 'Lillian Marchetti', phone: '(404) 555-0396', tile: 'plum', tint: 'sky', zip: '30316', area: 'East Atlanta', role: 'player' },
  { id: 'd0000000-0000-0000-0000-000000000010', email: 'penelope.strathmore@example.com', name: 'Penelope Strathmore', phone: '(404) 555-0433', tile: 'orchid', tint: 'bone', zip: '30068', area: 'Marietta', role: 'player' },
  { id: 'd0000000-0000-0000-0000-000000000011', email: 'cornelia.boatwright@example.com', name: 'Cornelia Boatwright', phone: '(404) 555-0470', tile: 'mum', tint: 'sage', zip: '30307', area: 'Inman Park', role: 'player' },
  { id: 'd0000000-0000-0000-0000-000000000012', email: 'augusta.reeves@example.com', name: 'Augusta Reeves', phone: '(404) 555-0507', tile: 'bamboo', tint: 'cream', zip: '30306', area: 'Morningside', role: 'player' },
  { id: 'd0000000-0000-0000-0000-000000000013', email: 'rosalind.tate@example.com', name: 'Rosalind Tate', phone: '(404) 555-0544', tile: 'red', tint: 'bone', zip: '30305', area: 'Buckhead', role: 'captain' },
  { id: 'd0000000-0000-0000-0000-000000000014', email: 'mary-beth.ainsworth@example.com', name: 'Mary-Beth Ainsworth', phone: '(404) 555-0581', tile: 'green', tint: 'sky', zip: '30305', area: 'Buckhead', role: 'player' },
  { id: 'd0000000-0000-0000-0000-000000000015', email: 'sallie.devereaux@example.com', name: 'Sallie Devereaux', phone: '(404) 555-0618', tile: 'flower', tint: 'sage', zip: '30305', area: 'Buckhead', role: 'player' },
  { id: 'd0000000-0000-0000-0000-000000000016', email: 'tabitha.lockridge@example.com', name: 'Tabitha Lockridge', phone: '(404) 555-0655', tile: 'spring', tint: 'cream', zip: '30327', area: 'Buckhead', role: 'player' },
  { id: 'd0000000-0000-0000-0000-000000000017', email: 'winnie.carmichael@example.com', name: 'Winnie Carmichael', phone: '(404) 555-0692', tile: 'plum', tint: 'bone', zip: '30305', area: 'Buckhead', role: 'player' },
  { id: 'd0000000-0000-0000-0000-000000000018', email: 'edith.calloway@example.com', name: 'Edith Calloway', phone: '(404) 555-0729', tile: 'orchid', tint: 'sky', zip: '30305', area: 'Buckhead', role: 'player' },
  { id: 'd0000000-0000-0000-0000-000000000019', email: 'greta.mossbacher@example.com', name: 'Greta Mossbacher', phone: '(404) 555-0766', tile: 'mum', tint: 'sage', zip: '30327', area: 'Buckhead', role: 'player' },
  { id: 'd0000000-0000-0000-0000-000000000020', email: 'imogen.halliwell@example.com', name: 'Imogen Halliwell', phone: '(404) 555-0803', tile: 'bamboo', tint: 'bone', zip: '30319', area: 'Brookhaven', role: 'captain' },
  { id: 'd0000000-0000-0000-0000-000000000021', email: 'josephine.karr@example.com', name: 'Josephine Karr', phone: '(404) 555-0840', tile: 'red', tint: 'sky', zip: '30319', area: 'Brookhaven', role: 'player' },
  { id: 'd0000000-0000-0000-0000-000000000022', email: 'delphine.forrest@example.com', name: 'Delphine Forrest', phone: '(404) 555-0877', tile: 'green', tint: 'sage', zip: '30319', area: 'Brookhaven', role: 'player' },
  { id: 'd0000000-0000-0000-0000-000000000099', email: 'harper.vance@example.com', name: 'Harper Vance', phone: '(404) 555-0914', tile: 'flower', tint: 'sky', zip: '30305', area: 'Buckhead', role: 'admin' },
];

// Generate filler roster users
const firstNames = ['Genevieve','Cecilia','Marguerite','Ophelia','Clementine','Rosamund','Theodora','Arabella','Millicent','Prudence','Wilhelmina','Constance','Georgiana','Henrietta','Evangeline','Dorothea','Cordelia','Philippa','Seraphina','Antonia','Isadora','Lavinia','Octavia','Bernadette','Guinevere','Hortense','Josepha','Katharine','Leonora','Matilda','Nadine','Odette'];
const lastNames = ['Ashford','Berkeley','Chamberlain','Delacroix','Ellsworth','Fairbanks','Grantham','Harrington','Ingram','Kingsley','Ledbetter','Montague','Northcott','Ormsby','Prescott','Radcliffe','Sedgwick','Thornbury','Underwood','Vandergriff','Winthrop','Yardley'];
const tints = ['bone','cream','sky','sage'];

for (let i = 0; i < 32; i++) {
  const n = 101 + i;
  const fn = firstNames[i % firstNames.length];
  const ln = lastNames[(i + 5) % lastNames.length];
  USERS.push({
    id: `d0000000-0000-0000-0000-0000000001${String(n).slice(-2)}`,
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}@example.com`,
    name: `${fn} ${ln}`,
    phone: `(404) 555-${String(1000 + i).slice(-4)}`,
    tile: 'plum', tint: tints[i % 4], zip: '30305', area: 'Buckhead', role: 'player',
  });
}

// ── Team member assignments ──────────────────────────────────
const SEASON_ID = 'a0000000-0000-0000-0000-000000000001';
const TEAM_IDS = [
  'c0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000002',
  'c0000000-0000-0000-0000-000000000003',
  'c0000000-0000-0000-0000-000000000004',
  'c0000000-0000-0000-0000-000000000005',
  'c0000000-0000-0000-0000-000000000006',
  'c0000000-0000-0000-0000-000000000007',
  'c0000000-0000-0000-0000-000000000008',
];

const u = (n) => `d0000000-0000-0000-0000-${String(n).padStart(12, '0')}`;

const TEAM_MEMBERS = [
  // Team 1: Jade Sparrows
  { team_id: TEAM_IDS[0], user_id: u(1), team_role: 'captain' },
  { team_id: TEAM_IDS[0], user_id: u(13), team_role: 'captain' },
  { team_id: TEAM_IDS[0], user_id: u(14), team_role: 'player' },
  { team_id: TEAM_IDS[0], user_id: u(15), team_role: 'player' },
  { team_id: TEAM_IDS[0], user_id: u(16), team_role: 'player' },
  { team_id: TEAM_IDS[0], user_id: u(17), team_role: 'player' },
  { team_id: TEAM_IDS[0], user_id: u(18), team_role: 'player' },
  { team_id: TEAM_IDS[0], user_id: u(19), team_role: 'player' },
  // Team 2: Golden Bamboos
  { team_id: TEAM_IDS[1], user_id: u(2), team_role: 'captain' },
  { team_id: TEAM_IDS[1], user_id: u(20), team_role: 'captain' },
  { team_id: TEAM_IDS[1], user_id: u(21), team_role: 'player' },
  { team_id: TEAM_IDS[1], user_id: u(22), team_role: 'player' },
  { team_id: TEAM_IDS[1], user_id: u(101), team_role: 'player' },
  { team_id: TEAM_IDS[1], user_id: u(102), team_role: 'player' },
  { team_id: TEAM_IDS[1], user_id: u(103), team_role: 'player' },
  { team_id: TEAM_IDS[1], user_id: u(104), team_role: 'player' },
  // Team 3: White Magnolias
  { team_id: TEAM_IDS[2], user_id: u(3), team_role: 'captain' },
  { team_id: TEAM_IDS[2], user_id: u(105), team_role: 'player' },
  { team_id: TEAM_IDS[2], user_id: u(106), team_role: 'player' },
  { team_id: TEAM_IDS[2], user_id: u(107), team_role: 'player' },
  { team_id: TEAM_IDS[2], user_id: u(108), team_role: 'player' },
  { team_id: TEAM_IDS[2], user_id: u(109), team_role: 'player' },
  { team_id: TEAM_IDS[2], user_id: u(110), team_role: 'player' },
  { team_id: TEAM_IDS[2], user_id: u(111), team_role: 'player' },
  // Team 4: Red Dragons
  { team_id: TEAM_IDS[3], user_id: u(4), team_role: 'captain' },
  { team_id: TEAM_IDS[3], user_id: u(112), team_role: 'player' },
  { team_id: TEAM_IDS[3], user_id: u(113), team_role: 'player' },
  { team_id: TEAM_IDS[3], user_id: u(114), team_role: 'player' },
  { team_id: TEAM_IDS[3], user_id: u(115), team_role: 'player' },
  { team_id: TEAM_IDS[3], user_id: u(116), team_role: 'player' },
  { team_id: TEAM_IDS[3], user_id: u(117), team_role: 'player' },
  { team_id: TEAM_IDS[3], user_id: u(118), team_role: 'player' },
  // Team 5: Silver Cranes
  { team_id: TEAM_IDS[4], user_id: u(5), team_role: 'captain' },
  { team_id: TEAM_IDS[4], user_id: u(119), team_role: 'player' },
  { team_id: TEAM_IDS[4], user_id: u(120), team_role: 'player' },
  { team_id: TEAM_IDS[4], user_id: u(121), team_role: 'player' },
  { team_id: TEAM_IDS[4], user_id: u(122), team_role: 'player' },
  { team_id: TEAM_IDS[4], user_id: u(123), team_role: 'player' },
  { team_id: TEAM_IDS[4], user_id: u(124), team_role: 'player' },
  { team_id: TEAM_IDS[4], user_id: u(125), team_role: 'player' },
  // Team 6: Pearl Doves
  { team_id: TEAM_IDS[5], user_id: u(6), team_role: 'captain' },
  { team_id: TEAM_IDS[5], user_id: u(126), team_role: 'player' },
  { team_id: TEAM_IDS[5], user_id: u(127), team_role: 'player' },
  { team_id: TEAM_IDS[5], user_id: u(128), team_role: 'player' },
  { team_id: TEAM_IDS[5], user_id: u(129), team_role: 'player' },
  { team_id: TEAM_IDS[5], user_id: u(130), team_role: 'player' },
  { team_id: TEAM_IDS[5], user_id: u(131), team_role: 'player' },
  { team_id: TEAM_IDS[5], user_id: u(132), team_role: 'player' },
  // Team 7: Wild Orchids
  { team_id: TEAM_IDS[6], user_id: u(7), team_role: 'captain' },
  { team_id: TEAM_IDS[6], user_id: u(9), team_role: 'player' },
  { team_id: TEAM_IDS[6], user_id: u(10), team_role: 'player' },
  { team_id: TEAM_IDS[6], user_id: u(11), team_role: 'player' },
  { team_id: TEAM_IDS[6], user_id: u(12), team_role: 'player' },
  // Team 8: Autumn Peonies
  { team_id: TEAM_IDS[7], user_id: u(8), team_role: 'captain' },
];

// ── Matches ──────────────────────────────────────────────────
const e = (n) => `e0000000-0000-0000-0000-${String(n).padStart(12, '0')}`;

const MATCHES = [
  // Week 4: Sparrows host Bamboos
  { id: e(1), season_id: SEASON_ID, week: 4, table_num: 1, match_type: 'tournament', home_team_id: TEAM_IDS[0], away_team_id: TEAM_IDS[1], status: 'final' },
  { id: e(2), season_id: SEASON_ID, week: 4, table_num: 2, match_type: 'tournament', home_team_id: TEAM_IDS[0], away_team_id: TEAM_IDS[1], status: 'final' },
  { id: e(3), season_id: SEASON_ID, week: 4, table_num: 3, match_type: 'tournament', home_team_id: TEAM_IDS[0], away_team_id: TEAM_IDS[1], status: 'open' },
  { id: e(4), season_id: SEASON_ID, week: 4, table_num: 4, match_type: 'tournament', home_team_id: TEAM_IDS[0], away_team_id: TEAM_IDS[1], status: 'open' },
  // Week 3: Sparrows host Magnolias
  { id: e(5), season_id: SEASON_ID, week: 3, table_num: 1, match_type: 'tournament', home_team_id: TEAM_IDS[0], away_team_id: TEAM_IDS[2], status: 'final' },
  { id: e(6), season_id: SEASON_ID, week: 3, table_num: 2, match_type: 'tournament', home_team_id: TEAM_IDS[0], away_team_id: TEAM_IDS[2], status: 'final' },
  { id: e(7), season_id: SEASON_ID, week: 3, table_num: 3, match_type: 'tournament', home_team_id: TEAM_IDS[0], away_team_id: TEAM_IDS[2], status: 'final' },
  { id: e(8), season_id: SEASON_ID, week: 3, table_num: 4, match_type: 'tournament', home_team_id: TEAM_IDS[0], away_team_id: TEAM_IDS[2], status: 'final' },
  // Week 5: Dragons host Sparrows
  { id: e(9),  season_id: SEASON_ID, week: 5, table_num: 1, match_type: 'tournament', home_team_id: TEAM_IDS[3], away_team_id: TEAM_IDS[0], status: 'open' },
  { id: e(10), season_id: SEASON_ID, week: 5, table_num: 2, match_type: 'tournament', home_team_id: TEAM_IDS[3], away_team_id: TEAM_IDS[0], status: 'open' },
  { id: e(11), season_id: SEASON_ID, week: 5, table_num: 3, match_type: 'tournament', home_team_id: TEAM_IDS[3], away_team_id: TEAM_IDS[0], status: 'open' },
  { id: e(12), season_id: SEASON_ID, week: 5, table_num: 4, match_type: 'tournament', home_team_id: TEAM_IDS[3], away_team_id: TEAM_IDS[0], status: 'open' },
  // Week 1: Sparrows host Cranes
  { id: e(13), season_id: SEASON_ID, week: 1, table_num: 1, match_type: 'tournament', home_team_id: TEAM_IDS[0], away_team_id: TEAM_IDS[4], status: 'final' },
  { id: e(14), season_id: SEASON_ID, week: 1, table_num: 2, match_type: 'tournament', home_team_id: TEAM_IDS[0], away_team_id: TEAM_IDS[4], status: 'final' },
  { id: e(15), season_id: SEASON_ID, week: 1, table_num: 3, match_type: 'tournament', home_team_id: TEAM_IDS[0], away_team_id: TEAM_IDS[4], status: 'final' },
  { id: e(16), season_id: SEASON_ID, week: 1, table_num: 4, match_type: 'tournament', home_team_id: TEAM_IDS[0], away_team_id: TEAM_IDS[4], status: 'final' },
];

const MATCH_SEATS = [
  // Week 4 table 1
  { match_id: e(1), side: 'home', seat_index: 0, user_id: u(1) },
  { match_id: e(1), side: 'home', seat_index: 1, user_id: u(13) },
  { match_id: e(1), side: 'away', seat_index: 0, user_id: u(2) },
  { match_id: e(1), side: 'away', seat_index: 1, user_id: u(20) },
  // Week 4 table 2
  { match_id: e(2), side: 'home', seat_index: 0, user_id: u(14) },
  { match_id: e(2), side: 'home', seat_index: 1, user_id: u(15) },
  { match_id: e(2), side: 'away', seat_index: 0, user_id: u(21) },
  { match_id: e(2), side: 'away', seat_index: 1, user_id: u(22) },
  // Week 4 table 3
  { match_id: e(3), side: 'home', seat_index: 0, user_id: u(16) },
  { match_id: e(3), side: 'home', seat_index: 1, user_id: u(17) },
  // Week 4 table 4
  { match_id: e(4), side: 'home', seat_index: 0, user_id: u(18) },
  { match_id: e(4), side: 'home', seat_index: 1, user_id: u(19) },
  // Week 3 table 1
  { match_id: e(5), side: 'home', seat_index: 0, user_id: u(1) },
  { match_id: e(5), side: 'home', seat_index: 1, user_id: u(17) },
  { match_id: e(5), side: 'away', seat_index: 0, user_id: u(3) },
  // Week 3 table 2
  { match_id: e(6), side: 'home', seat_index: 0, user_id: u(13) },
  { match_id: e(6), side: 'home', seat_index: 1, user_id: u(15) },
  // Week 3 table 3
  { match_id: e(7), side: 'home', seat_index: 0, user_id: u(14) },
  { match_id: e(7), side: 'home', seat_index: 1, user_id: u(16) },
  // Week 3 table 4
  { match_id: e(8), side: 'home', seat_index: 0, user_id: u(18) },
  { match_id: e(8), side: 'home', seat_index: 1, user_id: u(19) },
  // Week 5 table 1
  { match_id: e(9), side: 'home', seat_index: 0, user_id: u(4) },
  // Week 1
  { match_id: e(13), side: 'home', seat_index: 0, user_id: u(1) },
  { match_id: e(13), side: 'home', seat_index: 1, user_id: u(15) },
  { match_id: e(13), side: 'away', seat_index: 0, user_id: u(5) },
  { match_id: e(14), side: 'home', seat_index: 0, user_id: u(13) },
  { match_id: e(14), side: 'home', seat_index: 1, user_id: u(14) },
  { match_id: e(15), side: 'home', seat_index: 0, user_id: u(16) },
  { match_id: e(15), side: 'home', seat_index: 1, user_id: u(18) },
  { match_id: e(16), side: 'home', seat_index: 0, user_id: u(17) },
  { match_id: e(16), side: 'home', seat_index: 1, user_id: u(19) },
];

const MATCH_RESULTS = [
  { match_id: e(1),  home_score: 544, away_score: 498, entered_by: u(13), entered_at: '2026-05-19T21:40:00Z', edited_by: null, edited_at: null },
  { match_id: e(2),  home_score: 471, away_score: 602, entered_by: u(14), entered_at: '2026-05-20T22:05:00Z', edited_by: null, edited_at: null },
  { match_id: e(5),  home_score: 512, away_score: 476, entered_by: u(17), entered_at: '2026-05-12T22:14:00Z', edited_by: null, edited_at: null },
  { match_id: e(6),  home_score: 588, away_score: 401, entered_by: u(13), entered_at: '2026-05-10T18:02:00Z', edited_by: null, edited_at: null },
  { match_id: e(7),  home_score: 437, away_score: 610, entered_by: u(16), entered_at: '2026-05-08T20:31:00Z', edited_by: u(1), edited_at: '2026-05-09T09:12:00Z' },
  { match_id: e(8),  home_score: 503, away_score: 472, entered_by: u(19), entered_at: '2026-05-08T21:15:00Z', edited_by: null, edited_at: null },
  { match_id: e(13), home_score: 521, away_score: 468, entered_by: u(15), entered_at: '2026-04-29T21:10:00Z', edited_by: null, edited_at: null },
  { match_id: e(14), home_score: 486, away_score: 533, entered_by: u(13), entered_at: '2026-04-30T20:25:00Z', edited_by: null, edited_at: null },
  { match_id: e(15), home_score: 574, away_score: 442, entered_by: u(16), entered_at: '2026-05-01T19:48:00Z', edited_by: null, edited_at: null },
  { match_id: e(16), home_score: 455, away_score: 507, entered_by: u(19), entered_at: '2026-05-02T22:02:00Z', edited_by: null, edited_at: null },
];

const MATCH_PLANS = [
  { match_id: e(1), when_text: 'Tuesday, May 19 · 10:00 AM', where_text: 'Ansley Club, card room', set_by: u(13), set_at: '2026-05-15T14:00:00Z' },
];

// ── Main ─────────────────────────────────────────────────────
async function main() {
  console.log('Creating auth users...');
  for (const user of USERS) {
    await createAuthUser(user.id, user.email, user.name);
  }

  console.log('\nUpdating profiles...');
  for (const user of USERS) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        phone: user.phone,
        tile: user.tile,
        tint: user.tint,
        skill: user.role === 'admin' ? '-' : 'Experienced',
        zip: user.zip,
        area: user.area,
        role: user.role,
      }),
    });
    if (!res.ok) {
      console.error(`  Failed to update profile ${user.email}: ${res.status} ${await res.text()}`);
    }
  }
  console.log(`  Updated ${USERS.length} profiles`);

  console.log('\nInserting team members...');
  await restPost('team_members', TEAM_MEMBERS);
  console.log(`  Inserted ${TEAM_MEMBERS.length} team members`);

  console.log('\nInserting matches...');
  await restPost('matches', MATCHES);
  console.log(`  Inserted ${MATCHES.length} matches`);

  console.log('\nInserting match seats...');
  await restPost('match_seats', MATCH_SEATS);
  console.log(`  Inserted ${MATCH_SEATS.length} match seats`);

  console.log('\nInserting match results...');
  await restPost('match_results', MATCH_RESULTS);
  console.log(`  Inserted ${MATCH_RESULTS.length} match results`);

  console.log('\nInserting match plans...');
  await restPost('match_plans', MATCH_PLANS);
  console.log(`  Inserted ${MATCH_PLANS.length} match plans`);

  console.log('\nDone! You can now sign in as any fake user with password "password123"');
  console.log('Example: margaret.holloway@example.com / password123');
}

main().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
