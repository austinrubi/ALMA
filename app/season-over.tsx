import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme, ALMA_FONTS , fs } from '../lib/theme';
import { useApp } from '../lib/AppContext';
import { Card, Eyebrow, SerifTitle, DisplayCaps, Medal, Chip, RuleDivider, Watercolor, Button } from '../components/ui';

export default function SeasonOverScreen() {
  const T = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { db } = useApp();
  const S = db.SEASON;

  const ranking = db.TEAMS.slice().sort((a, b) => b.points - a.points);
  const champ = ranking[0];
  const runners = ranking.slice(1, 3);
  const myTeam = db.TEAMS.find(t => t.roster.includes(db.CURRENT_USER));
  const myPlace = myTeam ? ranking.findIndex(t => t.id === myTeam.id) + 1 : null;
  const champRoster = champ ? champ.roster.map(id => db.PEOPLE[id]).filter(Boolean) : [];

  const placeWord = (p: number) => p === 1 ? 'first' : p === 2 ? 'second' : p === 3 ? 'third' : `${p}th`;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: T.appBg }} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 40 }}>
      <View style={{ paddingHorizontal: 24, position: 'relative', overflow: 'hidden' }}>
        <Watercolor corner="tr" size={280} intensity={0.6} />
        <Watercolor corner="bl" size={230} intensity={0.4} accent="terracotta" />

        <View style={{ alignItems: 'center', position: 'relative' }}>
          <Eyebrow>{S.name} · Season complete</Eyebrow>
          <View style={{
            width: 70, height: 70, borderRadius: 999, marginTop: 12,
            backgroundColor: 'rgba(183,151,104,0.18)', borderWidth: 1, borderColor: 'rgba(183,151,104,0.7)',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: fs(28), color: '#8C6E3A' }}>❖</Text>
          </View>
          <SerifTitle size={26} style={{ marginTop: 14, textAlign: 'center' }}>
            Congratulations, {champ ? champ.name : 'champions'}.
          </SerifTitle>
          <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: fs(14.5), color: T.inkSoft, lineHeight: 22, marginTop: 8, textAlign: 'center' }}>
            {champ ? `${champ.points.toLocaleString()} points across ${S.weekCount || 8} weeks \u2014 the highest cumulative score in the league. ` : ''}
            Thank you to every team for a full season of play.
          </Text>
          <View style={{ marginTop: 12 }}>
            <Medal tier="gold">{S.name} champions</Medal>
          </View>
        </View>

        {/* Winning roster */}
        {champRoster.length > 0 && (
          <Card style={{ marginTop: 20, padding: 16 }}>
            <Eyebrow>Winning roster</Eyebrow>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 11 }}>
              {champRoster.map(p => (
                <View key={p.id} style={{
                  paddingVertical: 6, paddingHorizontal: 11, borderRadius: 999,
                  backgroundColor: T.surfaceTint, borderWidth: 1, borderColor: T.border,
                }}>
                  <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(11.5), letterSpacing: 0.3, color: T.ink }}>{p.name}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Podium */}
        <Card style={{ marginTop: 12, padding: 0, overflow: 'hidden' }}>
          <View style={{ paddingVertical: 13, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: T.border }}>
            <Eyebrow>Also on the podium</Eyebrow>
          </View>
          {runners.map((t, i) => (
            <View key={t.id} style={{
              flexDirection: 'row', alignItems: 'center', gap: 10,
              paddingVertical: 13, paddingHorizontal: 16,
              borderTopWidth: i ? 1 : 0, borderTopColor: T.border,
            }}>
              <Text style={{ width: 26, fontFamily: ALMA_FONTS.display, fontSize: fs(14), color: T.inkMute }}>{i + 2}</Text>
              <Text style={{ flex: 1, fontFamily: ALMA_FONTS.serif, fontSize: fs(15.5), color: T.ink }}>{t.name}</Text>
              <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: fs(14), color: T.inkSoft }}>{t.points.toLocaleString()}</Text>
            </View>
          ))}
        </Card>

        {myPlace && myTeam && (
          <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: fs(14), color: T.inkSoft, textAlign: 'center', marginTop: 14, lineHeight: 22 }}>
            {myTeam.name} finished {placeWord(myPlace)} with {myTeam.points.toLocaleString()} points.
          </Text>
        )}

        {/* What's next */}
        <View style={{ marginTop: 24 }}><RuleDivider label="What's next" /></View>
        <Card variant="deep" style={{ marginTop: 14, padding: 18 }}>
          <SerifTitle size={20} color={T.inkOnDeep}>Stay tuned for the next season.</SerifTitle>
          <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: fs(14), color: 'rgba(239,234,217,0.82)', lineHeight: 22, marginTop: 8 }}>
            Registration for the next ALMA season opens a few weeks from now. Watch your email and this app — your captain will send a fresh team code when rosters are set.
          </Text>
        </Card>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <Button variant="secondary" style={{ flex: 1 }} onPress={() => router.push('/(tabs)/standings')}>
            <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.ink }}>Final standings</Text>
          </Button>
          <Button variant="ghost" style={{ flex: 1 }} onPress={() => router.push('/champion')}>
            <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.ink }}>Replay the finale</Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
