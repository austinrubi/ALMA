import React, { useState } from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, ALMA_FONTS } from '../../lib/theme';
import { useApp } from '../../lib/AppContext';
import { Field } from '../../components/Field';
import { Card, Eyebrow, DisplayCaps, SerifTitle, Chip, Watercolor, Icon, Button } from '../../components/ui';
import type { Team } from '../../types';

function normalizeCode(s: string): string {
  const raw = s.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return raw.length > 4 ? `${raw.slice(0, 4)}-${raw.slice(4, 8)}` : raw;
}

export default function SignUpScreen() {
  const T = useTheme();
  const insets = useSafeAreaInsets();
  const { db, app } = useApp();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', terms: true,
  });
  const [team, setTeam] = useState<Team | null>(null);
  const set = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  if (step === 4) {
    return (
      <View style={{ flex: 1, backgroundColor: T.appBg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, position: 'relative' }}>
        <Watercolor corner="tr" size={320} intensity={0.85} />
        <Watercolor corner="bl" size={240} intensity={0.55} accent="terracotta" />
        <View style={{ alignItems: 'center', position: 'relative' }}>
          <View style={{
            width: 84, height: 84, borderRadius: 999, backgroundColor: T.surfaceTint,
            alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: T.borderStrong,
          }}>
            <DisplayCaps size={28}>{(form.firstName[0] || '') + (form.lastName[0] || '')}</DisplayCaps>
          </View>
          <View style={{ marginTop: 24 }}><Eyebrow>Welcome to the League</Eyebrow></View>
          <View style={{ marginTop: 6 }}><DisplayCaps size={26}>Hello, {form.firstName}.</DisplayCaps></View>
          <View style={{ marginTop: 12 }}><Chip variant="success"><Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 10, letterSpacing: 1.6, color: '#466357' }}>Dues paid · $75</Text></Chip></View>
          <Text style={{ fontFamily: ALMA_FONTS.serifItalic, fontSize: 17, color: T.inkSoft, marginTop: 12, lineHeight: 25, textAlign: 'center' }}>
            {team
              ? `You're on ${team.name}.\nJoin a table each week from the schedule.`
              : `Watch your email for your team code\nand enter it on your home screen.`}
          </Text>
          <View style={{ marginTop: 32 }}>
            <Button variant="primary" size="lg" onPress={() => app.completeSignUp('player', team?.id)}>
              <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 15, color: T.inkOnDeep }}>Continue</Text>
            </Button>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: T.appBg }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top }} keyboardShouldPersistTaps="handled">
        {/* Badge */}
        <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 12, position: 'relative', overflow: 'hidden' }}>
          <Watercolor corner="tr" size={260} intensity={0.6} />
          <Image source={require('../../assets/images/alma-logo.png')} style={{ width: 96, height: 96 }} resizeMode="contain" />
        </View>

        {/* Progress bar */}
        <View style={{ paddingHorizontal: 24, paddingTop: 8, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: T.inkSoft }}>
            Step {step} of 3
          </Text>
          <View style={{ flex: 1, flexDirection: 'row', gap: 4 }}>
            {[1, 2, 3].map(i => (
              <View key={i} style={{ flex: 1, height: 3, backgroundColor: i <= step ? T.brand : T.borderStrong, borderRadius: 999 }} />
            ))}
          </View>
        </View>

        {/* Step content */}
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 18 }}>
          {step === 1 && <StepCode db={db} onTeam={tm => { setTeam(tm); setStep(2); }} />}
          {step === 2 && <StepDues db={db} />}
          {step === 3 && <StepAccount form={form} set={set} />}
        </View>

        {/* Buttons */}
        <View style={{ paddingHorizontal: 24, paddingTop: 14, paddingBottom: insets.bottom + 24, gap: 8 }}>
          {step === 1 && (
            <>
              <Button variant="ghost" fullWidth onPress={() => app.showSignIn()}>
                <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 14, color: T.ink }}>Back</Text>
              </Button>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 12, color: T.inkSoft }}>
                  Already have an account?{' '}
                  <Text onPress={() => app.showSignIn()} style={{ color: T.brand, borderBottomWidth: 1, borderBottomColor: T.brand }}>Log in</Text>
                </Text>
              </View>
            </>
          )}
          {step === 2 && (
            <>
              <Button variant="primary" fullWidth onPress={() => setStep(3)}>
                <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 14, color: T.inkOnDeep }}>Pay with Square</Text>
              </Button>
              <Button variant="ghost" fullWidth onPress={() => setStep(1)}>
                <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 14, color: T.ink }}>Back</Text>
              </Button>
            </>
          )}
          {step === 3 && (
            <>
              <Button variant="primary" fullWidth onPress={() => setStep(4)}>
                <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 14, color: T.inkOnDeep }}>Create account</Text>
              </Button>
              <Button variant="ghost" fullWidth onPress={() => setStep(2)}>
                <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 14, color: T.ink }}>Back</Text>
              </Button>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function StepCode({ db, onTeam }: { db: any; onTeam: (tm: Team) => void }) {
  const T = useTheme();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const codes = db.TEAM_CODES || {};

  const submit = () => {
    const c = normalizeCode(code);
    const teamId = Object.keys(codes).find(id => codes[id] === c);
    if (!teamId) { setError(c.length < 9 ? 'Codes are eight characters, like SPAR-4471.' : "No team matches that code."); return; }
    const team = db.TEAMS.find((t: Team) => t.id === teamId);
    if (!team) { setError('Team not found.'); return; }
    if (team.roster.length >= 12) { setError(`${team.name} is full at twelve.`); return; }
    setError('');
    onTeam(team);
  };

  return (
    <View style={{ gap: 16 }}>
      <Eyebrow>Team code</Eyebrow>
      <SerifTitle size={22} italic>Which team is yours?</SerifTitle>
      <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: 14, color: T.inkSoft, lineHeight: 22, marginTop: -6 }}>
        Your captain texts one code to each player on her team. Enter it and you're on that roster for the season.
      </Text>
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: T.surface, borderWidth: 1, borderColor: error ? T.accent : T.borderStrong,
        borderRadius: 14, paddingLeft: 16, paddingRight: 6, paddingVertical: 6,
      }}>
        <TextInput value={code} onChangeText={v => { setCode(normalizeCode(v)); setError(''); }}
          onSubmitEditing={submit} placeholder="ABCD-0000" placeholderTextColor={T.inkMute}
          maxLength={9} autoCapitalize="characters" spellCheck={false}
          style={{ flex: 1, fontFamily: ALMA_FONTS.display, fontSize: 22, letterSpacing: 2, color: T.ink, paddingVertical: 10 }} />
        <Button variant="primary" size="sm" onPress={submit}>
          <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 12, color: T.inkOnDeep }}>Join</Text>
        </Button>
      </View>
      {error ? <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 11, color: T.accent, lineHeight: 17 }}>{error}</Text> : null}
    </View>
  );
}

