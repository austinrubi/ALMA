import React from 'react';
import { View, ScrollView, Text, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, ALMA_FONTS , fs } from '../../lib/theme';
import { useApp } from '../../lib/AppContext';
import { teamOf } from '../../lib/roles';
import { Header } from '../../components/Header';
import { SectionLabel } from '../../components/SectionLabel';
import { Card, Eyebrow, DisplayCaps, Chip, Medal, Watercolor, Icon } from '../../components/ui';

export default function StandingsScreen() {
  const T = useTheme();
  const insets = useSafeAreaInsets();
  const { db, viewer: V } = useApp();
  const division = db.DIVISIONS[0];

  const teams = db.TEAMS
    .filter(t => t.divisionId === division.id)
    .sort((a, b) => b.points - a.points);
  const myTeam = V.team;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: T.appBg }} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 120 }}>
      <Header eyebrow="Spring 2026" title="Standings" large />

      {/* Podium */}
      <View style={{ paddingHorizontal: 18 }}>
        <Card variant="deep" style={{ padding: 18, position: 'relative', overflow: 'hidden' }}>
          <Watercolor corner="tr" size={220} intensity={0.85} />
          <Image source={require('../../assets/images/peacock.png')}
            style={{ position: 'absolute', left: -100, bottom: -80, width: 280, height: 280, opacity: 0.2, transform: [{ scaleX: -1 }] }}
            resizeMode="contain" />
          <Eyebrow color={T.heroEyebrow}>{`Top of the table \u00B7 Week ${db.SEASON.currentWeek}`}</Eyebrow>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14, alignItems: 'flex-end', position: 'relative' }}>
            {teams.slice(0, 3).map((t, i) => {
              const heights = [110, 88, 70];
              const order = [1, 0, 2];
              const tier = i === 0 ? 'gold' : i === 1 ? 'jade' : 'terracotta';
              const place = i + 1;
              return (
                <View key={t.id} style={{ flex: 1, alignItems: 'center', order: order.indexOf(i) }}>
                  <Text style={{
                    fontFamily: ALMA_FONTS.serifSemiBold, fontSize: fs(14),
                    color: T.inkOnDeep, textAlign: 'center', marginBottom: 6, lineHeight: 17,
                  }}>{t.shortName}</Text>
                  <View style={{
                    height: heights[i], width: '100%',
                    backgroundColor: 'rgba(239,234,217,0.10)',
                    borderWidth: 1, borderColor: 'rgba(239,234,217,0.18)',
                    borderTopLeftRadius: 12, borderTopRightRadius: 12,
                    alignItems: 'center', justifyContent: 'center', gap: 4,
                  }}>
                    <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: fs(22), color: T.inkOnDeep }}>
                      {t.points.toLocaleString()}
                    </Text>
                    <Medal tier={tier}>{place === 1 ? 'Gold' : place === 2 ? 'Silver' : 'Bronze'}</Medal>
                  </View>
                </View>
              );
            })}
          </View>
        </Card>
      </View>

      {/* Full table */}
      <View style={{ paddingHorizontal: 18, paddingTop: 18 }}>
        <SectionLabel>{division.name}</SectionLabel>
        <Card style={{ marginTop: 10, padding: 0, overflow: 'hidden' }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 8,
            paddingVertical: 10, paddingHorizontal: 14,
            backgroundColor: T.surfaceAlt, borderBottomWidth: 1, borderBottomColor: T.border,
          }}>
            <Text style={{ width: 28, fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(10), letterSpacing: 1.6, textTransform: 'uppercase', color: T.inkSoft }}>#</Text>
            <Text style={{ flex: 1, fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(10), letterSpacing: 1.6, textTransform: 'uppercase', color: T.inkSoft }}>Team</Text>
            <Text style={{ width: 64, textAlign: 'right', fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(10), letterSpacing: 1.6, textTransform: 'uppercase', color: T.inkSoft }}>Points</Text>
          </View>

          {teams.map((t, i) => {
            const isMe = myTeam && t.id === myTeam.id;
            return (
              <View key={t.id} style={{
                flexDirection: 'row', alignItems: 'center', gap: 8,
                paddingVertical: 12, paddingHorizontal: 14,
                backgroundColor: isMe ? 'rgba(127,162,182,0.10)' : 'transparent',
                borderBottomWidth: i < teams.length - 1 ? 1 : 0, borderBottomColor: T.border,
              }}>
                <Text style={{ width: 28, fontFamily: ALMA_FONTS.display, fontSize: fs(14), color: T.ink }}>{i + 1}</Text>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: fs(14), color: T.ink }}>{t.shortName}</Text>
                  {isMe && <Chip variant="default"><Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(8), letterSpacing: 1.2, color: T.ink }}>You</Text></Chip>}
                </View>
                <Text style={{ width: 64, textAlign: 'right', fontFamily: ALMA_FONTS.display, fontSize: fs(15), color: T.ink }}>{t.points.toLocaleString()}</Text>
              </View>
            );
          })}
        </Card>
      </View>

      <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(11), color: T.inkMute, lineHeight: 17, textAlign: 'center', paddingHorizontal: 18, paddingTop: 14 }}>
        Ranking is the running sum of every match score this season.
      </Text>
    </ScrollView>
  );
}
