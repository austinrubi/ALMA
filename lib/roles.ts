import type { AlmaDB, Team, Viewer, RoleDef, RoleCaps } from '../types';

export const ALMA_ROLES: Record<string, RoleDef> = {
  admin: {
    id: 'admin', label: 'Admin', chip: 'Admin',
    tagline: 'League operator',
    blurb: 'Sets the season calendar, issues team codes, names captains, and manages accounts.',
    joinsWith: null,
  },
  captain: {
    id: 'captain', label: 'Captain', chip: 'Captain',
    tagline: 'Runs a team',
    blurb: 'Named by the admin. Oversees the roster and settles scores for the week.',
    joinsWith: 'an appointment from the league admin',
  },
  player: {
    id: 'player', label: 'Player', chip: 'Player',
    tagline: 'Plays the season',
    blurb: "Joins one team with the captain's team code, marks availability, and plays her tables.",
    joinsWith: 'a team code from the league admin',
  },
};

export const ROLE_CAPS: Record<string, RoleCaps> = {
  admin:   { invitePlayers: true,  settleScores: true,  dispute: true,  proposeDates: true,  bulkPay: false, captainDocs: true,  manageRoster: true  },
  captain: { invitePlayers: true,  settleScores: true,  dispute: true,  proposeDates: true,  bulkPay: true,  captainDocs: true,  manageRoster: true  },
  player:  { invitePlayers: false, settleScores: false, dispute: false, proposeDates: true,  bulkPay: false, captainDocs: false, manageRoster: false },
};

export const MAX_CAPTAINS = 2;

export function captainIdsOf(team: Team | null | undefined): string[] {
  if (!team) return [];
  if (Array.isArray(team.captains)) return team.captains.filter(Boolean);
  return [];
}

export function isCaptainOf(team: Team | null | undefined, uid: string): boolean {
  return captainIdsOf(team).includes(uid);
}

export function teamOf(db: AlmaDB, uid: string): Team | null {
  if (!uid) return null;
  return db.TEAMS.find(t => isCaptainOf(t, uid))
      || db.TEAMS.find(t => t.roster.includes(uid))
      || null;
}

export function roleOf(db: AlmaDB, uid: string): string {
  if (!uid) return 'player';
  if (db.ADMIN_USER && uid === db.ADMIN_USER) return 'admin';
  return db.TEAMS.some(t => isCaptainOf(t, uid)) ? 'captain' : 'player';
}

export function viewerOf(db: AlmaDB): Viewer {
  const uid = db.CURRENT_USER;
  const role = db.ROLE || roleOf(db, uid);
  const team = teamOf(db, uid);
  return {
    uid, role, team,
    me: db.PEOPLE[uid],
    def: ALMA_ROLES[role] || ALMA_ROLES.player,
    can: ROLE_CAPS[role] || ROLE_CAPS.player,
    isCaptain: role === 'captain',
    isPlayer: role === 'player',
    isAdmin: role === 'admin',
  };
}
