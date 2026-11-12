import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { createMockAppContext } from './helpers';
import { createInitialDB } from '../lib/data';

const db = createInitialDB();
const mockCtx = createMockAppContext({ db, role: 'captain' });

jest.mock('../lib/AppContext', () => ({
  useApp: () => mockCtx,
}));

const { useRouter } = require('expo-router');
const router = useRouter();

import { ThemeContext, PARLOR_THEME } from '../lib/theme';

function wrap(ui: React.ReactElement) {
  return render(
    <ThemeContext.Provider value={PARLOR_THEME}>{ui}</ThemeContext.Provider>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── Home Screen ───────────────────────────────────────────────
describe('HomeScreen', () => {
  let HomeScreen: any;
  beforeAll(() => {
    HomeScreen = require('../app/(tabs)/index').default;
  });

  it('renders the user first name as title', () => {
    const me = mockCtx.viewer.me;
    const { getByText } = wrap(<HomeScreen />);
    expect(getByText(me.name.split(' ')[0])).toBeTruthy();
  });

  it('renders season and week info', () => {
    const { getAllByText } = wrap(<HomeScreen />);
    expect(getAllByText(new RegExp(`Week ${db.SEASON.currentWeek}`)).length).toBeGreaterThan(0);
  });
});

// ─── Schedule Screen ──────────────────────────────────────────
describe('ScheduleScreen', () => {
  let ScheduleScreen: any;
  beforeAll(() => {
    ScheduleScreen = require('../app/(tabs)/schedule').default;
  });

  it('renders Schedule header', () => {
    const { getByText } = wrap(<ScheduleScreen />);
    expect(getByText('Schedule')).toBeTruthy();
  });

  it('renders Open tables button', () => {
    const { getByText } = wrap(<ScheduleScreen />);
    expect(getByText('Open tables')).toBeTruthy();
  });

  it('Open tables button navigates to pairings', () => {
    const { getByText } = wrap(<ScheduleScreen />);
    fireEvent.press(getByText('Open tables'));
    expect(router.push).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/pairings' })
    );
  });

  it('renders season week count', () => {
    const { getByText } = wrap(<ScheduleScreen />);
    expect(getByText(new RegExp(`${db.SEASON.weekCount} weeks`))).toBeTruthy();
  });
});

// ─── Standings Screen ─────────────────────────────────────────
describe('StandingsScreen', () => {
  let StandingsScreen: any;
  beforeAll(() => {
    StandingsScreen = require('../app/(tabs)/standings').default;
  });

  it('renders Standings header', () => {
    const { getByText } = wrap(<StandingsScreen />);
    expect(getByText('Standings')).toBeTruthy();
  });

  it('renders Spring 2026 eyebrow', () => {
    const { getByText } = wrap(<StandingsScreen />);
    expect(getByText('Spring 2026')).toBeTruthy();
  });

  it('renders podium with top 3 teams', () => {
    const teams = db.TEAMS
      .filter(t => t.divisionId === db.DIVISIONS[0].id)
      .sort((a, b) => b.points - a.points);
    const { getAllByText } = wrap(<StandingsScreen />);
    // Top 3 team short names should appear
    teams.slice(0, 3).forEach(t => {
      expect(getAllByText(t.shortName).length).toBeGreaterThan(0);
    });
  });

  it('renders medal labels', () => {
    const { getByText } = wrap(<StandingsScreen />);
    expect(getByText('Gold')).toBeTruthy();
    expect(getByText('Silver')).toBeTruthy();
    expect(getByText('Bronze')).toBeTruthy();
  });
});

// ─── Team Screen ──────────────────────────────────────────────
describe('TeamScreen', () => {
  let TeamScreen: any;
  beforeAll(() => {
    TeamScreen = require('../app/(tabs)/team').default;
  });

  it('renders team name', () => {
    const myTeam = mockCtx.viewer.team || db.TEAMS[0];
    const { getByText } = wrap(<TeamScreen />);
    expect(getByText(myTeam.name)).toBeTruthy();
  });

  it('renders team members', () => {
    const myTeam = mockCtx.viewer.team || db.TEAMS[0];
    const { getByText } = wrap(<TeamScreen />);
    // At least one roster member name should appear
    const firstMember = db.PEOPLE[myTeam.roster[0]];
    if (firstMember) {
      expect(getByText(firstMember.name)).toBeTruthy();
    }
  });
});

// ─── Profile Screen ───────────────────────────────────────────
describe('ProfileScreen', () => {
  let ProfileScreen: any;
  beforeAll(() => {
    ProfileScreen = require('../app/(tabs)/profile').default;
  });

  it('renders Profile header', () => {
    const { getByText } = wrap(<ProfileScreen />);
    expect(getByText('Profile')).toBeTruthy();
  });

  it('renders user name', () => {
    const me = mockCtx.viewer.me;
    const { getByText } = wrap(<ProfileScreen />);
    expect(getByText(me.name)).toBeTruthy();
  });

  it('renders email and phone', () => {
    const me = mockCtx.viewer.me;
    const { getByText } = wrap(<ProfileScreen />);
    expect(getByText(me.email)).toBeTruthy();
    expect(getByText(me.phone)).toBeTruthy();
  });

  it('Edit profile navigates correctly', () => {
    const { getByText } = wrap(<ProfileScreen />);
    fireEvent.press(getByText('Edit profile'));
    expect(router.push).toHaveBeenCalledWith('/edit-profile');
  });

  it('Availability navigates correctly', () => {
    const { getByText } = wrap(<ProfileScreen />);
    fireEvent.press(getByText('Availability'));
    expect(router.push).toHaveBeenCalledWith('/availability');
  });

  it('Rules & About ALMA navigates correctly', () => {
    const { getByText } = wrap(<ProfileScreen />);
    fireEvent.press(getByText('Rules & About ALMA'));
    expect(router.push).toHaveBeenCalledWith('/(tabs)/resources');
  });

  it('Sign out button calls app.signOut', () => {
    const { getByText } = wrap(<ProfileScreen />);
    fireEvent.press(getByText('Sign out'));
    expect(mockCtx.app.signOut).toHaveBeenCalled();
  });
});
