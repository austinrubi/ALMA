import React from 'react';
import { View, Text, ViewStyle, StyleProp } from 'react-native';
import { useTheme, ALMA_FONTS , fs } from '../../lib/theme';

interface RuleDividerProps {
  label?: string;
  ornament?: string;
  style?: StyleProp<ViewStyle>;
}

export function RuleDivider({ label, ornament = '✦', style }: RuleDividerProps) {
  const T = useTheme();
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 12 }, style]}>
      <View style={{ flex: 1, height: 1, backgroundColor: T.border }} />
      {label ? (
        <Text style={{
          fontFamily: ALMA_FONTS.display,
          fontSize: fs(11),
          letterSpacing: 3,
          textTransform: 'uppercase',
          color: T.inkSoft,
        }}>{label}</Text>
      ) : (
        <Text style={{ fontSize: fs(13), color: T.accent }}>{ornament}</Text>
      )}
      <View style={{ flex: 1, height: 1, backgroundColor: T.border }} />
    </View>
  );
}
