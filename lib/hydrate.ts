import type { AlmaDB, Person, Team, Match, Season, PlayWindow, Announcement, Document, FAQ, PaymentRecord, DuesRecord } from '../types';
import * as Q from './supabase-queries';

// Fetches all data from Supabase and returns it in the AlmaDB shape.
// Throws on network/query errors — caller should catch and fall back.
export async function hydrateFromSupabase(currentUserId: string): Promise<AlmaDB> {
  const [
    season,
    profiles,
  ] = await Promise.all([
    Q.fetchSeason(),
    Q.fetchProfiles(),
  ]);

  const seasonId = season.id;

  const [
    playWindows,
    teams,
    teamMembers,
    matches,
    slotAvailability,
    documents,
    faqs,
    announcements,
  ] = await Promise.all([
    Q.fetchPlayWindows(seasonId),
    Q.fetchTeams(seasonId),
    Q.fetchTeamMembers(seasonId),
    Q.fetchMatches(seasonId),
    Q.fetchSlotAvailability(seasonId),
    Q.fetchDocuments(),
    Q.fetchFAQs(),
    Q.fetchAnnouncements(seasonId),
  ]);

  // --- Build PEOPLE ---
  const PEOPLE: Record<string, Person> = {};
  for (const p of profiles) {
    PEOPLE[p.id] = {
      id: p.id,
      name: p.name,
      initials: p.initials || p.name.slice(0, 2).toUpperCase(),
      tile: p.tile || 'plum',
      email: p.email,
      phone: p.phone || '',
      skill: p.skill || 'Experienced',
      zip: p.zip || undefined,
      area: p.area || undefined,
      tint: p.tint || 'bone',
    };
  }

  // Add virtual substitutes
  PEOPLE['majigan'] = { id: 'majigan', name: 'The Majigan', initials: 'MJ', tile: 'joker', sub: true, note: 'Guest player · not a league member', email: '', phone: '', skill: 'Guest', area: '' };
  PEOPLE['bob'] = { id: 'bob', name: 'Bob', initials: 'B', tile: 'blank', sub: true, note: 'Empty seat · three at the table', email: '', phone: '', skill: '-', area: '' };

  // --- Build TEAMS ---
  // Group team_members by team
  const membersByTeam: Record<string, typeof teamMembers> = {};
  for (const tm of teamMembers) {
    if (!membersByTeam[tm.team_id]) membersByTeam[tm.team_id] = [];
    membersByTeam[tm.team_id].push(tm);
  }

  const TEAM_CODES: Record<string, string> = {};
  const TEAMS: Team[] = teams.map(t => {
    const members = membersByTeam[t.id] || [];
    const captains = members.filter(m => m.team_role === 'captain').map(m => m.user_id);
    const roster = members.map(m => m.user_id);
    TEAM_CODES[t.id] = t.code;
    return {
      id: t.id,
      name: t.name,
      shortName: t.short_name,
      captains,
      divisionId: 'div-atl',
      points: t.points || 0,
      prev: t.prev_rank_change || 0,
      home: t.home_venue || '',
      roster,
    };
  });

  // --- Build MATCHES ---
  const MATCHES: Match[] = matches.map(m => {
    const seats = { home: [null, null] as (string | null)[], away: [null, null] as (string | null)[] };
    if (m.seats) {
      for (const s of m.seats) {
        const side = s.side as 'home' | 'away';
        if (side === 'home' || side === 'away') {
          seats[side][s.seat_index] = s.user_id || null;
        }
      }
    }

    const result = m.result && m.result.length > 0
      ? { home: m.result[0].home_score, away: m.result[0].away_score }
      : null;

    const plan = m.plan && m.plan.length > 0
      ? { when: m.plan[0].when_text, where: m.plan[0].where_text, by: m.plan[0].set_by, at: m.plan[0].set_at }
      : undefined;

    const resultRow = m.result?.[0];

    return {
      id: m.id,
      week: m.week,
      table: m.table_num,
      type: m.match_type || 'tournament',
      home: m.home_team_id,
      away: m.away_team_id,
      seats,
      status: m.status as 'open' | 'final',
      result,
      plan,
      enteredBy: resultRow?.entered_by || undefined,
      enteredAt: resultRow?.entered_at || undefined,
      editedBy: resultRow?.edited_by || undefined,
      editedAt: resultRow?.edited_at || undefined,
      forfeitBy: resultRow?.forfeit_side || undefined,
    };
  });

  // --- Build SEASON ---
  const pw: PlayWindow[] = playWindows.map(w => ({
    id: w.id,
    days: w.days,
    start: w.start_time,
    end: w.end_time,
  }));

  // Build slotAvailability map: { [userId]: { [compositeKey]: value } }
  const slotAvail: Record<string, Record<string, string>> = {};
  for (const sa of slotAvailability) {
    if (!slotAvail[sa.user_id]) slotAvail[sa.user_id] = {};
    slotAvail[sa.user_id][`w${sa.week}-${sa.slot_id}`] = sa.value;
  }

  const SEASON: Season = {
    name: season.name,
    startDate: season.start_date,
    endDate: season.end_date,
    weekCount: season.week_count,
    currentWeek: season.current_week,
    fee: Number(season.fee),
    forfeitPoints: season.forfeit_points,
    weekWinBonus: season.week_win_bonus,
    proposeByWeeksOut: 2,
    acceptByWeeksOut: 1,
    playWindows: pw,
    published: season.published,
    awayRoster: {},
    slotAvailability: slotAvail,
  };

  // --- Build static content ---
  const ANNOUNCEMENTS: Announcement[] = announcements.map(a => ({
    id: a.id,
    date: a.date,
    title: a.title,
    body: a.body,
  }));

  const DOCUMENTS: Document[] = documents.map(d => ({
    id: d.id,
    cat: d.category,
    title: d.title,
    pages: d.pages,
    role: d.role_visibility,
    updated: d.updated_at,
  }));

  const FAQS: FAQ[] = faqs.map(f => ({
    id: f.id,
    cat: f.category,
    q: f.question,
    a: f.answer,
  }));

  // --- Determine roles ---
  const currentProfile = profiles.find(p => p.id === currentUserId);
  const currentRole = currentProfile?.role || 'player';

  const adminUser = profiles.find(p => p.role === 'admin')?.id || '';
  // Pick a captain and player for role-switching in dev
  const captainUser = TEAMS.find(t => t.captains.length > 0)?.captains[0] || currentUserId;
  const playerTeam = TEAMS.find(t => t.roster.includes(currentUserId) && !t.captains.includes(currentUserId));
  const playerUser = playerTeam ? currentUserId : (TEAMS[0]?.roster.find(uid => !TEAMS[0].captains.includes(uid)) || currentUserId);

  return {
    DIVISIONS: [{ id: 'div-atl', name: 'Atlanta League', region: 'Atlanta' }],
    PEOPLE,
    TEAMS,
    MATCHES,
    ANNOUNCEMENTS,
    DOCUMENTS,
    FAQS,
    PAYMENTS_HISTORY: [],
    DUES: {},
    SEASON,
    CURRENT_USER: currentUserId,
    TEAM_CODES,
    ADMIN_USER: adminUser,
    CAPTAIN_USER: captainUser,
    PLAYER_USER: playerUser,
    SUBSTITUTES: ['majigan', 'bob'],
    ROLE: currentRole,
  };
}
