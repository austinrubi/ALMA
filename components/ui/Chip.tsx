import React from 'react';
import { View, Text, ViewStyle, StyleProp } from 'react-native';
import { useTheme, ALMA_FONTS } from '../../lib/theme';

interface ChipProps {
  children: React.ReactNode;
  variant?: 'default' | 'info' | 'success' | 'warn' | 'danger' | 'live' | 'accent' | 'onDeep';
  style?: StyleProp<ViewStyle>;
}

export function Chip({ children, variant = 'default', style }: ChipProps) {
  const T = useTheme();

  const tints: Record<string, { bg: string; fg: string }> = {
    default: { bg: T.surfaceTint, fg: T.ink },
    info:    { bg: 'rgba(127,162,182,0.18)', fg: '#355367' },
    success: { bg: 'rgba(94,124,112,0.18)',  fg: '#466357' },
    warn:    { bg: 'rgba(183,151,104,0.20)', fg: '#7E6537' },
    danger:  { bg: 'rgba(160,82,74,0.18)',   fg: '#7B3E38' },
    live:    { bg: T.accent, fg: T.inkOnDeep },
    accent:  { bg: 'rgba(179,135,120,0.20)', fg: '#6E4234' },
    onDeep:  { bg: 'rgba(239,234,217,0.18)', fg: T.inkOnDeep },
  };

  const v = tints[variant];

  return (
    <View style={[{
      backgroundColor: v.bg,
      borderRadius: 999,
      paddingVertical: 4,
      paddingHorizontal: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    }, style]}>
      {typeof children === 'string' ? (
        <Text style={{
          fontFamily: ALMA_FONTS.uiMedium,
          fontSize: 10,
          letterSpacing: 1.6,
          textTransform: 'uppercase',
          color: v.fg,
        }}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}
