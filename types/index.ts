export interface Person {
  id: string;
  name: string;
  initials: string;
  tile: string;
  email: string;
  phone: string;
  skill: string;
  zip?: string;
  area?: string;
  tint?: string;
  title?: string;
  sub?: boolean;
  note?: string;
}

export interface Division {
  id: string;
  name: string;
  region: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  captains: string[];
  divisionId: string;
  points: number;
  prev: number;
  home: string;
  roster: string[];
}

export interface MatchSeats {
  home: (string | null)[];
  away: (string | null)[];
}

export interface MatchResult {
  home: number;
  away: number;
}

export interface MatchPlan {
  when?: string;
  where?: string;
  by?: string;
  at?: string;
}

export interface Match {
  id: string;
  week: number;
  table: number;
  type: string;
  home: string;
  away: string;
  seats: MatchSeats;
  status: 'open' | 'final';
  result: MatchResult | null;
  plan?: MatchPlan;
  enteredBy?: string;
  enteredAt?: string;
  editedBy?: string;
  editedAt?: string;
  forfeitBy?: string;
}

export interface PlayWindow {
  id: string;
  days: number[];
  start: string;
  end: string;
}

export interface Season {
  name: string;
  startDate: string;
  endDate: string;
  weekCount: number;
  currentWeek: number;
  fee: number;
  forfeitPoints: number;
  weekWinBonus: number;
  proposeByWeeksOut: number;
  acceptByWeeksOut: number;
  playWindows: PlayWindow[];
  published: boolean;
  awayRoster: Record<number, string[]>;
  slotAvailability: Record<string, Record<string, string>>;
}

export interface Announcement {
  id: string;
  date: string;
  title: string;
  body: string;
}

export interface Document {
  id: string;
  cat: string;
  title: string;
  pages: number;
  role: string;
  updated: string;
}

export interface FAQ {
  id: string;
  cat: string;
  q: string;
  a: string;
}

export interface PaymentRecord {
  id: string;
  season: string;
  amount: number;
  method: string;
  status: string;
  date: string;
}

export interface DuesRecord {
  status: 'paid' | 'unpaid';
  amount?: number;
  method?: string;
  date?: string;
  ref?: string;
}

export interface AlmaDB {
  DIVISIONS: Division[];
  PEOPLE: Record<string, Person>;
  TEAMS: Team[];
  MATCHES: Match[];
  ANNOUNCEMENTS: Announcement[];
  DOCUMENTS: Document[];
  FAQS: FAQ[];
  PAYMENTS_HISTORY: PaymentRecord[];
  DUES: Record<string, DuesRecord>;
  SEASON: Season;
  CURRENT_USER: string;
  TEAM_CODES: Record<string, string>;
  ADMIN_USER: string;
  CAPTAIN_USER: string;
  PLAYER_USER: string;
  SUBSTITUTES: string[];
  ROLE?: string;
}

export interface Viewer {
  uid: string;
  role: string;
  team: Team | null;
  me: Person;
  def: RoleDef;
  can: RoleCaps;
  isCaptain: boolean;
  isPlayer: boolean;
  isAdmin: boolean;
}

export interface RoleDef {
  id: string;
  label: string;
  chip: string;
  tagline: string;
  blurb: string;
  joinsWith: string | null;
}

export interface RoleCaps {
  invitePlayers: boolean;
  settleScores: boolean;
  dispute: boolean;
  proposeDates: boolean;
  bulkPay: boolean;
  captainDocs: boolean;
  manageRoster: boolean;
}
