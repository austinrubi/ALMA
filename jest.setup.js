// Mock expo-router
jest.mock('expo-router', () => {
  const router = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  };
  return {
    useRouter: () => router,
    useSegments: () => ['(auth)'],
    useLocalSearchParams: () => ({}),
    useGlobalSearchParams: () => ({}),
    Link: ({ children }) => children,
    Stack: Object.assign(({ children }) => children, {
      Screen: () => null,
    }),
    Tabs: Object.assign(({ children }) => children, {
      Screen: () => null,
    }),
    router,
  };
});

// Mock expo-font
jest.mock('expo-font', () => ({
  useFonts: () => [true],
  isLoaded: () => true,
}));

// Mock @expo-google-fonts/*
jest.mock('@expo-google-fonts/cinzel', () => ({
  useFonts: () => [true],
  Cinzel_400Regular: 'Cinzel_400Regular',
  Cinzel_500Medium: 'Cinzel_500Medium',
  Cinzel_600SemiBold: 'Cinzel_600SemiBold',
  Cinzel_700Bold: 'Cinzel_700Bold',
}));
jest.mock('@expo-google-fonts/cormorant-garamond', () => ({
  useFonts: () => [true],
  CormorantGaramond_400Regular: 'CormorantGaramond_400Regular',
  CormorantGaramond_400Regular_Italic: 'CormorantGaramond_400Regular_Italic',
  CormorantGaramond_500Medium: 'CormorantGaramond_500Medium',
  CormorantGaramond_600SemiBold: 'CormorantGaramond_600SemiBold',
  CormorantGaramond_700Bold: 'CormorantGaramond_700Bold',
  CormorantGaramond_700Bold_Italic: 'CormorantGaramond_700Bold_Italic',
}));
jest.mock('@expo-google-fonts/jost', () => ({
  useFonts: () => [true],
  Jost_300Light: 'Jost_300Light',
  Jost_400Regular: 'Jost_400Regular',
  Jost_500Medium: 'Jost_500Medium',
  Jost_600SemiBold: 'Jost_600SemiBold',
  Jost_700Bold: 'Jost_700Bold',
}));

// Mock expo-status-bar
jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }) => children,
}));

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  const MockSvg = (props) => React.createElement('svg', props);
  const createMockComponent = (name) => {
    const Component = (props) => React.createElement(name, props);
    Component.displayName = name;
    return Component;
  };
  return {
    __esModule: true,
    default: MockSvg,
    Svg: MockSvg,
    Path: createMockComponent('Path'),
    Circle: createMockComponent('Circle'),
    Rect: createMockComponent('Rect'),
    Line: createMockComponent('Line'),
    G: createMockComponent('G'),
    Polyline: createMockComponent('Polyline'),
  };
});

// Mock Supabase
jest.mock('./lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          data: [],
          error: null,
        })),
        data: [],
        error: null,
      })),
    })),
  },
}));

// Mock Linking — patch it on the RN module after it's loaded
const { Linking } = require('react-native');
if (Linking) {
  Linking.openURL = jest.fn(() => Promise.resolve());
  Linking.getInitialURL = jest.fn(() => Promise.resolve(null));
  Linking.addEventListener = jest.fn(() => ({ remove: jest.fn() }));
  Linking.canOpenURL = jest.fn(() => Promise.resolve(true));
}

// Silence console warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('Supabase hydration failed')) return;
  originalWarn(...args);
};
