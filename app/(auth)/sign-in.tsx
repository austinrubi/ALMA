import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Image, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme, ALMA_FONTS } from '../../lib/theme';
import { useApp } from '../../lib/AppContext';
import { Field } from '../../components/Field';
import { Card, Eyebrow, SerifTitle, Watercolor, Icon, Button } from '../../components/ui';

const ALMA_INTEREST_FORM = 'https://forms.gle/hznZrndb4TYdVhyP7';

type Mode = 'welcome' | 'in' | 'forgot' | 'sent' | 'newpw' | 'changed';

export default function SignInScreen() {
  const T = useTheme();
  const insets = useSafeAreaInsets();
  const { app } = useApp();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [reset, setReset] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const longEnough = pw1.length >= 8;
  const matches = pw1.length > 0 && pw1 === pw2;
  const canSave = longEnough && matches;

  return (
    <View style={{ flex: 1, backgroundColor: T.appBg }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top }} keyboardShouldPersistTaps="handled">
        <View style={{ flex: 1, position: 'relative', paddingHorizontal: 24 }}>
          <Watercolor corner="tr" size={300} intensity={0.7} />
          <Watercolor corner="bl" size={220} intensity={0.45} accent="terracotta" />

          {/* Badge */}
          <View style={{ alignItems: 'center', paddingTop: 24 }}>
            <Image source={require('../../assets/images/alma-logo.png')} style={{ width: 280, height: 280 }} resizeMode="contain" />
          </View>

          {/* Welcome — 3 doors */}
          {mode === 'welcome' && (
            <View style={{ marginTop: 16, gap: 16 }}>
              <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: 14, color: T.inkSoft, lineHeight: 22, textAlign: 'center' }}>
                ALMA is the premiere TEAM mahjong league. Teams compete for 8 weeks in a city-specific format (days, times, and number of matches may vary by city). Schedule and join matches that work with your calendar — our custom app keeps everything organized: team roster, availability, schedule, and leaderboard. All the team spirit of a tennis league, none of the racket required!
              </Text>
              <Text style={{ fontFamily: ALMA_FONTS.displayBold, fontSize: 16, color: T.brand, textAlign: 'center', letterSpacing: 1.5 }}>
                Team Up. Mahj On.
              </Text>
              <TouchableOpacity onPress={() => Linking.openURL('https://docs.google.com/document/d/1GmAf3LoNskA1KEicIQzDXpzRalvSOZq1rSDNSslb4Fg/edit?usp=sharing')} style={{ alignSelf: 'center' }}>
                <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 13, color: T.brand, textDecorationLine: 'underline' }}>
                  Learn More
                </Text>
              </TouchableOpacity>
              <View style={{ gap: 9 }}>
                <WelcomeDoor primary icon="qr" title="I have a team code"
                  body="Your captain texted you a code. Enter it, pay your season dues, and set up your account."
                  onPress={() => router.push('/(auth)/sign-up')} />
                <WelcomeDoor icon="edit" title="I'd like to play"
                  body="No code yet? Fill out the interest form and we'll be in touch about placement."
                  onPress={() => Linking.openURL(ALMA_INTEREST_FORM)} />
                <WelcomeDoor icon="profile" title="I'm already a member"
                  body="Log in to your league account."
                  onPress={() => setMode('in')} />
              </View>
            </View>
          )}

          {/* Login form */}
          {mode === 'in' && (
            <View style={{ marginTop: 34, gap: 14 }}>
              <View style={{ alignItems: 'center' }}>
                <SerifTitle size={22} italic>Welcome back.</SerifTitle>
              </View>
              <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
              <Field label="Password" type="password" value={password} onChange={setPassword} />
              <TouchableOpacity onPress={() => setMode('forgot')} style={{ alignSelf: 'flex-end' }}>
                <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 12, color: T.brand, borderBottomWidth: 1, borderBottomColor: T.brand }}>
                  Forgot your password?
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Forgot password */}
          {mode === 'forgot' && (
            <View style={{ marginTop: 34, gap: 14 }}>
              <View style={{ alignItems: 'center' }}><SerifTitle size={22} italic>Reset your password.</SerifTitle></View>
              <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: 14, color: T.inkSoft, lineHeight: 22, textAlign: 'center' }}>
                Enter the email on your league account and we'll send a reset link.
              </Text>
              <Field label="Email" type="email" value={reset} onChange={setReset} placeholder="you@example.com" />
            </View>
          )}

          {/* Email sent */}
          {mode === 'sent' && (
            <View style={{ marginTop: 34, gap: 12, alignItems: 'center' }}>
              <View style={{
                width: 62, height: 62, borderRadius: 999, backgroundColor: T.surfaceTint,
                alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: T.borderStrong,
              }}>
                <Icon name="mail" size={24} color={T.brand} />
              </View>
              <SerifTitle size={21} italic>Check your email.</SerifTitle>
              <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: 14, color: T.inkSoft, lineHeight: 22, textAlign: 'center' }}>
                A reset link is on its way to {reset || 'your inbox'}. It expires in an hour.
              </Text>
            </View>
          )}

          {/* New password */}
          {mode === 'newpw' && (
            <View style={{ marginTop: 34, gap: 14 }}>
              <View style={{ alignItems: 'center' }}><SerifTitle size={22} italic>Choose a new password.</SerifTitle></View>
              <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: 14, color: T.inkSoft, lineHeight: 22, textAlign: 'center' }}>
                You're resetting the password for {reset || email || 'your league account'}.
              </Text>
              <Field label="New password" type="password" value={pw1} onChange={setPw1} />
              <Field label="Confirm new password" type="password" value={pw2} onChange={setPw2} />
              <View style={{ gap: 6, marginTop: 2 }}>
                <PwRule ok={longEnough}>At least 8 characters</PwRule>
                <PwRule ok={matches}>Both entries match</PwRule>
              </View>
            </View>
          )}

          {/* Password changed */}
          {mode === 'changed' && (
            <View style={{ marginTop: 34, gap: 12, alignItems: 'center' }}>
              <View style={{
                width: 62, height: 62, borderRadius: 999, backgroundColor: T.surfaceTint,
                alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: T.borderStrong,
              }}>
                <Icon name="check" size={24} color={T.brand} strokeWidth={1.7} />
              </View>
              <SerifTitle size={21} italic>Password updated.</SerifTitle>
              <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: 14, color: T.inkSoft, lineHeight: 22, textAlign: 'center' }}>
                You're signed out everywhere else. Log in with your new password.
              </Text>
            </View>
          )}

          <View style={{ flex: 1 }} />
        </View>

        {/* Bottom buttons */}
        <View style={{ paddingHorizontal: 24, paddingTop: 18, paddingBottom: insets.bottom + 26, gap: 8 }}>
          {mode === 'in' && (
            <>
              {authError ? <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 12, color: '#A0524A', textAlign: 'center' }}>{authError}</Text> : null}
              <Button variant="primary" fullWidth disabled={loading} onPress={async () => {
                setLoading(true); setAuthError('');
                const { error } = await app.signInWithEmail(email, password);
                setLoading(false);
                if (error) setAuthError(error);
                else router.replace('/(tabs)');
              }}>
                <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 14, color: T.inkOnDeep }}>{loading ? 'Signing in\u2026' : 'Log in'}</Text>
              </Button>
              <Button variant="ghost" fullWidth onPress={() => setMode('welcome')}>
                <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 14, color: T.ink }}>Back</Text>
              </Button>
            </>
          )}
          {mode === 'forgot' && (
            <>
              <Button variant="primary" fullWidth onPress={() => setMode('sent')}>
                <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 14, color: T.inkOnDeep }}>Send reset link</Text>
              </Button>
              <Button variant="ghost" fullWidth onPress={() => setMode('in')}>
                <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 14, color: T.ink }}>Back to sign in</Text>
              </Button>
            </>
          )}
          {mode === 'sent' && (
            <>
              <Button variant="primary" fullWidth onPress={() => setMode('newpw')}>
                <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 14, color: T.inkOnDeep }}>Open the reset link</Text>
              </Button>
              <Button variant="ghost" fullWidth onPress={() => setMode('in')}>
                <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 14, color: T.ink }}>Back to sign in</Text>
              </Button>
            </>
          )}
          {mode === 'newpw' && (
            <>
              <Button variant="primary" fullWidth disabled={!canSave} onPress={() => setMode('changed')}>
                <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 14, color: T.inkOnDeep }}>Save new password</Text>
              </Button>
              <Button variant="ghost" fullWidth onPress={() => setMode('in')}>
                <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 14, color: T.ink }}>Cancel</Text>
              </Button>
            </>
          )}
          {mode === 'changed' && (
            <Button variant="primary" fullWidth onPress={() => setMode('in')}>
              <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 14, color: T.inkOnDeep }}>Log in</Text>
            </Button>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function WelcomeDoor({ icon, title, body, onPress, primary }: { icon: string; title: string; body: string; onPress: () => void; primary?: boolean }) {
  const T = useTheme();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{
      flexDirection: 'row', alignItems: 'flex-start', gap: 13, padding: 15, borderRadius: 14,
      backgroundColor: primary ? T.surfaceTint : T.surface,
      borderWidth: 1, borderColor: primary ? T.borderStrong : T.border,
    }}>
      <View style={{
        width: 34, height: 34, borderRadius: 999, backgroundColor: primary ? T.brand : T.surfaceTint,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={icon} size={17} color={primary ? '#EAF2EE' : T.brand} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: 15.5, color: T.ink, lineHeight: 20 }}>{title}</Text>
        <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 11.5, color: T.inkSoft, lineHeight: 17, marginTop: 4 }}>{body}</Text>
      </View>
      <Icon name="chevronRight" size={16} color={T.inkMute} />
    </TouchableOpacity>
  );
}

function PwRule({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  const T = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <View style={{
        width: 16, height: 16, borderRadius: 999,
        backgroundColor: ok ? T.brand : 'transparent',
        borderWidth: 1, borderColor: ok ? T.brand : T.border,
        alignItems: 'center', justifyContent: 'center',
      }}>
        {ok && <Icon name="check" size={10} color="#EAF2EE" strokeWidth={2.4} />}
      </View>
      <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 11.5, color: ok ? T.ink : T.inkMute, letterSpacing: 0.3 }}>{children}</Text>
    </View>
  );
}