function StepDues({ db }: { db: any }) {
  const T = useTheme();
  const fee = db.SEASON?.fee || 75;

  return (
    <View style={{ gap: 14 }}>
      <Eyebrow>Season dues</Eyebrow>
      <Card variant="deep" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
        <Watercolor corner="tr" size={200} intensity={0.6} />
        <View style={{ position: 'relative' }}>
          <Eyebrow color={T.heroEyebrow}>Spring 2026 · one player</Eyebrow>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 12 }}>
            <DisplayCaps size={42} color={T.inkOnDeep}>${fee}</DisplayCaps>
            <Text style={{ fontFamily: ALMA_FONTS.serifItalic, fontSize: 15, color: 'rgba(239,234,217,0.6)', marginBottom: 7 }}>
              for the season
            </Text>
          </View>
          <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 11.5, color: 'rgba(239,234,217,0.75)', lineHeight: 18, marginTop: 10 }}>
            Eight weeks of team play · four tables a week · refundable until the start of the season.
          </Text>
        </View>
      </Card>
      <Card variant="quiet" style={{ padding: 14, flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
        <Icon name="creditCard" size={18} color={T.inkSoft} />
        <Text style={{ flex: 1, fontFamily: ALMA_FONTS.ui, fontSize: 11.5, color: T.inkSoft, lineHeight: 18 }}>
          Checkout opens with <Text style={{ fontFamily: ALMA_FONTS.uiSemiBold, color: T.ink }}>Square</Text>. Pay by card, Apple Pay, or Cash App Pay.
        </Text>
      </Card>
    </View>
  );
}

function StepAccount({ form, set }: { form: any; set: (k: string, v: any) => void }) {
  const T = useTheme();
  return (
    <View style={{ gap: 14 }}>
      <Eyebrow>Account</Eyebrow>
      <SerifTitle size={22} italic style={{ marginBottom: 4 }}>Let's set you up.</SerifTitle>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Field label="First name" required value={form.firstName} onChange={v => set('firstName', v)} style={{ flex: 1 }} />
        <Field label="Last name" required value={form.lastName} onChange={v => set('lastName', v)} style={{ flex: 1 }} />
      </View>
      <Field label="Email" type="email" required value={form.email} onChange={v => set('email', v)} hint="Your team code and weekly reminders come here." />
      <Field label="Mobile phone" required value={form.phone} onChange={v => set('phone', v)} />
      <Field label="Password" type="password" required value={form.password} onChange={v => set('password', v)} placeholder="At least 8 characters" />
      <TouchableOpacity onPress={() => set('terms', !form.terms)} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
        <View style={{
          width: 18, height: 18, borderRadius: 4, marginTop: 2,
          backgroundColor: form.terms ? T.brand : 'transparent',
          borderWidth: 1, borderColor: form.terms ? T.brand : T.border,
          alignItems: 'center', justifyContent: 'center',
        }}>
          {form.terms && <Icon name="check" size={12} color="#EAF2EE" strokeWidth={2.5} />}
        </View>
        <Text style={{ flex: 1, fontFamily: ALMA_FONTS.serif, fontSize: 13, color: T.inkSoft, lineHeight: 19 }}>
          I've read the <Text style={{ color: T.brand }}>Code of Conduct</Text> and the <Text style={{ color: T.brand }}>Hold-Harmless</Text>.
        </Text>
      </TouchableOpacity>
    </View>
  );
}
