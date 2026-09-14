import React from 'react';
import { View, Text, ViewStyle, StyleProp } from 'react-native';
import { useTheme, ALMA_FONTS } from '../../lib/theme';
import { TileFace } from './TileFace';

interface AvatarProps {
  initials?: string;
  tile?: string;
  size?: number;
  tint?: string;
  style?: StyleProp<ViewStyle>;
}

export function Avatar({ initials, tile, size = 36, tint = 'bone', style }: AvatarProps) {
  const T = useTheme();

  if (tile) return <TileFace tile={tile} size={size} style={style} />;

  const tints: Record<string, string> = {
    bone: '#CFE1E4',
    cream: '#E1DAC1',
    sky: '#BCCFD9',
    sage: '#BCC8B5',
  };

  return (
    <View style={[{
      width: size,
      height: size,
      borderRadius: 999,
      backgroundColor: tints[tint] || tint,
      alignItems: 'center',
      justifyContent: 'center',
    }, style]}>
      <Text style={{
        fontFamily: ALMA_FONTS.display,
        fontSize: size * 0.34,
        color: T.ink,
        letterSpacing: 0.5,
      }}>{initials}</Text>
    </View>
  );
}
