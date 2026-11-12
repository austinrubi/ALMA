import React from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Cinzel_400Regular, Cinzel_500Medium, Cinzel_600SemiBold, Cinzel_700Bold } from '@expo-google-fonts/cinzel';
import { CormorantGaramond_400Regular, CormorantGaramond_400Regular_Italic, CormorantGaramond_500Medium, CormorantGaramond_600SemiBold, CormorantGaramond_700Bold, CormorantGaramond_700Bold_Italic } from '@expo-google-fonts/cormorant-garamond';
import { Jost_300Light, Jost_400Regular, Jost_500Medium, Jost_600SemiBold, Jost_700Bold } from '@expo-google-fonts/jost';
import { View, ActivityIndicator } from 'react-native';
import { ThemeContext, PARLOR_THEME } from '../lib/theme';
import { AppProvider, useApp } from '../lib/AppContext';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, isLoading, authScreen, role, signingUp, duesPaid } = useApp();
  const router = useRouter();
  const segments = useSegments();

  React.useEffect(() => {
    if (isLoading) return;
    if (signingUp) return;

    const inAuthGroup = segments[0] === '(auth)';
    const onPaymentRequired = segments[0] === 'payment-required';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    } else if (session && role !== 'admin' && !duesPaid && !onPaymentRequired && !inAuthGroup) {
      // Unpaid user — redirect to payment screen
      router.replace('/payment-required');
    } else if (session && (duesPaid || role === 'admin') && (inAuthGroup || onPaymentRequired)) {
      // Paid user on auth/payment screen — redirect to app
      router.replace(role === 'admin' ? '/admin' : '/(tabs)');
    }
  }, [session, isLoading, segments, role, signingUp, duesPaid]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8F0EC' }}>
        <ActivityIndicator size="large" color="#1B5E6B" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Cinzel_400Regular,
    Cinzel_500Medium,
    Cinzel_600SemiBold,
    Cinzel_700Bold,
    CormorantGaramond_400Regular,
    CormorantGaramond_400Regular_Italic,
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
    CormorantGaramond_700Bold_Italic,
    Jost_300Light,
    Jost_400Regular,
    Jost_500Medium,
    Jost_600SemiBold,
    Jost_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8F0EC' }}>
        <ActivityIndicator size="large" color="#1B5E6B" />
      </View>
    );
  }

  return (
    <ThemeContext.Provider value={PARLOR_THEME}>
      <AppProvider>
        <AuthGate>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="edit-profile" options={{ presentation: 'modal' }} />
            <Stack.Screen name="match/[id]" />
            <Stack.Screen name="score/[id]" />
            <Stack.Screen name="pairings" />
            <Stack.Screen name="join-team" />
            <Stack.Screen name="availability" />
            <Stack.Screen name="preseason" />
            <Stack.Screen name="season-over" />
            <Stack.Screen name="champion" />
            <Stack.Screen name="admin" />
            <Stack.Screen name="payment-required" options={{ headerShown: false }} />
          </Stack>
        </AuthGate>
      </AppProvider>
    </ThemeContext.Provider>
  );
}
