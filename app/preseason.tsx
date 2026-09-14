import React from 'react';
import { View, ScrollView, Text, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme, ALMA_FONTS } from '../lib/theme';
import { useApp } from '../lib/AppContext';
import { Card, Eyebrow, DisplayCaps, SerifTitle, RuleDivider, Watercolor, Icon, Button } from '../components/ui';

function seasonDates(S: any) {
  const [y, m, d] = String(S.startDate || '').split('-').map(Number);
  const start = new Date(y, (m || 1) - 1, d || 1);
  const fmtLong = start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const fmtYear = start.getFullYear();
  return { start, fmtLong, fmtYear };
}

function daysUntil(start: Date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.round((start.getTime() - today.getTime()) / 86400000));
}

export default function PreseasonScreen() {
  const T = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { db } = useApp();
  const S = db.SEASON;
  const { start, fmtLong, fmtYear } = seasonDates(S);
  const left = daysUntil(start) || 11;
  const me = db.PEOPLE[db.CURRENT_USER];
  const myTeam = db.TEAMS.find(t => t.roster.includes(db.CURRENT_USER));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: T.appBg }} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 40 }}>
      <View style={{ paddingHorizontal: 24, position: 'relative', overflow: 'hidden' }}>
        <Watercolor corner="tr" size={300} intensity={0.65} />
        <Watercolor corner="bl" size={220} intensity={0.4} accent="terracotta" />

        <View style={{ alignItems: 'center', position: 'relative' }}>
          <Image source={require('../assets/images/alma-logo.png')} style={{ width: 108, height: 108 }} resizeMode="contain" />
          <View style={{ marginTop: 6 }}><Eyebrow>{S.name} · Preseason</Eyebrow></View>
          <View style={{ marginTop: 10 }}><SerifTitle size={27}>Play begins {fmtLong}.</SerifTitle></View>
          <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: 14, color: T.inkSoft, lineHeight: 22, marginTop: 8, textAlign: 'center' }}>
            {myTeam ? `You're on ${myTeam.name} for ${S.name}. ` : ''}Tables and opponents open here the morning the season starts.
          </Text>
        </View>

        {/* Countdown */}
        <Card style={{ marginTop: 20, padding: 0, overflow: 'hidden' }}>
          <View style={{ backgroundColor: T.brand, paddingVertical: 20, paddingHorizontal: 18, alignItems: 'center' }}>
            <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: 46, lineHeight: 50, color: '#E8CFA4' }}>{left}</Text>
            <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(239,234,217,0.72)', marginTop: 8 }}>
              days until week one
            </Text>
          </View>
          <PreRow label="Season opens" value={`${fmtLong}, ${fmtYear}`} />
          <PreRow label="Length" value={`${S.weekCount || 8} weeks · one match a week`} />
          <PreRow label="Format" value="Four to a table · cumulative scoring" />
        </Card>

        {/* Checklist */}
        <View style={{ marginTop: 24 }}><RuleDivider label="Before week one" /></View>
        <View style={{ gap: 9, marginTop: 14 }}>
          <PreTask n="1" title="Set your availability"
            body="Mark the play windows that work for you each week so your captain can seat you."
            action="Open availability" onPress={() => router.push('/availability')} />
          <PreTask n="2" title="Check your profile"
            body="Name, phone, and neighborhood — your captain and opponents use these to reach you."
            action="Edit profile" onPress={() => router.push('/edit-profile')} done={!!me} />
          <PreTask n="3" title="Read the rules"
            body="Scoring, conduct, and how a table settles a disputed hand."
            action="Open rules" onPress={() => router.push('/(tabs)/resources')} />
        </View>

        <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 11, color: T.inkMute, lineHeight: 18, textAlign: 'center', marginTop: 22, letterSpacing: 0.4 }}>
          The full app unlocks on {fmtLong}.
        </Text>
      </View>
    </ScrollView>
  );
}

function PreRow({ label, value }: { label: string; value: string }) {
  const T = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, paddingVertical: 13, paddingHorizontal: 18, borderTopWidth: 1, borderTopColor: T.border }}>
      <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', color: T.inkMute }}>{label}</Text>
      <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: 14, color: T.ink, textAlign: 'right', flex: 1 }}>{value}</Text>
    </View>
  );
}

function PreTask({ n, title, body, action, onPress, done }: { n: string; title: string; body: string; action: string; onPress: () => void; done?: boolean }) {
  const T = useTheme();
  return (
    <Card style={{ padding: 15 }}>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
        <View style={{
          width: 26, height: 26, borderRadius: 999, marginTop: 1,
          backgroundColor: done ? T.brand : T.surfaceTint,
          borderWidth: 1, borderColor: done ? T.brand : T.border,
          alignItems: 'center', justifyContent: 'center',
        }}>
          {done
            ? <Icon name="check" size={12} color="#EAF2EE" strokeWidth={2.5} />
            : <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 11, color: T.brand }}>{n}</Text>}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: 16, color: T.ink }}>{title}</Text>
          <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 11.5, color: T.inkSoft, lineHeight: 18, marginTop: 4 }}>{body}</Text>
          <TouchableOpacity onPress={onPress} style={{ marginTop: 9 }}>
            <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: T.brand, borderBottomWidth: 1, borderBottomColor: T.brand, alignSelf: 'flex-start' }}>
              {action}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
}
