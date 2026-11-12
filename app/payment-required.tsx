import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Linking, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme, ALMA_FONTS , fs } from '../lib/theme';
import { useApp } from '../lib/AppContext';
import { hydrateFromSupabase } from '../lib/hydrate';
import { Card, Eyebrow, DisplayCaps, Watercolor, Icon, Button } from '../components/ui';

type Phase = 'pay' | 'processing' | 'retry';

export default function PaymentRequiredScreen() {
  const T = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { db, app, session } = useApp();
  const [phase, setPhase] = useState<Phase>('pay');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCount = useRef(0);

  // Clean up polling on unmount
  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const verifyPayment = async (): Promise<boolean> => {
    if (!session) return false;
    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/verify-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
          },
          body: JSON.stringify({ userId: session.user.id }),
        }
      );
      const data = await res.json();
      return !!data.paid;
    } catch {
      return false;
    }
  };

  const startPolling = () => {
    pollCount.current = 0;
    pollRef.current = setInterval(async () => {
      pollCount.current++;
      const paid = await verifyPayment();
      if (paid) {
        if (pollRef.current) clearInterval(pollRef.current);
        app.markDuesPaid();
        router.replace('/(tabs)');
        return;
      }
      // After 2 minutes (24 polls at 5s), stop and show retry
      if (pollCount.current >= 24) {
        if (pollRef.current) clearInterval(pollRef.current);
        setPhase('retry');
      }
    }, 5000);
  };

  const openCheckout = async () => {
    setLoading(true);
    setError('');
    try {
      if (!session) { setError('Not signed in'); setLoading(false); return; }
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/create-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
          },
          body: JSON.stringify({
            userId: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || '',
          }),
        }
      );
      const data = await res.json();
      if (data.error) { setError(data.error); setLoading(false); return; }
      if (data.url) await Linking.openURL(data.url);
      setLoading(false);
      // Switch to processing and start polling
      setPhase('processing');
      startPolling();
    } catch (err: any) {
      setError(err.message || 'Failed to open checkout');
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (pollRef.current) clearInterval(pollRef.current);
    await app.signOut();
    router.replace('/(auth)/sign-in');
  };

  // ── Pay screen ──
  if (phase === 'pay') {
    return (
      <View style={{ flex: 1, backgroundColor: T.appBg, paddingTop: insets.top, paddingHorizontal: 24, justifyContent: 'center' }}>
        <Card variant="deep" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
          <Watercolor corner="tr" size={200} intensity={0.6} />
          <View style={{ position: 'relative' }}>
            <Eyebrow color={T.heroEyebrow}>Season dues</Eyebrow>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 12 }}>
              <DisplayCaps size={42} color={T.inkOnDeep}>${db.SEASON?.fee || 75}</DisplayCaps>
              <Text style={{ fontFamily: ALMA_FONTS.serifItalic, fontSize: fs(15), color: 'rgba(239,234,217,0.6)', marginBottom: 7 }}>
                for the season
              </Text>
            </View>
            <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(12), color: 'rgba(239,234,217,0.75)', lineHeight: 18, marginTop: 10 }}>
              Your account is set up. Pay your season dues to access the league.
            </Text>
          </View>
        </Card>

        <View style={{ gap: 8, marginTop: 20 }}>
          {error ? <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(12), color: '#A0524A', textAlign: 'center' }}>{error}</Text> : null}
          <Button variant="primary" fullWidth disabled={loading} onPress={openCheckout}>
            <Icon name="creditCard" size={16} color={T.inkOnDeep} />
            <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.inkOnDeep }}>
              {loading ? 'Opening checkout\u2026' : 'Pay with Stripe'}
            </Text>
          </Button>
          <Button variant="ghost" fullWidth onPress={signOut}>
            <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.inkMute }}>Sign out</Text>
          </Button>
        </View>
      </View>
    );
  }

  // ── Processing screen ──
  if (phase === 'processing') {
    return (
      <View style={{ flex: 1, backgroundColor: T.appBg, paddingTop: insets.top, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={T.brand} />
        <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: fs(20), color: T.ink, marginTop: 24, textAlign: 'center' }}>
          Confirming your payment
        </Text>
        <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: fs(14), color: T.inkSoft, marginTop: 8, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 }}>
          Complete your payment in the browser. This page will update automatically once it goes through.
        </Text>
        <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(11), color: T.inkMute, marginTop: 20 }}>
          This may take a moment.
        </Text>
      </View>
    );
  }

  // ── Retry screen ──
  return (
    <View style={{ flex: 1, backgroundColor: T.appBg, paddingTop: insets.top, paddingHorizontal: 24, justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <View style={{
          width: 64, height: 64, borderRadius: 999, backgroundColor: 'rgba(160,82,74,0.1)',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="clock" size={28} color="#A0524A" />
        </View>
        <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: fs(20), color: T.ink, marginTop: 16, textAlign: 'center' }}>
          Payment not confirmed yet
        </Text>
        <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: fs(14), color: T.inkSoft, marginTop: 8, textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 }}>
          We haven't received confirmation from Stripe. If you completed payment, it may take a moment. Otherwise, you can try again.
        </Text>
      </View>

      <View style={{ gap: 8 }}>
        <Button variant="primary" fullWidth onPress={() => { setPhase('processing'); startPolling(); }}>
          <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.inkOnDeep }}>Check again</Text>
        </Button>
        <Button variant="secondary" fullWidth onPress={() => { setPhase('pay'); setError(''); }}>
          <Icon name="creditCard" size={16} color={T.ink} />
          <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.ink }}>Pay again</Text>
        </Button>
        <Button variant="ghost" fullWidth onPress={signOut}>
          <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.inkMute }}>Sign out</Text>
        </Button>
      </View>
    </View>
  );
}
