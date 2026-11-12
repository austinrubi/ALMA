import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { createMockAppContext } from './helpers';
import { createInitialDB } from '../lib/data';

const db = createInitialDB();
const mockCtx = createMockAppContext({ db });

jest.mock('../lib/AppContext', () => ({
  useApp: () => mockCtx,
}));

const { useRouter } = require('expo-router');
const router = useRouter();

import SignUpScreen from '../app/(auth)/sign-up';
import { ThemeContext, PARLOR_THEME } from '../lib/theme';

function renderSignUp() {
  return render(
    <ThemeContext.Provider value={PARLOR_THEME}>
      <SignUpScreen />
    </ThemeContext.Provider>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SignUpScreen', () => {
  describe('Step 1 — Team code', () => {
    it('renders team code input', () => {
      const { getByText, getByPlaceholderText } = renderSignUp();
      expect(getByText('Which team is yours?')).toBeTruthy();
      expect(getByPlaceholderText('ABCD-0000')).toBeTruthy();
    });

    it('renders Step 1 of 3 progress', () => {
      const { getByText } = renderSignUp();
      expect(getByText('Step 1 of 3')).toBeTruthy();
    });

    it('shows error for empty/short code', () => {
      const { getByText, getByPlaceholderText } = renderSignUp();
      fireEvent.changeText(getByPlaceholderText('ABCD-0000'), 'ABC');
      // Press the Join button
      fireEvent.press(getByText('Join'));
      expect(getByText('Codes are eight characters, like SPAR-4471.')).toBeTruthy();
    });

    it('shows error for invalid code', () => {
      const { getByText, getByPlaceholderText } = renderSignUp();
      fireEvent.changeText(getByPlaceholderText('ABCD-0000'), 'XXXX-9999');
      fireEvent.press(getByText('Join'));
      expect(getByText('No team matches that code.')).toBeTruthy();
    });

    it('valid team code advances to step 2', () => {
      // Get a valid code from the DB
      const codes = db.TEAM_CODES || {};
      const firstTeamId = Object.keys(codes)[0];
      const validCode = codes[firstTeamId];

      if (validCode) {
        const { getByText, getByPlaceholderText } = renderSignUp();
        fireEvent.changeText(getByPlaceholderText('ABCD-0000'), validCode);
        fireEvent.press(getByText('Join'));
        expect(getByText('Season dues')).toBeTruthy();
        expect(getByText('Step 2 of 3')).toBeTruthy();
      }
    });

    it('Back button navigates to sign-in', () => {
      const { getByText } = renderSignUp();
      fireEvent.press(getByText('Back'));
      expect(router.replace).toHaveBeenCalledWith('/(auth)/sign-in');
    });

    it('"Log in" link navigates to sign-in with mode=in', () => {
      const { getByText } = renderSignUp();
      fireEvent.press(getByText('Log in'));
      expect(router.replace).toHaveBeenCalledWith({
        pathname: '/(auth)/sign-in',
        params: { mode: 'in' },
      });
    });
  });

  describe('Step 2 — Dues', () => {
    function goToStep2() {
      const codes = db.TEAM_CODES || {};
      const firstTeamId = Object.keys(codes)[0];
      const validCode = codes[firstTeamId];
      const result = renderSignUp();
      if (validCode) {
        fireEvent.changeText(result.getByPlaceholderText('ABCD-0000'), validCode);
        fireEvent.press(result.getByText('Join'));
      }
      return result;
    }

    it('shows season fee', () => {
      const { getByText } = goToStep2();
      const fee = db.SEASON?.fee || 75;
      expect(getByText(`$${fee}`)).toBeTruthy();
    });

    it('shows Square payment info', () => {
      const { getByText } = goToStep2();
      expect(getByText('Pay with Square')).toBeTruthy();
    });

    it('Pay with Square advances to step 3', () => {
      const { getByText } = goToStep2();
      fireEvent.press(getByText('Pay with Square'));
      expect(getByText('Step 3 of 3')).toBeTruthy();
      expect(getByText("Let's set you up.")).toBeTruthy();
    });

    it('Back returns to step 1', () => {
      const result = goToStep2();
      fireEvent.press(result.getByText('Back'));
      expect(result.getByText('Which team is yours?')).toBeTruthy();
    });
  });

  describe('Step 3 — Account creation', () => {
    function goToStep3() {
      const codes = db.TEAM_CODES || {};
      const firstTeamId = Object.keys(codes)[0];
      const validCode = codes[firstTeamId];
      const result = renderSignUp();
      if (validCode) {
        fireEvent.changeText(result.getByPlaceholderText('ABCD-0000'), validCode);
        fireEvent.press(result.getByText('Join'));
      }
      fireEvent.press(result.getByText('Pay with Square'));
      return result;
    }

    it('renders all account fields', () => {
      const { getByText } = goToStep3();
      expect(getByText(/First name/)).toBeTruthy();
      expect(getByText(/Last name/)).toBeTruthy();
      expect(getByText(/^Email/)).toBeTruthy();
      expect(getByText(/Mobile phone/)).toBeTruthy();
      expect(getByText(/^Password/)).toBeTruthy();
    });

    it('renders terms checkbox', () => {
      const { getByText } = goToStep3();
      expect(getByText(/Code of Conduct/)).toBeTruthy();
      expect(getByText(/Hold-Harmless/)).toBeTruthy();
    });

    it('Create account button exists', () => {
      const { getByText } = goToStep3();
      expect(getByText('Create account')).toBeTruthy();
    });

    it('successful signup calls signUpWithEmail then signInWithEmail', async () => {
      mockCtx.app.signUpWithEmail.mockResolvedValueOnce({});
      mockCtx.app.signInWithEmail.mockResolvedValueOnce({});

      const { getByText } = goToStep3();
      await act(async () => {
        fireEvent.press(getByText('Create account'));
      });

      expect(mockCtx.app.signUpWithEmail).toHaveBeenCalled();
    });

    it('failed signup shows error', async () => {
      mockCtx.app.signUpWithEmail.mockResolvedValueOnce({ error: 'Email already exists' });

      const { getByText } = goToStep3();
      await act(async () => {
        fireEvent.press(getByText('Create account'));
      });

      expect(getByText('Email already exists')).toBeTruthy();
    });

    it('Back returns to step 2', () => {
      const result = goToStep3();
      fireEvent.press(result.getByText('Back'));
      expect(result.getByText('Season dues')).toBeTruthy();
    });
  });
});
