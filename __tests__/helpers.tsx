import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeContext, PARLOR_THEME } from '../lib/theme';
import { createInitialDB } from '../lib/data';
import { viewerOf } from '../lib/roles';

// Build a mock AppContext value
export function createMockAppContext(overrides: any = {}) {
  const db = overrides.db || createInitialDB();
  const role = overrides.role || 'captain';
  const viewDb = { ...db, CURRENT_USER: db.CAPTAIN_USER, ROLE: role };
  const viewer = viewerOf(viewDb);

  const app = {
    setRole: jest.fn(),
    signIn: jest.fn(),
    showSignUp: jest.fn(),
    showSignIn: jest.fn(),
    completeSignUp: jest.fn(),
    signInWithEmail: jest.fn(() => Promise.resolve({})),
    signUpWithEmail: jest.fn(() => Promise.resolve({})),
    signOut: jest.fn(() => Promise.resolve()),
    assignSeat: jest.fn(),
    setAwayRoster: jest.fn(),
    logForfeit: jest.fn(),
    setSlotAvailability: jest.fn(),
    publishSeason: jest.fn(),
    logScore: jest.fn(),
    editScore: jest.fn(),
    setMatchPlan: jest.fn(),
    updateProfile: jest.fn(),
    joinTeam: jest.fn(),
    ...overrides.app,
  };

  return {
    db: viewDb,
    viewer,
    role,
    authScreen: overrides.authScreen || 'none',
    session: overrides.session || null,
    isLoading: overrides.isLoading || false,
    app,
  };
}

// Mock AppContext module — call this from jest.mock
export const mockAppContext = createMockAppContext();

// Wrapper that provides Theme
export function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={PARLOR_THEME}>
      {children}
    </ThemeContext.Provider>
  );
}

export function renderWithTheme(ui: React.ReactElement) {
  return render(ui, { wrapper: TestWrapper });
}
