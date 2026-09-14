import React, { createContext, useContext, useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { AlmaDB, Person } from '../types';
import { createInitialDB } from './data';
import { ALMA_ROLES, ROLE_CAPS, viewerOf } from './roles';
import type { Viewer } from '../types';
import { supabase } from './supabase';
import * as Q from './supabase-queries';
import { hydrateFromSupabase } from './hydrate';
import type { Session } from '@supabase/supabase-js';

interface AppActions {
  assignSeat: (params: { week: number; teamId: string; matchId: string; seatIdx: number; uid: string | null }) => void;
  setAwayRoster: (week: number, uids: string[]) => void;
  logForfeit: (matchId: string, side: string, byUid: string) => void;
  setSlotAvailability: (userId: string, slotId: string, value: string | null) => void;
  publishSeason: (params: { windows: any[]; name: string; startDate: string; weekCount?: number }) => void;
  logScore: (matchId: string, result: { home: number; away: number }, byUid?: string) => void;
  editScore: (matchId: string, result: { home: number; away: number }, byUid?: string) => void;
  setMatchPlan: (matchId: string, plan: { when?: string; where?: string }) => void;
  updateProfile: (patch: Partial<Person>) => void;
  joinTeam: (teamId: string) => void;
  setRole: (role: string) => void;
  signIn: () => void;
  showSignUp: () => void;
  showSignIn: () => void;
  completeSignUp: (signupRole?: string, teamId?: string) => void;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

interface AppContextValue {
  db: AlmaDB;
  viewer: Viewer;
  role: string;
  authScreen: 'none' | 'signin' | 'signup';
  session: Session | null;
  isLoading: boolean;
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
        hydrate(s.user.id).then(() => setIsLoading(false));
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

  // Determine current user ID
  const uid = role === 'admin' ? db.ADMIN_USER
            : role === 'player' ? db.PLAYER_USER
            : db.CAPTAIN_USER;

  const viewDb = useMemo(() => {
    return { ...db, CURRENT_USER: uid, ROLE: role };
  }, [db, uid, role]);

  const viewer = useMemo(() => viewerOf(viewDb), [viewDb]);

  const app = useMemo<AppActions>(() => ({
    setRole,

    // ── Auth actions ─────────────────────────────────────────
    signIn: () => { setAuthScreen('none'); },
    showSignUp: () => { setAuthScreen('signup'); },
    showSignIn: () => { setAuthScreen('signin'); },
    completeSignUp: (signupRole, teamId) => {
      setAuthScreen('none');
      if (signupRole && ALMA_ROLES[signupRole] && signupRole !== role) setRole(signupRole);
      if (signupRole === 'player' && teamId) {
        setDb(prev => ({
          ...prev,
          TEAMS: prev.TEAMS.map(tm => {
            const roster = tm.roster.filter(u => u !== prev.PLAYER_USER);
            return tm.id === teamId ? { ...tm, roster: [...roster, prev.PLAYER_USER] } : { ...tm, roster };
          }),
        }));
        if (sessionRef.current) {
          Q.joinTeam(teamId, sessionRef.current.user.id).catch(console.error);
        }
      }
    },

    signInWithEmail: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      setAuthScreen('none');
      if (data.session?.user) {
        await hydrate(data.session.user.id);
      }
      return {};
    },

    signUpWithEmail: async (email: string, password: string, name: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) return { error: error.message };
      if (data.session?.user) {
        hydrate(data.session.user.id);
      }
      return {};
    },

    signOut: async () => {
      await supabase.auth.signOut();
      setSession(null);
      sessionRef.current = null;
      setDb(createInitialDB());
      setRole('captain');
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
      // Supabase write
      if (sessionRef.current) {
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
    },

    logForfeit: (matchId, side, byUid) => {
      const pts = db.SEASON.forfeitPoints || 75;
      setDb(prev => ({
        ...prev, MATCHES: prev.MATCHES.map(m => m.id === matchId
          ? { ...m, status: 'final' as const, forfeitBy: side,
              result: side === 'home' ? { home: 0, away: pts } : { home: pts, away: 0 },
              enteredBy: byUid, enteredAt: new Date().toISOString() }
          : m),
      }));
      if (sessionRef.current) {
        const homeScore = side === 'home' ? 0 : pts;
        const awayScore = side === 'away' ? 0 : pts;
        Q.upsertMatchResult(matchId, homeScore, awayScore, byUid, side).catch(console.error);
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
      if (sessionRef.current) {
        // Parse week and slot from composite key like "w4-pw1-2"
        const match = slotId.match(/^w(\d+)-(.+)$/);
        if (match) {
          const week = parseInt(match[1], 10);
          const slot = match[2];
          const seasonId = 'a0000000-0000-0000-0000-000000000001'; // TODO: dynamic
          Q.upsertSlotAvailability(userId, seasonId, week, slot, value).catch(console.error);
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
    },

    logScore: (matchId, result, byUid) => {
      setDb(prev => ({
        ...prev,
        MATCHES: prev.MATCHES.map(m => m.id === matchId
          ? { ...m, status: 'final' as const, result, enteredBy: byUid || uid, enteredAt: new Date().toISOString() }
          : m),
      }));
      if (sessionRef.current) {
        Q.upsertMatchResult(matchId, result.home, result.away, byUid || uid).catch(console.error);
      }
    },

    editScore: (matchId, result, byUid) => {
      setDb(prev => ({
        ...prev,
        MATCHES: prev.MATCHES.map(m => m.id === matchId
          ? { ...m, status: 'final' as const, result, editedBy: byUid || uid, editedAt: new Date().toISOString() }
          : m),
      }));
      if (sessionRef.current) {
        Q.upsertMatchResult(matchId, result.home, result.away, byUid || uid).catch(console.error);
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
  }), [uid, role, db.SEASON.forfeitPoints, db.MATCHES, hydrate]);

  return (
    <AppContext.Provider value={{ db: viewDb, viewer, role, authScreen, session, isLoading, app }}>
      {children}
    </AppContext.Provider>
  );
}
