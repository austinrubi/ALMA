import type { AlmaDB, Person, Team, Match, Season, PlayWindow, Announcement, Document, FAQ, PaymentRecord, DuesRecord } from '../types';
import * as Q from './supabase-queries';

/** Compute the current week (1-based) from the season start date and today. */
function computeCurrentWeek(startDate: string, weekCount: number): number {
  const start = new Date(startDate + 'T00:00:00');
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, Math.min(diffWeeks + 1, weekCount));
}

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
    awayRosters,
    documents,
    faqs,
    announcements,
  ] = await Promise.all([
    Q.fetchPlayWindows(seasonId),
    Q.fetchTeams(seasonId),
    Q.fetchTeamMembers(seasonId),
    Q.fetchMatches(seasonId),
    Q.fetchSlotAvailability(seasonId),
    Q.fetchAwayRosters(seasonId),
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
    const seatsArr = Array.isArray(m.seats) ? m.seats : (m.seats ? [m.seats] : []);
    if (seatsArr.length) {
      for (const s of seatsArr) {
        const side = s.side as 'home' | 'away';
        if (side === 'home' || side === 'away') {
          seats[side][s.seat_index] = s.user_id || null;
        }
      }
    }

    // Supabase may return related rows as an array or object depending on FK cardinality
    const resultArr = Array.isArray(m.result) ? m.result : (m.result ? [m.result] : []);
    const planArr = Array.isArray(m.plan) ? m.plan : (m.plan ? [m.plan] : []);

    const result = resultArr.length > 0
      ? { home: resultArr[0].home_score, away: resultArr[0].away_score }
      : null;

    const plan = planArr.length > 0
      ? { when: planArr[0].when_text, where: planArr[0].where_text, by: planArr[0].set_by, at: planArr[0].set_at }
      : undefined;

    const resultRow = resultArr[0] || null;

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
      shortHanded: resultRow?.short_handed || undefined,
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
    if (sa.note) slotAvail[sa.user_id][`w${sa.week}-${sa.slot_id}-note`] = sa.note;
  }

  const SEASON: Season = {
    id: season.id,
    name: season.name,
    startDate: season.start_date,
    endDate: season.end_date,
    weekCount: season.week_count,
    currentWeek: computeCurrentWeek(season.start_date, season.week_count),
    fee: Number(season.fee),
    forfeitPoints: season.forfeit_points,
    weekWinBonus: season.week_win_bonus,
    shortHandedBonus: season.short_handed_bonus ?? 15,
    proposeByWeeksOut: 2,
    acceptByWeeksOut: 1,
    playWindows: pw,
    published: season.published,
    scheduleFinalized: season.schedule_finalized ?? false,
    awayRoster: Object.fromEntries(
      awayRosters
        .filter(ar => {
          const myTeam = TEAMS.find(t => t.roster.includes(currentUserId));
          return myTeam && ar.team_id === myTeam.id;
        })
        .map(ar => [ar.week, ar.user_ids || []])
    ),
    awayAlternates: {},
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

  // --- Recalculate team points from match results (including weekly winner bonus) ---
  const teamPts: Record<string, number> = {};
  for (const t of TEAMS) teamPts[t.id] = 0;
  for (const m of MATCHES) {
    if (m.status === 'final' && m.result) {
      teamPts[m.home] = (teamPts[m.home] || 0) + m.result.home;
      teamPts[m.away] = (teamPts[m.away] || 0) + m.result.away;
    }
  }
  // Weekly winner bonus: team that wins more tables (2 or 3 of 3) gets the bonus
  const weekWinBonus = season.week_win_bonus || 0;
  if (weekWinBonus > 0) {
    const weekMatchups: Record<string, { home: string; away: string; homeWins: number; awayWins: number; allFinal: boolean }> = {};
    for (const m of MATCHES) {
      const key = `${m.week}-${m.home}-${m.away}`;
      if (!weekMatchups[key]) weekMatchups[key] = { home: m.home, away: m.away, homeWins: 0, awayWins: 0, allFinal: true };
      const wm = weekMatchups[key];
      if (m.status === 'final' && m.result) {
        if (m.result.home > m.result.away) wm.homeWins++;
        else if (m.result.away > m.result.home) wm.awayWins++;
      } else {
        wm.allFinal = false;
      }
    }
    for (const wm of Object.values(weekMatchups)) {
      if (!wm.allFinal) continue;
      if (wm.homeWins > wm.awayWins) teamPts[wm.home] = (teamPts[wm.home] || 0) + weekWinBonus;
      else if (wm.awayWins > wm.homeWins) teamPts[wm.away] = (teamPts[wm.away] || 0) + weekWinBonus;
      else {
        // Tie — both teams get half the bonus
        const half = Math.round(weekWinBonus / 2);
        teamPts[wm.home] = (teamPts[wm.home] || 0) + half;
        teamPts[wm.away] = (teamPts[wm.away] || 0) + half;
      }
    }
  }
  for (const t of TEAMS) t.points = teamPts[t.id] || 0;

  // --- Determine roles ---
  const currentProfile = profiles.find(p => p.id === currentUserId);
  // Check if user is a captain via team_members (more authoritative than profile.role)
  const isTeamCaptain = teamMembers.some(tm => tm.user_id === currentUserId && tm.team_role === 'captain');
  const currentRole = currentProfile?.role === 'admin' ? 'admin'
    : isTeamCaptain ? 'captain'
    : currentProfile?.role || 'player';

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
    SUBSTITUTES: ['majigan'],
    ROLE: currentRole,
    DUES_PAID: currentProfile?.dues_paid ?? false,
  };
}
