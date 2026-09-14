import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../lib/theme';

interface WatercolorProps {
  corner?: 'tr' | 'tl' | 'br' | 'bl';
  size?: number;
  intensity?: number;
  accent?: 'sage' | 'terracotta';
  style?: StyleProp<ViewStyle>;
}

export function Watercolor({ corner = 'tr', size = 220, intensity = 1, accent = 'sage', style }: WatercolorProps) {
  const T = useTheme();
  const color = accent === 'sage' ? T.watercolor : T.watercolorAlt;

  const positions: Record<string, ViewStyle> = {
    tr: { top: -size * 0.3, right: -size * 0.3 },
    tl: { top: -size * 0.3, left: -size * 0.3 },
    br: { bottom: -size * 0.3, right: -size * 0.3 },
    bl: { bottom: -size * 0.3, left: -size * 0.3 },
  };

  return (
    <View style={[{
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      opacity: intensity * 0.6,
      ...positions[corner],
    }, style]} pointerEvents="none" />
  );
}
