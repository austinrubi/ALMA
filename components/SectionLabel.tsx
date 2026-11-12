import React from 'react';
import { View, Text, ViewStyle, StyleProp } from 'react-native';
import { useTheme, ALMA_FONTS , fs } from '../lib/theme';

interface SectionLabelProps {
  children: React.ReactNode;
  action?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function SectionLabel({ children, action, style }: SectionLabelProps) {
  const T = useTheme();
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }, style]}>
      <Text style={{
        fontFamily: ALMA_FONTS.display,
        fontSize: fs(13),
        letterSpacing: 3,
        textTransform: 'uppercase',
        color: T.ink,
      }}>{children}</Text>
      {action}
    </View>
  );
}
