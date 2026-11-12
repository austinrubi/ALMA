import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, Text, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme, ALMA_FONTS , fs } from '../lib/theme';
import { useApp } from '../lib/AppContext';
import { Eyebrow, DisplayCaps, Medal, Watercolor, Button } from '../components/ui';

const FINALE_BG = '#1B3A5C';
const { width: W } = Dimensions.get('window');

export default function ChampionScreen() {
  const T = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { db } = useApp();
  const [run, setRun] = useState(0);

  const ranking = db.TEAMS.slice().sort((a, b) => b.points - a.points);
  const winner = ranking[0];
  const rest = ranking.slice(1, 4);

  if (!winner) return <View style={{ flex: 1, padding: 24, backgroundColor: T.appBg }}><Text>No season played yet.</Text></View>;

  // Animations
  const fadeIn = useRef(new Animated.Value(0)).current;
  const dropY = useRef(new Animated.Value(-24)).current;
  const dropScale = useRef(new Animated.Value(0.86)).current;
  const riseY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    fadeIn.setValue(0); dropY.setValue(-24); dropScale.setValue(0.86); riseY.setValue(20);
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(dropY, { toValue: 0, tension: 40, friction: 8, useNativeDriver: true, delay: 300 }),
      Animated.spring(dropScale, { toValue: 1, tension: 40, friction: 8, useNativeDriver: true, delay: 300 }),
      Animated.timing(riseY, { toValue: 0, duration: 700, delay: 1000, useNativeDriver: true }),
    ]).start();
  }, [run]);

  return (
    <View style={{ flex: 1, backgroundColor: FINALE_BG }}>
      <Confetti key={run} />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 30, paddingHorizontal: 22, paddingBottom: 44 }}>
        {/* Eyebrow */}
        <Animated.View style={{ opacity: fadeIn, alignItems: 'center' }}>
          <Eyebrow color={T.heroEyebrow}>Spring 2026 · Season complete</Eyebrow>
        </Animated.View>

        {/* Trophy + champion */}
        <View style={{ alignItems: 'center', marginTop: 16 }}>
          <Animated.View style={{
            width: 86, height: 86, borderRadius: 999,
            backgroundColor: 'rgba(183,151,104,0.20)', borderWidth: 1, borderColor: 'rgba(183,151,104,0.75)',
            alignItems: 'center', justifyContent: 'center',
            transform: [{ translateY: dropY }, { scale: dropScale }],
            opacity: fadeIn,
          }}>
            <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: fs(34), color: '#E8CFA4' }}>❖</Text>
          </Animated.View>

          <Animated.View style={{ opacity: fadeIn, marginTop: 16 }}>
            <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(10), letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(239,234,217,0.7)', textAlign: 'center' }}>
              Season champion
            </Text>
          </Animated.View>

          <Animated.View style={{ transform: [{ translateY: dropY }, { scale: dropScale }], opacity: fadeIn, marginTop: 6 }}>
            <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: fs(34), color: T.inkOnDeep, textAlign: 'center', lineHeight: 40 }}>
              {winner.name}
            </Text>
          </Animated.View>

          <Animated.View style={{ opacity: fadeIn, marginTop: 10 }}>
            <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: fs(22), letterSpacing: 1.5, color: '#E8CFA4', textAlign: 'center' }}>
              {winner.points.toLocaleString()} PTS
            </Text>
          </Animated.View>

          <Animated.View style={{ opacity: fadeIn, marginTop: 10 }}>
            <Medal tier="gold">Champions</Medal>
          </Animated.View>
        </View>

        {/* Condensed standings */}
        <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: riseY }], marginTop: 20 }}>
          <View style={{
            borderRadius: 16, overflow: 'hidden',
            backgroundColor: 'rgba(239,234,217,0.08)', borderWidth: 1, borderColor: 'rgba(239,234,217,0.20)',
          }}>
            {/* Header */}
            <View style={{
              flexDirection: 'row', gap: 8, paddingVertical: 10, paddingHorizontal: 14,
              borderBottomWidth: 1, borderBottomColor: 'rgba(239,234,217,0.16)',
            }}>
              <Text style={{ width: 32, fontFamily: ALMA_FONTS.ui, fontSize: fs(9), letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(239,234,217,0.6)' }}>#</Text>
              <Text style={{ flex: 1, fontFamily: ALMA_FONTS.ui, fontSize: fs(9), letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(239,234,217,0.6)' }}>Team</Text>
              <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(9), letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(239,234,217,0.6)' }}>Cumulative</Text>
            </View>
            {/* Winner row */}
            <View style={{
              flexDirection: 'row', gap: 8, paddingVertical: 13, paddingHorizontal: 14,
              backgroundColor: 'rgba(183,151,104,0.16)', alignItems: 'center',
            }}>
              <Text style={{ width: 32, fontFamily: ALMA_FONTS.display, fontSize: fs(15), color: '#E8CFA4' }}>1</Text>
              <Text style={{ flex: 1, fontFamily: ALMA_FONTS.serif, fontSize: fs(16), color: T.inkOnDeep }}>{winner.shortName}</Text>
              <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: fs(18), color: '#E8CFA4' }}>{winner.points.toLocaleString()}</Text>
            </View>
            {/* Runners */}
            {rest.map((t, i) => (
              <View key={t.id} style={{
                flexDirection: 'row', gap: 8, paddingVertical: 11, paddingHorizontal: 14,
                borderTopWidth: 1, borderTopColor: 'rgba(239,234,217,0.10)', alignItems: 'center',
              }}>
                <Text style={{ width: 32, fontFamily: ALMA_FONTS.ui, fontSize: fs(11), color: 'rgba(239,234,217,0.66)' }}>{i + 2}</Text>
                <Text style={{ flex: 1, fontFamily: ALMA_FONTS.serif, fontSize: fs(15), color: 'rgba(239,234,217,0.88)' }}>{t.shortName}</Text>
                <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: fs(15), color: 'rgba(239,234,217,0.8)' }}>{t.points.toLocaleString()}</Text>
              </View>
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            <Button variant="onDeep" style={{ flex: 1 }} onPress={() => router.push('/(tabs)/standings')}>
              <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.ink }}>Final standings</Text>
            </Button>
            <Button variant="ghost" style={{ flex: 1, borderWidth: 1, borderColor: 'rgba(239,234,217,0.35)' }} onPress={() => setRun(r => r + 1)}>
              <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: 'rgba(239,234,217,0.85)' }}>Replay</Text>
            </Button>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// Simple confetti using Animated API
