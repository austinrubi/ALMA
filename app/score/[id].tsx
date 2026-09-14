import React, { useState } from 'react';
import { View, ScrollView, Text, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme, ALMA_FONTS } from '../../lib/theme';
import { useApp } from '../../lib/AppContext';
import { captainIdsOf } from '../../lib/roles';
import { Header } from '../../components/Header';
import { SectionLabel } from '../../components/SectionLabel';
import { Card, DisplayCaps, Eyebrow, Watercolor, Icon, Button, Chip } from '../../components/ui';

export default function ScoreEntryScreen() {
  const T = useTheme();
  const insets = useSafeAreaInsets();
  const { id, mode } = useLocalSearchParams<{ id: string; mode?: string }>();
  const router = useRouter();
  const { db, viewer: V, app } = useApp();

  const match = db.MATCHES.find(m => m.id === id);
  if (!match) return <View style={{ flex: 1, padding: 24, backgroundColor: T.appBg }}><Text>Match not found.</Text></View>;

  const home = db.TEAMS.find(t => t.id === match.home)!;
  const away = db.TEAMS.find(t => t.id === match.away)!;
  const editing = mode === 'edit';
  const [homeScore, setHomeScore] = useState(editing && match.result ? String(match.result.home) : '');
  const [awayScore, setAwayScore] = useState(editing && match.result ? String(match.result.away) : '');
  const [step, setStep] = useState<'pick' | 'done'>('pick');
  const [forfeit, setForfeit] = useState<string | null>(null);
  const fp = db.SEASON.forfeitPoints || 75;

  const clamp = (v: string) => v.replace(/[^0-9]/g, '').slice(0, 3);
  const hs = parseInt(homeScore, 10);
  const as_ = parseInt(awayScore, 10);
  const valid = hs >= 1 && hs <= 999 && as_ >= 1 && as_ <= 999;

  const submit = () => {
    if (forfeit) { app.logForfeit(match.id, forfeit, V.uid); setStep('done'); return; }
    if (editing) app.editScore(match.id, { home: hs, away: as_ }, V.uid);
    else app.logScore(match.id, { home: hs, away: as_ }, V.uid);
    setStep('done');
  };

  if (step === 'done') {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: T.appBg }} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 80 }}>
        <Header back="Match" onBack={() => router.push({ pathname: '/match/[id]', params: { id: match.id } })} />
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 40, alignItems: 'center', position: 'relative' }}>
          <Watercolor corner="tr" size={300} intensity={0.7} />
          <Watercolor corner="bl" size={240} intensity={0.5} accent="terracotta" />
          <View style={{ alignItems: 'center', position: 'relative' }}>
            <View style={{
              width: 72, height: 72, borderRadius: 999, backgroundColor: T.surfaceTint,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="check" size={36} color={T.brand} strokeWidth={1.8} />
            </View>
            <View style={{ marginTop: 24 }}>
              <DisplayCaps size={26}>{editing ? 'Score overridden' : 'Score logged'}</DisplayCaps>
            </View>
            <Text style={{ fontFamily: ALMA_FONTS.serifItalic, fontSize: 17, color: T.inkSoft, marginTop: 10, lineHeight: 24, textAlign: 'center' }}>
              {forfeit
                ? `${(forfeit === 'home' ? home : away).shortName} forfeited.\n${fp} points to ${(forfeit === 'home' ? away : home).shortName}.`
                : `${hs} \u2013 ${as_} is on the books and\nadded to both season totals.`}
            </Text>
            <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 11.5, color: T.inkMute, marginTop: 14, lineHeight: 18, textAlign: 'center', letterSpacing: 0.4 }}>
              {editing
                ? "Your override replaces the pair's entry."
                : `Locked. Only ${captainIdsOf(home).map(cid => db.PEOPLE[cid]?.name?.split(' ')[0]).join(' or ')} can change it now.`}
            </Text>
            <View style={{ marginTop: 32 }}>
              <Button variant="primary" onPress={() => router.push({ pathname: '/match/[id]', params: { id: match.id } })}>
                <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 14, color: T.inkOnDeep }}>Back to the match</Text>
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: T.appBg }} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 80 }}>
      <Header back="Match" onBack={() => router.push({ pathname: '/match/[id]', params: { id: match.id } })}
        eyebrow={`Week ${match.week} \u00B7 Match ${match.table}`}
        title={editing ? 'Override the score' : 'Log the score'} large />

      {/* Score fields */}
      <View style={{ paddingHorizontal: 18, paddingTop: 22 }}>
        <SectionLabel>Final points at this table</SectionLabel>
        <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: 12, marginTop: 12, opacity: forfeit ? 0.4 : 1 }}>
          <ScoreField team={home.shortName} sub="Host" value={forfeit ? (forfeit === 'home' ? '0' : String(fp)) : homeScore}
            onChange={v => !forfeit && setHomeScore(clamp(v))} />
          <View style={{ justifyContent: 'center' }}>
            <Text style={{ fontFamily: ALMA_FONTS.serifItalic, fontSize: 20, color: T.inkSoft }}>–</Text>
          </View>
          <ScoreField team={away.shortName} sub="Visitor" value={forfeit ? (forfeit === 'away' ? '0' : String(fp)) : awayScore}
            onChange={v => !forfeit && setAwayScore(clamp(v))} />
        </View>
      </View>

      {/* Forfeit */}
      <View style={{ paddingHorizontal: 18, paddingTop: 24 }}>
        <SectionLabel>Nobody showed?</SectionLabel>
        <Card variant="quiet" style={{ marginTop: 12, padding: 14 }}>
          <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: 13.5, color: T.inkSoft, lineHeight: 20 }}>
            A forfeit gives the pair who turned up {fp} points and the pair who didn't nothing.
          </Text>
          <View style={{ gap: 8, marginTop: 12 }}>
            {([['away', away], ['home', home]] as const).map(([side, team]) => {
              const on = forfeit === side;
              return (
                <Button key={side} variant={on ? 'primary' : 'secondary'} fullWidth
                  onPress={() => setForfeit(on ? null : side)}>
                  <Icon name={on ? 'check' : 'flag'} size={15} color={on ? T.inkOnDeep : T.inkSoft} />
                  <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: 14.5, color: on ? T.inkOnDeep : T.ink }}>{team.shortName} forfeited</Text>
                </Button>
              );
            })}
          </View>
        </Card>
      </View>

      {/* Submit */}
      <View style={{ paddingHorizontal: 18, paddingTop: 24, gap: 8 }}>
        <Button variant="primary" fullWidth disabled={!valid && !forfeit} onPress={submit}>
          <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 14, color: T.inkOnDeep }}>
            {forfeit ? 'Submit forfeit' : editing ? 'Submit override' : 'Submit score'}
          </Text>
        </Button>
        <Button variant="ghost" fullWidth onPress={() => router.push({ pathname: '/match/[id]', params: { id: match.id } })}>
          <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 14, color: T.ink }}>Cancel</Text>
        </Button>
      </View>
    </ScrollView>
  );
}

function ScoreField({ team, sub, value, onChange }: { team: string; sub: string; value: string; onChange: (v: string) => void }) {
  const T = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: T.inkSoft, marginBottom: 8 }}>
        {team}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="–"
        placeholderTextColor={T.inkMute}
        keyboardType="number-pad"
        maxLength={3}
        style={{
          width: '100%', textAlign: 'center', paddingVertical: 18, paddingHorizontal: 8,
          backgroundColor: T.surface,
          borderWidth: 1, borderColor: value ? T.brand : T.border,
          borderRadius: 16,
          fontFamily: ALMA_FONTS.display, fontSize: 40, color: T.ink,
        }}
      />
      <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: T.inkMute, marginTop: 6 }}>
        {sub}
      </Text>
    </View>
  );
}
