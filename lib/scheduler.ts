import type { Match, Team } from '../types';

/**
 * Round-robin schedule for exactly 8 teams over 8 weeks.
 * - 7 unique matchups + 1 repeat per team (since 8 weeks > 7 opponents)
 * - Each team hosts exactly 4 times, away exactly 4 times
 * - 3 tables per matchup
 *
 * Uses the "circle method": fix team 0, rotate the rest.
 * 7 rounds cover all unique pairings; round 8 repeats round 1 with home/away flipped.
 */

export interface WeekMatchup {
  home: string;   // team id
  away: string;   // team id
}

export interface GeneratedSchedule {
  weeks: WeekMatchup[][];  // weeks[weekIndex] = array of 4 matchups
}

/**
 * Generate a balanced round-robin schedule for 8 teams.
 */
export function generateRoundRobin(teamIds: string[]): GeneratedSchedule {
  if (teamIds.length !== 8) {
    throw new Error(`Expected exactly 8 teams, got ${teamIds.length}`);
  }

  const n = teamIds.length;
  // Circle method: fix team 0, rotate positions 1-7
  const fixed = 0;
  const rotating = Array.from({ length: n - 1 }, (_, i) => i + 1);

  const rounds: WeekMatchup[][] = [];

  for (let round = 0; round < n - 1; round++) {
    const matchups: WeekMatchup[] = [];
    // Pair fixed with first in rotating array
    matchups.push({ home: teamIds[fixed], away: teamIds[rotating[0]] });

    // Pair remaining from outside in: indices 1..6 → (1,6), (2,5), (3,4)
    const half = rotating.length;  // 7
    for (let i = 1; i < Math.ceil(half / 2) + 1; i++) {
      const j = half - i;  // mirror index
      if (i >= j) break;   // don't pair same index
      matchups.push({ home: teamIds[rotating[i]], away: teamIds[rotating[j]] });
    }

    rounds.push(matchups);

    // Rotate: move last element to front
    rotating.unshift(rotating.pop()!);
  }

  // We now have 7 rounds covering all unique pairings.
  // Round 8 repeats round 1 with home/away swapped.
  const repeatRound = rounds[0].map(m => ({ home: m.away, away: m.home }));
  rounds.push(repeatRound);

  // Balance home/away: each team should host 4 and be away 4.
  // The circle method doesn't guarantee this, so we fix it.
  return { weeks: balanceHomeAway(rounds, teamIds) };
}

/**
 * Adjust home/away assignments so every team hosts exactly 4 times
 * and is away exactly 4 times across 8 weeks.
 *
 * Strategy: collect all matchups that can be flipped (where the home team
 * has too many homes OR the away team has too few), prioritize by the
 * biggest imbalance, and flip until balanced.
 */
function balanceHomeAway(weeks: WeekMatchup[][], teamIds: string[]): WeekMatchup[][] {
  const result = weeks.map(w => w.map(m => ({ ...m })));
  const target = weeks.length / 2; // 4

  const recount = () => {
    const hc = new Map<string, number>();
    teamIds.forEach(id => hc.set(id, 0));
    for (const week of result) {
      for (const m of week) {
        hc.set(m.home, (hc.get(m.home) || 0) + 1);
      }
    }
    return hc;
  };

  for (let pass = 0; pass < 20; pass++) {
    const hc = recount();
    let balanced = true;
    for (const id of teamIds) {
      if (hc.get(id) !== target) { balanced = false; break; }
    }
    if (balanced) break;

    // Find the team with the most excess home games
    let worstTeam = '';
    let worstExcess = 0;
    for (const id of teamIds) {
      const excess = (hc.get(id) || 0) - target;
      if (excess > worstExcess) { worstExcess = excess; worstTeam = id; }
    }
    if (!worstTeam) break;

    // Find a matchup where worstTeam is home and the opponent has fewer than target homes
    let flipped = false;
    for (const week of result) {
      for (const m of week) {
        if (m.home === worstTeam && (hc.get(m.away) || 0) < target) {
          const tmp = m.home;
          m.home = m.away;
          m.away = tmp;
          flipped = true;
          break;
        }
      }
      if (flipped) break;
    }
    if (!flipped) break; // can't improve further
  }

  return result;
}

/**
 * Convert a generated schedule into Match objects.
 */
export function scheduleToMatches(schedule: GeneratedSchedule): Match[] {
  const matches: Match[] = [];
  let mid = 1;

  for (let w = 0; w < schedule.weeks.length; w++) {
    const week = w + 1;
    for (const matchup of schedule.weeks[w]) {
      for (let table = 1; table <= 3; table++) {
        matches.push({
          id: `m${mid++}`,
          week,
          table,
          type: 'tournament',
          home: matchup.home,
          away: matchup.away,
          seats: { home: [null, null], away: [null, null] },
          status: 'open',
          result: null,
        });
      }
    }
  }

  return matches;
}

/**
 * Swap two matchups in the schedule preview.
 * weekA/matchIdxA <-> weekB/matchIdxB
 */
export function swapMatchups(
  schedule: GeneratedSchedule,
  weekA: number,
  matchIdxA: number,
  weekB: number,
  matchIdxB: number,
): GeneratedSchedule {
  const weeks = schedule.weeks.map(w => w.map(m => ({ ...m })));
  const tmp = weeks[weekA][matchIdxA];
  weeks[weekA][matchIdxA] = weeks[weekB][matchIdxB];
  weeks[weekB][matchIdxB] = tmp;
  return { weeks };
}

/**
 * Flip home/away for a specific matchup.
 */
export function flipHomeAway(
  schedule: GeneratedSchedule,
  weekIdx: number,
  matchIdx: number,
): GeneratedSchedule {
  const weeks = schedule.weeks.map(w => w.map(m => ({ ...m })));
  const m = weeks[weekIdx][matchIdx];
  const tmp = m.home;
  m.home = m.away;
  m.away = tmp;
  return { weeks };
}