function Confetti() {
  const COLORS = ['#E8CFA4', '#B79768', '#8DA89A', '#D9A793', '#EFEAD9', '#CFE1E4'];
  const pieces = useRef(
    Array.from({ length: 40 }, (_, i) => ({
      x: new Animated.Value(Math.random() * W),
      y: new Animated.Value(-20 - Math.random() * 300),
      rotate: new Animated.Value(0),
      color: COLORS[i % COLORS.length],
      size: 4 + Math.random() * 6,
      duration: 3000 + Math.random() * 4000,
    }))
  ).current;

  useEffect(() => {
    pieces.forEach(p => {
      Animated.loop(
        Animated.parallel([
          Animated.timing(p.y, { toValue: Dimensions.get('window').height + 20, duration: p.duration, useNativeDriver: true }),
          Animated.timing(p.rotate, { toValue: 1, duration: p.duration, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 3 }} pointerEvents="none">
      {pieces.map((p, i) => (
        <Animated.View key={i} style={{
          position: 'absolute', width: p.size, height: p.size * 1.6,
          backgroundColor: p.color, borderRadius: 1,
          transform: [
            { translateX: p.x },
            { translateY: p.y },
            { rotate: p.rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${360 + Math.random() * 360}deg`] }) },
          ],
          opacity: 0.85,
        }} />
      ))}
    </View>
  );
}
