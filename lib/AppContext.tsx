import React, { createContext, useContext, useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import type { AlmaDB, Person } from '../types';
import { createInitialDB } from './data';
import { ALMA_ROLES, ROLE_CAPS, viewerOf } from './roles';
import type { Viewer } from '../types';
import { supabase } from './supabase';
import * as Q from './supabase-queries';
import { hydrateFromSupabase } from './hydrate';
import type { Session } from '@supabase/supabase-js';
import type { Team, Match } from '../types';
import { generateRoundRobin, scheduleToMatches, type GeneratedSchedule } from './scheduler';
import { registerForPushNotifications } from './pushNotifications';

function recalcTeamPoints(teams: Team[], matches: Match[], weekWinBonus = 0): Team[] {
  const pts: Record<string, number> = {};
  for (const t of teams) pts[t.id] = 0;
  for (const m of matches) {
    if (m.status === 'final' && m.result) {
      pts[m.home] = (pts[m.home] || 0) + m.result.home;
      pts[m.away] = (pts[m.away] || 0) + m.result.away;
    }
  }

  // Award weekly winner bonus: team that wins more tables (2 or 3 of 3) gets the bonus
  if (weekWinBonus > 0) {
    const weekMatchups: Record<string, { home: string; away: string; homeWins: number; awayWins: number; allFinal: boolean }> = {};
    for (const m of matches) {
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
      if (wm.homeWins > wm.awayWins) pts[wm.home] = (pts[wm.home] || 0) + weekWinBonus;
      else if (wm.awayWins > wm.homeWins) pts[wm.away] = (pts[wm.away] || 0) + weekWinBonus;
      else {
        // Tie — both teams get half the bonus
        const half = Math.round(weekWinBonus / 2);
        pts[wm.home] = (pts[wm.home] || 0) + half;
        pts[wm.away] = (pts[wm.away] || 0) + half;
      }
    }
  }

  return teams.map(t => ({ ...t, points: pts[t.id] || 0 }));
}

interface AppActions {
  assignSeat: (params: { week: number; teamId: string; matchId: string; seatIdx: number; uid: string | null }) => void;
  setAwayRoster: (week: number, uids: string[]) => void;
  setAwayAlternates: (week: number, uids: string[]) => void;
  logForfeit: (matchId: string, side: string, byUid: string) => void;
  logShortHanded: (matchId: string, side: string, byUid: string) => void;
  setSlotAvailability: (userId: string, slotId: string, value: string | null) => void;
  setSlotNote: (userId: string, slotId: string, note: string) => void;
  publishSeason: (params: { windows: any[]; name: string; startDate: string; weekCount?: number }) => void;
  logScore: (matchId: string, result: { home: number; away: number }, byUid?: string) => void;
  editScore: (matchId: string, result: { home: number; away: number }, byUid?: string) => void;
  setMatchPlan: (matchId: string, plan: { when?: string; where?: string }) => void;
  updateProfile: (patch: Partial<Person>) => void;
  joinTeam: (teamId: string) => void;
  setRole: (role: string) => void;
  promoteToCapt: (teamId: string, uid: string) => void;
  demoteFromCapt: (teamId: string, uid: string) => void;
  removeFromTeam: (teamId: string, uid: string) => void;
  generateSchedule: () => GeneratedSchedule;
  finalizeSchedule: (schedule: GeneratedSchedule) => void;
  signIn: () => void;
  showSignUp: () => void;
  showSignIn: () => void;
  completeSignUp: () => void;
  signInWithEmail: (email: string, password: string, joinTeamCode?: string) => Promise<{ error?: string; role?: string; teamCodes?: Record<string, string> }>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  markDuesPaid: () => void;
  createTeam: (name: string, shortName: string, homeVenue: string) => Promise<{ error?: string; code?: string }>;

}

interface AppContextValue {
  db: AlmaDB;
  viewer: Viewer;
  role: string;
  authScreen: 'none' | 'signin' | 'signup';
  session: Session | null;
  isLoading: boolean;
  signingUp: boolean;
  duesPaid: boolean;
  app: AppActions;
}

const AppContext = createContext<AppContextValue>(null!);

export function useApp() {
  return useContext(AppContext);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<AlmaDB>(() => createInitialDB());
  const [role, setRole] = useState<string>('captain');
  const [authScreen, setAuthScreen] = useState<'none' | 'signin' | 'signup'>('none');
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [signingUp, setSigningUp] = useState(false);
  const sessionRef = useRef<Session | null>(null);

  // Hydrate data from Supabase for a given user
  const hydrate = useCallback(async (userId: string) => {
    try {
      const freshDb = await hydrateFromSupabase(userId);
      setDb(freshDb);
      setRole(freshDb.ROLE || 'player');
    } catch (err) {
      console.warn('Supabase hydration failed, using local data:', err);
      // Keep existing local data as fallback
    }
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      sessionRef.current = s;
      if (s?.user) {
        hydrate(s.user.id).then(() => {
          setIsLoading(false);
          registerForPushNotifications(s.user.id).catch(console.warn);
        });
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      sessionRef.current = s;
      if (_event === 'SIGNED_IN' && s?.user) {
        hydrate(s.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [hydrate]);

  // Re-hydrate when the app comes back to the foreground + poll every 15s while active
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const startPolling = () => {
      if (!interval) {
        interval = setInterval(() => {
          if (sessionRef.current?.user) {
            hydrate(sessionRef.current.user.id);
          }
        }, 15_000);
      }
    };

    const stopPolling = () => {
      if (interval) { clearInterval(interval); interval = null; }
    };

    // Start polling immediately if the app is active
    if (AppState.currentState === 'active') startPolling();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        if (sessionRef.current?.user) hydrate(sessionRef.current.user.id);
        startPolling();
      } else {
        stopPolling();
      }
    });

    return () => { sub.remove(); stopPolling(); };
  }, [hydrate]);

  // Determine current user ID — use the real session user when signed in
  const uid = session?.user?.id
    || (role === 'admin' ? db.ADMIN_USER
      : role === 'player' ? db.PLAYER_USER
      : db.CAPTAIN_USER);

  const viewDb = useMemo(() => {
    return { ...db, CURRENT_USER: uid, ROLE: role };
  }, [db, uid, role]);

  const viewer = useMemo(() => viewerOf(viewDb), [viewDb]);

  const app = useMemo<AppActions>(() => ({
    setRole,

    // ── Schedule actions ─────────────────────────────────────
    generateSchedule: () => {
      const teamIds = db.TEAMS.map(t => t.id);
      return generateRoundRobin(teamIds);
    },

    finalizeSchedule: async (schedule: GeneratedSchedule) => {
      const localMatches = scheduleToMatches(schedule);
      setDb(prev => ({
        ...prev,
        MATCHES: localMatches,
        SEASON: { ...prev.SEASON, scheduleFinalized: true },
      }));
      // Persist to Supabase
      if (sessionRef.current && db.SEASON.id) {
        try {
          const rows = schedule.weeks.flatMap((week, wi) =>
            week.flatMap(m => [1, 2, 3].map(table => ({
              week: wi + 1,
              table,
              homeTeamId: m.home,
              awayTeamId: m.away,
            })))
          );
          const inserted = await Q.insertMatches(db.SEASON.id, rows);
          // Update local matches with real Supabase IDs
          if (inserted) {
            const realMatches: Match[] = inserted.map((m: any) => ({
              id: m.id,
              week: m.week,
              table: m.table_num,
              type: 'tournament',
              home: m.home_team_id,
              away: m.away_team_id,
              seats: { home: [null, null], away: [null, null] },
              status: 'open' as const,
              result: null,
            }));
            setDb(prev => ({ ...prev, MATCHES: realMatches }));
          }
          await Q.updateSeason(db.SEASON.id, { schedule_finalized: true });
        } catch (err) {
          console.error('Failed to persist schedule to Supabase:', err);
        }
      }
    },

    // ── Auth actions ─────────────────────────────────────────
    signIn: () => { setAuthScreen('none'); },
    showSignUp: () => { setAuthScreen('signup'); },
    showSignIn: () => { setAuthScreen('signin'); },
    completeSignUp: () => {
      setSigningUp(false);
      setAuthScreen('none');
    },

    signInWithEmail: async (email: string, password: string, joinTeamCode?: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      setAuthScreen('none');
      let hydratedRole = 'player';
      let freshCodes: Record<string, string> = {};
      if (data.session?.user) {
        const freshDb = await hydrateFromSupabase(data.session.user.id);
        freshCodes = freshDb.TEAM_CODES || {};
        // Join team using fresh data if a code was provided
        if (joinTeamCode) {
          const freshTeamId = Object.keys(freshCodes).find(id => freshCodes[id] === joinTeamCode);
          if (freshTeamId) {
            Q.joinTeam(freshTeamId, data.session.user.id).catch(console.error);
          }
        }
        setDb(freshDb);
        hydratedRole = freshDb.ROLE || 'player';
        setRole(hydratedRole);
      }
      return { role: hydratedRole, teamCodes: freshCodes };
    },

    signUpWithEmail: async (email: string, password: string, name: string) => {
      setSigningUp(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) { setSigningUp(false); return { error: error.message }; }
      if (data.session?.user) {
        hydrate(data.session.user.id);
      }
      return {};
    },

    signOut: async () => {
      setIsLoading(true);
      await supabase.auth.signOut();
      setSession(null);
      sessionRef.current = null;
      setDb(createInitialDB());
      setRole('captain');
      setIsLoading(false);
    },

    markDuesPaid: () => {
      setDb(prev => ({ ...prev, DUES_PAID: true }));
    },

    createTeam: async (name: string, shortName: string, homeVenue: string) => {
      try {
        // Generate a code like SPAR-4471
        const prefix = shortName.replace(/[^A-Z]/gi, '').toUpperCase().slice(0, 4).padEnd(4, 'X');
        const num = String(Math.floor(1000 + Math.random() * 9000));
        const code = `${prefix}-${num}`;

        if (!db.SEASON.id) return { error: 'No active season' };
        const team = await Q.createTeam(db.SEASON.id, name, shortName, homeVenue, code);

        // Update local state
        setDb(prev => ({
          ...prev,
          TEAMS: [...prev.TEAMS, {
            id: team.id,
            name,
            shortName,
            captains: [],
            divisionId: 'div-atl',
            points: 0,
            prev: 0,
            home: homeVenue,
            roster: [],
          }],
          TEAM_CODES: { ...prev.TEAM_CODES, [team.id]: code },
        }));

        return { code };
      } catch (err: any) {
        return { error: err.message || 'Failed to create team' };
      }
    },

    // ── Data mutations (local + Supabase) ────────────────────

    assignSeat: ({ week, teamId, matchId, seatIdx, uid: seatUid }) => {
      setDb(prev => ({
        ...prev,
        MATCHES: prev.MATCHES.map(m => {
          if (m.week !== week || (m.home !== teamId && m.away !== teamId)) return m;
          const side = m.home === teamId ? 'home' : 'away';
          let seats = [0, 1].map(i => (m.seats[side] || [])[i] || null);
          if (seatUid) seats = seats.map(s => (s === seatUid ? null : s));
          if (m.id === matchId) seats[seatIdx] = seatUid || null;
          return { ...m, seats: { ...m.seats, [side]: seats } };
        }),
      }));
      // Supabase write — skip for virtual substitutes (non-UUID IDs like 'majigan', 'bob')
      const isVirtualSub = seatUid && !(seatUid.includes('-') && seatUid.length >= 36);
      if (sessionRef.current && !isVirtualSub) {
        const match = db.MATCHES.find(m => m.id === matchId);
        if (match) {
          const side = match.home === teamId ? 'home' : 'away';
          Q.upsertMatchSeat(matchId, side, seatIdx, seatUid || null).catch(console.error);
        }
      }
    },

    setAwayRoster: (week, uids) => {
      setDb(prev => ({ ...prev, SEASON: { ...prev.SEASON,
        awayRoster: { ...(prev.SEASON.awayRoster || {}), [week]: uids } } }));
      if (sessionRef.current && db.SEASON.id) {
        const myTeam = db.TEAMS.find(t => t.roster.includes(uid));
        if (myTeam) {
          Q.upsertAwayRoster(myTeam.id, db.SEASON.id, week, uids).catch(console.error);
        }
      }
    },

    setAwayAlternates: (week, uids) => {
      setDb(prev => ({ ...prev, SEASON: { ...prev.SEASON,
        awayAlternates: { ...(prev.SEASON.awayAlternates || {}), [week]: uids } } }));
      if (sessionRef.current && db.SEASON.id) {
        const myTeam = db.TEAMS.find(t => t.roster.includes(uid));
        if (myTeam) {
          Q.upsertAwayAlternates(myTeam.id, db.SEASON.id, week, uids).catch(console.error);
        }
      }
    },

    logForfeit: (matchId, side, byUid) => {
      const pts = db.SEASON.forfeitPoints || 75;
      const result = side === 'home' ? { home: 0, away: pts } : { home: pts, away: 0 };
      setDb(prev => {
        const MATCHES = prev.MATCHES.map(m => m.id === matchId
          ? { ...m, status: 'final' as const, forfeitBy: side, result,
              enteredBy: byUid, enteredAt: new Date().toISOString() }
          : m);
        return { ...prev, MATCHES, TEAMS: recalcTeamPoints(prev.TEAMS, MATCHES, prev.SEASON.weekWinBonus) };
      });
      if (sessionRef.current) {
        Q.upsertMatchResult(matchId, result.home, result.away, byUid, side).catch(console.error);
      }
    },

    logShortHanded: (matchId, side, byUid) => {
      // side = the team that played with only 1 player
      // bonus goes to the OPPOSITE side (the full team)
      setDb(prev => {
        const MATCHES = prev.MATCHES.map(m => {
          if (m.id !== matchId) return m;
          const bonus = prev.SEASON.shortHandedBonus || 15;
          const result = m.result || { home: 0, away: 0 };
          const newResult = side === 'home'
            ? { home: result.home, away: result.away + bonus }
            : { home: result.home + bonus, away: result.away };
          return { ...m, shortHanded: side, result: newResult };
        });
        return { ...prev, MATCHES, TEAMS: recalcTeamPoints(prev.TEAMS, MATCHES, prev.SEASON.weekWinBonus) };
      });
      // Persist to Supabase — update the match result with short_handed and adjusted scores
      if (sessionRef.current) {
        const match = db.MATCHES.find(m => m.id === matchId);
        if (match && match.result) {
          const bonus = db.SEASON.shortHandedBonus || 15;
          const newResult = side === 'home'
            ? { home: match.result.home, away: match.result.away + bonus }
            : { home: match.result.home + bonus, away: match.result.away };
          Q.upsertMatchResultWithShortHanded(matchId, newResult.home, newResult.away, byUid, side).catch(console.error);
        }
      }
    },

    setSlotAvailability: (userId, slotId, value) => {
      setDb(prev => {
        const all = { ...(prev.SEASON.slotAvailability || {}) };
        const mine = { ...(all[userId] || {}) };
        if (value) mine[slotId] = value; else delete mine[slotId];
        all[userId] = mine;
        return { ...prev, SEASON: { ...prev.SEASON, slotAvailability: all } };
      });
      if (sessionRef.current && db.SEASON.id) {
        const m = slotId.match(/^w(\d+)-(.+)$/);
        if (m) {
          Q.upsertSlotAvailability(userId, db.SEASON.id, parseInt(m[1], 10), m[2], value).catch(console.error);
        }
      }
    },

    setSlotNote: (userId, slotId, note) => {
      const noteKey = `${slotId}-note`;
      setDb(prev => {
        const all = { ...(prev.SEASON.slotAvailability || {}) };
        const mine = { ...(all[userId] || {}) };
        if (note) mine[noteKey] = note; else delete mine[noteKey];
        all[userId] = mine;
        return { ...prev, SEASON: { ...prev.SEASON, slotAvailability: all } };
      });
      // Write note to Supabase via the note column
      if (sessionRef.current && db.SEASON.id) {
        const m = slotId.match(/^w(\d+)-(.+)$/);
        if (m) {
          Q.upsertSlotNote(userId, db.SEASON.id, parseInt(m[1], 10), m[2], note).catch(console.error);
        }
      }
    },

    publishSeason: ({ windows, name, startDate, weekCount = 8 }) => {
      const [y, m, d] = startDate.split('-').map(Number);
      const end = new Date(y, m - 1, d + weekCount * 7 - 1);
      const endDate = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
      setDb(prev => ({ ...prev, SEASON: {
        ...prev.SEASON, playWindows: windows, published: true,
        name, startDate, endDate, weekCount, slotAvailability: {},
      } }));
      if (sessionRef.current && db.SEASON.id) {
        Q.updateSeason(db.SEASON.id, {
          name, start_date: startDate, end_date: endDate,
          week_count: weekCount, published: true,
        }).catch(console.error);
        Q.upsertPlayWindows(db.SEASON.id, windows).catch(console.error);
      }
    },

    logScore: (matchId, result, byUid) => {
      setDb(prev => {
        const MATCHES = prev.MATCHES.map(m => m.id === matchId
          ? { ...m, status: 'final' as const, result, enteredBy: byUid || uid, enteredAt: new Date().toISOString() }
          : m);
        return { ...prev, MATCHES, TEAMS: recalcTeamPoints(prev.TEAMS, MATCHES, prev.SEASON.weekWinBonus) };
      });
      if (sessionRef.current) {
        Q.upsertMatchResult(matchId, result.home, result.away, byUid || uid).catch(console.error);
      }
    },

    editScore: (matchId, result, byUid) => {
      setDb(prev => {
        const MATCHES = prev.MATCHES.map(m => m.id === matchId
          ? { ...m, status: 'final' as const, result, editedBy: byUid || uid, editedAt: new Date().toISOString() }
          : m);
        return { ...prev, MATCHES, TEAMS: recalcTeamPoints(prev.TEAMS, MATCHES, prev.SEASON.weekWinBonus) };
      });
      if (sessionRef.current) {
        Q.upsertMatchResultWithEdit(matchId, result.home, result.away, byUid || uid).catch(console.error);
      }
    },

    setMatchPlan: (matchId, plan) => {
      setDb(prev => ({
        ...prev,
        MATCHES: prev.MATCHES.map(m => m.id === matchId
          ? { ...m, plan: { ...plan, by: uid, at: new Date().toISOString() } }
          : m),
      }));
      if (sessionRef.current) {
        Q.upsertMatchPlan(matchId, plan.when || '', plan.where || '', uid).catch(console.error);
      }
    },

    updateProfile: (patch) => {
      setDb(prev => ({
        ...prev,
        PEOPLE: { ...prev.PEOPLE, [uid]: { ...prev.PEOPLE[uid], ...patch } },
      }));
      if (sessionRef.current) {
        Q.updateProfile(sessionRef.current.user.id, patch).catch(console.error);
      }
    },

    joinTeam: (teamId) => {
      setDb(prev => ({
        ...prev,
        TEAMS: prev.TEAMS.map(tm => {
          const roster = tm.roster.filter(u => u !== prev.PLAYER_USER);
          return tm.id === teamId
            ? { ...tm, roster: [...roster, prev.PLAYER_USER] }
            : { ...tm, roster };
        }),
      }));
      if (sessionRef.current) {
        Q.joinTeam(teamId, sessionRef.current.user.id).catch(console.error);
      }
    },

    promoteToCapt: (teamId, promoteUid) => {
      setDb(prev => ({
        ...prev,
        TEAMS: prev.TEAMS.map(t => t.id === teamId && !t.captains.includes(promoteUid)
          ? { ...t, captains: [...t.captains, promoteUid] } : t),
      }));
      if (sessionRef.current) {
        Q.updateTeamMemberRole(teamId, promoteUid, 'captain').catch(console.error);
      }
    },

    demoteFromCapt: (teamId, demoteUid) => {
      setDb(prev => ({
        ...prev,
        TEAMS: prev.TEAMS.map(t => t.id === teamId
          ? { ...t, captains: t.captains.filter(c => c !== demoteUid) } : t),
      }));
      if (sessionRef.current) {
        Q.updateTeamMemberRole(teamId, demoteUid, 'player').catch(console.error);
      }
    },

    removeFromTeam: (teamId, removeUid) => {
      setDb(prev => ({
        ...prev,
        TEAMS: prev.TEAMS.map(t => t.id === teamId
          ? { ...t, roster: t.roster.filter(u => u !== removeUid), captains: t.captains.filter(c => c !== removeUid) } : t),
      }));
      if (sessionRef.current) {
        Q.removeTeamMember(teamId, removeUid).catch(console.error);
      }
    },
  }), [uid, role, db.SEASON.forfeitPoints, db.SEASON.id, db.MATCHES, hydrate]);

  return (
    <AppContext.Provider value={{ db: viewDb, viewer, role, authScreen, session, isLoading, signingUp, duesPaid: viewDb.DUES_PAID ?? true, app }}>
      {children}
    </AppContext.Provider>
  );
}
