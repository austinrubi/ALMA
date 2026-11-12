import React, { useState } from 'react';
import { View, ScrollView, Text, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme, ALMA_FONTS , fs } from '../lib/theme';
import { useApp } from '../lib/AppContext';
import { captainIdsOf } from '../lib/roles';
import { Card, Eyebrow, SerifTitle, DisplayCaps, Watercolor, Button } from '../components/ui';
import type { Team } from '../types';

function normalizeCode(s: string): string {
  const raw = s.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return raw.length > 4 ? `${raw.slice(0, 4)}-${raw.slice(4, 8)}` : raw;
}

export default function JoinTeamScreen() {
  const T = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { db, viewer: V, app } = useApp();
  const me = db.PEOPLE[db.CURRENT_USER];

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [joined, setJoined] = useState<Team | null>(null);

  const codes = db.TEAM_CODES || {};

  const submit = () => {
    const c = normalizeCode(code);
    const teamId = Object.keys(codes).find(id => codes[id] === c);
    if (!teamId) {
      setError(c.length < 9 ? 'Codes are eight characters, like SPAR-4471.' : "No team matches that code. Check it against the admin's email.");
      return;
    }
    const team = db.TEAMS.find(t => t.id === teamId);
    if (!team) { setError('Team not found.'); return; }
    setError('');
    setJoined(team);
  };

  const confirm = () => {
    if (joined) {
      app.joinTeam(joined.id);
      router.back();
    }
  };

  if (joined) {
    const caps = captainIdsOf(joined).map(id => db.PEOPLE[id]).filter(Boolean);
    return (
      <View style={{ flex: 1, backgroundColor: T.appBg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, position: 'relative' }}>
        <Watercolor corner="tr" size={320} intensity={0.85} />
        <Watercolor corner="bl" size={240} intensity={0.55} accent="terracotta" />
        <View style={{ alignItems: 'center', position: 'relative' }}>
          <View style={{
            width: 84, height: 84, borderRadius: 999, backgroundColor: T.surfaceTint,
            alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: T.borderStrong,
          }}>
            <DisplayCaps size={24}>{joined.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</DisplayCaps>
          </View>
          <View style={{ marginTop: 24 }}><Eyebrow>You're on the roster</Eyebrow></View>
          <View style={{ marginTop: 6 }}><DisplayCaps size={24}>{joined.name}</DisplayCaps></View>
          <Text style={{ fontFamily: ALMA_FONTS.serifItalic, fontSize: fs(17), color: T.inkSoft, marginTop: 12, lineHeight: 25, textAlign: 'center' }}>
            {caps.map(c => c.name).join(' & ')} {caps.length > 1 ? 'are your captains' : 'is your captain'}.{'\n'}You'll be seated at a table each week.
          </Text>
          <View style={{ marginTop: 32 }}>
            <Button variant="primary" size="lg" onPress={confirm}>
              <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(15), color: T.inkOnDeep }}>Continue</Text>
            </Button>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: T.appBg }} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 40 }}>
      <View style={{ paddingHorizontal: 24, paddingTop: 24, position: 'relative', overflow: 'hidden' }}>
        <Watercolor corner="tr" size={260} intensity={0.6} />
        <View style={{ position: 'relative' }}>
          <Eyebrow>{`Player \u00B7 ${db.SEASON.name}`}</Eyebrow>
          <SerifTitle size={26} italic style={{ marginTop: 8 }}>Hello, {me?.name?.split(' ')[0]}.</SerifTitle>
          <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: fs(15), color: T.inkSoft, marginTop: 10, lineHeight: 23 }}>
            You haven't joined a team yet. If you already know the team that you would like to join, reach out to your captain for your team code.
          </Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 24, paddingTop: 22 }}>
        <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: fs(13), letterSpacing: 3, textTransform: 'uppercase', color: T.ink }}>Team code</Text>
        <View style={{
          marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 8,
          backgroundColor: T.surface, borderWidth: 1,
          borderColor: error ? T.accent : T.borderStrong,
          borderRadius: 14, paddingLeft: 16, paddingRight: 6, paddingVertical: 6,
        }}>
          <TextInput
            value={code}
            onChangeText={v => { setCode(normalizeCode(v)); setError(''); }}
            onSubmitEditing={submit}
            placeholder="ABCD-0000"
            placeholderTextColor={T.inkMute}
            maxLength={9}
            autoCapitalize="characters"
            spellCheck={false}
            style={{
              flex: 1, fontFamily: ALMA_FONTS.display, fontSize: fs(22),
              letterSpacing: 2, color: T.ink, paddingVertical: 10,
            }}
          />
          <Button variant="primary" size="sm" onPress={submit}>
            <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(12), color: T.inkOnDeep }}>Join</Text>
          </Button>
        </View>
        {error ? <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(11), marginTop: 8, lineHeight: 17, color: T.accent }}>{error}</Text> : null}
        <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(11), color: T.inkMute, lineHeight: 18, marginTop: 14 }}>
          No code? Email <Text style={{ color: T.brand }}>hello@almaleague.org</Text> and we'll match you to a captain with an open seat.
        </Text>
      </View>

      <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
        <Button variant="ghost" fullWidth onPress={() => router.back()}>
          <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.ink }}>Back</Text>
        </Button>
      </View>
    </ScrollView>
  );
}
