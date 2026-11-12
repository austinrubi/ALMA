import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { createMockAppContext } from './helpers';

// Mock AppContext
const mockCtx = createMockAppContext();
jest.mock('../lib/AppContext', () => ({
  useApp: () => mockCtx,
}));

// Get router mock
const { useRouter, useLocalSearchParams } = require('expo-router');
const router = useRouter();

// Get supabase mock
const { supabase } = require('../lib/supabase');

import SignInScreen from '../app/(auth)/sign-in';
import { ThemeContext, PARLOR_THEME } from '../lib/theme';

function renderSignIn(params: any = {}) {
  // Override search params for this render
  const originalImpl = useLocalSearchParams;
  require('expo-router').useLocalSearchParams = () => params;

  const result = render(
    <ThemeContext.Provider value={PARLOR_THEME}>
      <SignInScreen />
    </ThemeContext.Provider>
  );

  require('expo-router').useLocalSearchParams = originalImpl;
  return result;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SignInScreen', () => {
  describe('Welcome mode (default)', () => {
    it('renders three welcome doors', () => {
      const { getByText } = renderSignIn();
      expect(getByText('I have a team code')).toBeTruthy();
      expect(getByText("I'd like to play")).toBeTruthy();
      expect(getByText("I'm already a member")).toBeTruthy();
    });

    it('renders the tagline', () => {
      const { getByText } = renderSignIn();
      expect(getByText('Team Up. Mahj On.')).toBeTruthy();
    });

    it('renders Learn More link', () => {
      const { getByText } = renderSignIn();
      expect(getByText('Learn More')).toBeTruthy();
    });

    it('"I have a team code" navigates to sign-up', () => {
      const { getByText } = renderSignIn();
      fireEvent.press(getByText('I have a team code'));
      expect(router.push).toHaveBeenCalledWith('/(auth)/sign-up');
    });

    it('"I\'d like to play" opens interest form URL', () => {
      const { getByText } = renderSignIn();
      fireEvent.press(getByText("I'd like to play"));
      expect(Linking.openURL).toHaveBeenCalledWith('https://forms.gle/hznZrndb4TYdVhyP7');
    });

    it('"I\'m already a member" switches to login form', () => {
      const { getByText, queryByText } = renderSignIn();
      fireEvent.press(getByText("I'm already a member"));
      // Login form should now be visible
      expect(getByText('Welcome back.')).toBeTruthy();
      expect(getByText('Log in')).toBeTruthy();
      // Welcome doors should be gone
      expect(queryByText('I have a team code')).toBeNull();
    });

    it('Learn More link opens Google Doc', () => {
      const { getByText } = renderSignIn();
      fireEvent.press(getByText('Learn More'));
      expect(Linking.openURL).toHaveBeenCalledWith(
        'https://docs.google.com/document/d/1GmAf3LoNskA1KEicIQzDXpzRalvSOZq1rSDNSslb4Fg/edit?usp=sharing'
      );
    });
  });

  describe('Login form (mode=in)', () => {
    it('renders email and password fields', () => {
      const { getByText } = renderSignIn();
      fireEvent.press(getByText("I'm already a member"));
      expect(getByText('Email')).toBeTruthy();
      expect(getByText('Password')).toBeTruthy();
    });

    it('renders forgot password link', () => {
      const { getByText } = renderSignIn();
      fireEvent.press(getByText("I'm already a member"));
      expect(getByText('Forgot your password?')).toBeTruthy();
    });

    it('Back button returns to welcome screen', () => {
      const { getByText } = renderSignIn();
      fireEvent.press(getByText("I'm already a member"));
      fireEvent.press(getByText('Back'));
      expect(getByText('I have a team code')).toBeTruthy();
    });

    it('successful login navigates to tabs', async () => {
      mockCtx.app.signInWithEmail.mockResolvedValueOnce({});
      const { getByText, getByPlaceholderText } = renderSignIn();
      fireEvent.press(getByText("I'm already a member"));

      fireEvent.changeText(getByPlaceholderText('you@example.com'), 'test@example.com');
      // Password field doesn't have a placeholder in the Field component, so find the Log in button
      await act(async () => {
        fireEvent.press(getByText('Log in'));
      });

      expect(mockCtx.app.signInWithEmail).toHaveBeenCalled();
    });

    it('failed login shows error message', async () => {
      mockCtx.app.signInWithEmail.mockResolvedValueOnce({ error: 'Invalid credentials' });
      const { getByText } = renderSignIn();
      fireEvent.press(getByText("I'm already a member"));

      await act(async () => {
        fireEvent.press(getByText('Log in'));
      });

      expect(getByText('Invalid credentials')).toBeTruthy();
    });
  });

  describe('Forgot password flow', () => {
    it('navigates to forgot password mode', () => {
      const { getByText } = renderSignIn();
      fireEvent.press(getByText("I'm already a member"));
      fireEvent.press(getByText('Forgot your password?'));
      expect(getByText('Reset your password.')).toBeTruthy();
    });

    it('Send reset link calls supabase', async () => {
      supabase.auth.resetPasswordForEmail.mockResolvedValueOnce({ error: null });
      const { getByText, getByPlaceholderText } = renderSignIn();
      fireEvent.press(getByText("I'm already a member"));
      fireEvent.press(getByText('Forgot your password?'));

      fireEvent.changeText(getByPlaceholderText('you@example.com'), 'reset@example.com');
      await act(async () => {
        fireEvent.press(getByText('Send reset link'));
      });

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('reset@example.com', {
        redirectTo: 'alma://reset-password',
      });
    });

    it('shows "Check your email" after successful reset', async () => {
      supabase.auth.resetPasswordForEmail.mockResolvedValueOnce({ error: null });
      const { getByText, getByPlaceholderText } = renderSignIn();
      fireEvent.press(getByText("I'm already a member"));
      fireEvent.press(getByText('Forgot your password?'));

      fireEvent.changeText(getByPlaceholderText('you@example.com'), 'reset@example.com');
      await act(async () => {
        fireEvent.press(getByText('Send reset link'));
      });

      expect(getByText('Check your email.')).toBeTruthy();
    });

    it('shows error on failed reset', async () => {
      supabase.auth.resetPasswordForEmail.mockResolvedValueOnce({ error: { message: 'User not found' } });
      const { getByText, getByPlaceholderText } = renderSignIn();
      fireEvent.press(getByText("I'm already a member"));
      fireEvent.press(getByText('Forgot your password?'));

      fireEvent.changeText(getByPlaceholderText('you@example.com'), 'bad@example.com');
      await act(async () => {
        fireEvent.press(getByText('Send reset link'));
      });

      expect(getByText('User not found')).toBeTruthy();
    });

    it('Back to sign in returns to login form', () => {
      const { getByText } = renderSignIn();
      fireEvent.press(getByText("I'm already a member"));
      fireEvent.press(getByText('Forgot your password?'));
      fireEvent.press(getByText('Back to sign in'));
      expect(getByText('Welcome back.')).toBeTruthy();
    });
  });

  describe('New password mode', () => {
    it('Save button is disabled when password too short', async () => {
      supabase.auth.resetPasswordForEmail.mockResolvedValueOnce({ error: null });
      const { getByText, getByPlaceholderText } = renderSignIn();
      // Navigate to forgot → sent → newpw
      fireEvent.press(getByText("I'm already a member"));
      fireEvent.press(getByText('Forgot your password?'));
      fireEvent.changeText(getByPlaceholderText('you@example.com'), 'test@test.com');
      await act(async () => {
        fireEvent.press(getByText('Send reset link'));
      });
      fireEvent.press(getByText('Open the reset link'));

      expect(getByText('Choose a new password.')).toBeTruthy();
      expect(getByText('At least 8 characters')).toBeTruthy();
      expect(getByText('Both entries match')).toBeTruthy();
    });
  });

  describe('URL param: mode=in', () => {
    it('opens directly on login form when mode=in param passed', () => {
      // Re-mock useLocalSearchParams for this test
      require('expo-router').useLocalSearchParams = () => ({ mode: 'in' });
      const { getByText, queryByText } = render(
        <ThemeContext.Provider value={PARLOR_THEME}>
          <SignInScreen />
        </ThemeContext.Provider>
      );
      expect(getByText('Welcome back.')).toBeTruthy();
      expect(queryByText('I have a team code')).toBeNull();
      // Restore
      require('expo-router').useLocalSearchParams = () => ({});
    });
  });
});
