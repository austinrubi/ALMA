import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Simple in-memory storage that works in Expo Go without native modules.
// Sessions won't persist across app restarts — fine for dev.
// Swap to SecureStore or AsyncStorage when building with EAS.
const memoryStorage = new Map<string, string>();
const storage = {
  getItem: (key: string) => memoryStorage.get(key) ?? null,
  setItem: (key: string, value: string) => { memoryStorage.set(key, value); },
  removeItem: (key: string) => { memoryStorage.delete(key); },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
