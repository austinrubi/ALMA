import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme, ALMA_FONTS , fs } from '../lib/theme';
import type { AlmaDB } from '../types';

interface WeekStripProps {
  db: AlmaDB;
  week: number;
  onChange: (w: number) => void;
}

export function WeekStrip({ db, week, onChange }: WeekStripProps) {
  const T = useTheme();
  const weeks = Array.from({ length: db.SEASON.weekCount || 8 }, (_, i) => i + 1);

  return (
    <View style={{ flexDirection: 'row', gap: 5, paddingTop: 4 }}>
      {weeks.map(w => {
        const on = w === week;
        const isCurrent = w === db.SEASON.currentWeek;
        return (
          <TouchableOpacity key={w} onPress={() => onChange(w)} activeOpacity={0.7} style={{
            flex: 1,
            backgroundColor: on ? T.brand : T.surface,
            borderWidth: 1,
            borderColor: isCurrent && !on ? T.accent : T.border,
            borderRadius: 12,
            paddingVertical: 11,
            paddingBottom: 8,
            alignItems: 'center',
            gap: 2,
          }}>
            <Text style={{
              fontFamily: ALMA_FONTS.ui, fontSize: fs(9),
              letterSpacing: 2, color: on ? T.inkOnDeep : T.ink,
              opacity: 0.7,
            }}>WK</Text>
            <Text style={{
              fontFamily: ALMA_FONTS.display, fontSize: fs(16),
              color: on ? T.inkOnDeep : T.ink,
            }}>{w}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
