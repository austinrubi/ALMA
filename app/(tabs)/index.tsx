import React from 'react';
import { View, ScrollView, Text, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme, ALMA_FONTS } from '../../lib/theme';
import { useApp } from '../../lib/AppContext';
import { viewerOf, teamOf, isCaptainOf } from '../../lib/roles';
import { Header } from '../../components/Header';
import { Card, Eyebrow, DisplayCaps, SerifTitle, Chip, Watercolor, Icon, Button } from '../../components/ui';

export default function HomeScreen() {
  const T = useTheme();
  const insets = useSafeAreaInsets();
  const { db, viewer: V } = useApp();
  const router = useRouter();

  const me = V.me;
  const myTeam = V.team || db.TEAMS[0];

  if (!me || !myTeam) {
    return (
      <View style={{ flex: 1, backgroundColor: T.appBg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={T.brand} />
      </View>
    );
  }
  const week = db.SEASON.currentWeek;
  const weekMatches = db.MATCHES.filter(m => m.week === week && (m.home === myTeam.id || m.away === myTeam.id));
  const sideOf = (m: typeof weekMatches[0]) => (m.home === myTeam.id ? 'home' : 'away');
  const myMatch = weekMatches.find(m => (m.seats[sideOf(m)] || []).includes(V.uid)) || null;
  const opp = myMatch
    ? db.TEAMS.find(t => t.id === (myMatch.home === myTeam.id ? myMatch.away : myMatch.home))
    : weekMatches.length ? db.TEAMS.find(t => t.id === (weekMatches[0].home === myTeam.id ? weekMatches[0].away : weekMatches[0].home)) : null;
  const oppPair = myMatch ? (myMatch.seats[sideOf(myMatch) === 'home' ? 'away' : 'home'] || []).filter(Boolean) : [];
  const partner = myMatch ? (myMatch.seats[sideOf(myMatch)] || []).filter(u => u && u !== V.uid) : [];

  const toLog = weekMatches.find(m => m.status !== 'final' && (m.seats.home || []).includes(V.uid) && m.home === myTeam.id);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: T.appBg }} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 120 }}>
      <Header
        eyebrow={`${db.SEASON.name} \u00B7 Week ${week} of ${db.SEASON.weekCount}`}
        title={me?.name?.split(' ')[0] || 'Home'}
        italic
        large
      />

      {/* Hero — your table this week */}
      {myMatch && opp && (
        <View style={{ paddingHorizontal: 18 }}>
          <Card variant="deep" style={{ padding: 26, position: 'relative' }}>
            <Watercolor corner="tr" size={340} intensity={0.9} />
            <View style={{ position: 'relative' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Eyebrow color={T.heroEyebrow}>{`Your table \u00B7 Match ${myMatch.table}`}</Eyebrow>
                <Chip variant="live">
                  <View style={{ width: 5, height: 5, borderRadius: 999, backgroundColor: T.surface }} />
                  <Eyebrow color={T.inkOnDeep}>{`Week ${week}`}</Eyebrow>
                </Chip>
              </View>

              <View style={{ marginTop: 28 }}>
                <DisplayCaps size={34} color={T.inkOnDeep}>{myTeam.shortName}</DisplayCaps>
                <Text style={{ fontFamily: ALMA_FONTS.serifItalic, fontSize: 16, color: 'rgba(239,234,217,0.65)', marginVertical: 6 }}>vs.</Text>
                <DisplayCaps size={34} color={T.inkOnDeep}>{opp.shortName}</DisplayCaps>
              </View>

              <View style={{ marginTop: 18, gap: 7 }}>
                <InfoRow icon="clock" color={T.inkOnDeep}>
                  {(myMatch.plan?.when) || 'Time not set yet'}
                </InfoRow>
                <InfoRow icon="pin" color={myMatch.plan?.where ? T.inkOnDeep : 'rgba(239,234,217,0.7)'}>
                  {myMatch.plan?.where || 'Place not set yet'}
                </InfoRow>
                <InfoRow icon="users" color={T.inkOnDeep}>
                  {partner.length ? `Paired with ${db.PEOPLE[partner[0]]?.name}` : 'Partner not seated yet'}
                </InfoRow>
                <InfoRow icon="phone" color="rgba(239,234,217,0.7)">
                  {oppPair.length
                    ? `Reach out to ${oppPair.map(u => db.PEOPLE[u]?.name?.split(' ')[0]).join(' & ')}`
                    : 'Opposing pair not set yet'}
                </InfoRow>
              </View>

              <View style={{ marginTop: 24 }}>
                <Button variant="onDeep" size="sm">Open match</Button>
              </View>
            </View>
          </Card>
        </View>
      )}

      {/* Not seated */}
      {!myMatch && (
        <View style={{ paddingHorizontal: 18 }}>
          <Card variant="deep" style={{ padding: 26, position: 'relative' }}>
            <Watercolor corner="tr" size={340} intensity={0.9} />
            <View style={{ position: 'relative' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Eyebrow color={T.heroEyebrow}>No table yet</Eyebrow>
                <Chip variant="live">
                  <View style={{ width: 5, height: 5, borderRadius: 999, backgroundColor: T.surface }} />
                  <Eyebrow color={T.inkOnDeep}>{`Week ${week}`}</Eyebrow>
                </Chip>
              </View>
              <View style={{ marginTop: 28 }}>
                <DisplayCaps size={34} color={T.inkOnDeep}>{myTeam.shortName}</DisplayCaps>
                {opp && (
                  <>
                    <Text style={{ fontFamily: ALMA_FONTS.serifItalic, fontSize: 16, color: 'rgba(239,234,217,0.65)', marginVertical: 6 }}>vs.</Text>
                    <DisplayCaps size={34} color={T.inkOnDeep}>{opp.shortName}</DisplayCaps>
                  </>
                )}
                <Text style={{ fontFamily: ALMA_FONTS.serifItalic, fontSize: 15, color: 'rgba(239,234,217,0.75)', lineHeight: 22, marginTop: 14 }}>
                  You're not at a table this week yet.
                </Text>
              </View>
              <View style={{ marginTop: 24 }}>
                <Button variant="onDeep" size="sm">Take a seat</Button>
              </View>
            </View>
          </Card>
        </View>
      )}

      {/* Score to log */}
      {toLog && (
        <View style={{ paddingHorizontal: 18, paddingTop: 16 }}>
          <Card style={{
            padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12,
            borderColor: T.accent, borderWidth: 1,
          }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(179,135,120,0.20)', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="edit" size={17} color={T.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Eyebrow color={T.accent}>You host · score not logged</Eyebrow>
              <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: 15.5, color: T.ink, marginTop: 2 }}>
                Log Match {toLog.table} once you've played.
              </Text>
            </View>
            <Icon name="chevronRight" size={18} color={T.inkSoft} />
          </Card>
        </View>
      )}

      {/* Resources link */}
      <View style={{ paddingHorizontal: 18, paddingTop: 16 }}>
        <Card onPress={() => router.push('/(tabs)/resources')} style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: T.surfaceTint, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="book" size={17} color={T.brand} />
          </View>
          <View style={{ flex: 1 }}>
            <Eyebrow>Resources</Eyebrow>
            <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: 15.5, color: T.ink, marginTop: 2 }}>
              Rulebook, scorecard, and FAQs
            </Text>
          </View>
          <Icon name="chevronRight" size={18} color={T.inkSoft} />
        </Card>
      </View>
    </ScrollView>
  );
}

function InfoRow({ icon, color, children }: { icon: string; color: string; children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Icon name={icon} size={14} color={color} />
      <Text style={{ fontFamily: 'Jost_400Regular', fontSize: 13, color }}>{children}</Text>
    </View>
  );
}
