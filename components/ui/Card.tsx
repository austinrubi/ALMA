import React from 'react';
import { View, ViewStyle, StyleProp, TouchableOpacity } from 'react-native';
import { useTheme } from '../../lib/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'sunken' | 'tinted' | 'deep' | 'quiet';
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export function Card({ children, variant = 'default', style, onPress }: CardProps) {
  const T = useTheme();

  const variants: Record<string, ViewStyle> = {
    default: { backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, ...(T.shadowSm as ViewStyle) },
    sunken:  { backgroundColor: T.surfaceAlt, borderWidth: 1, borderColor: T.border },
    tinted:  { backgroundColor: T.surfaceTint, borderWidth: 1, borderColor: T.border },
    deep:    { backgroundColor: T.surfaceDeep, borderWidth: 1, borderColor: 'transparent' },
    quiet:   { backgroundColor: 'transparent', borderWidth: 1, borderColor: T.border },
  };

  const cardStyle: ViewStyle = {
    borderRadius: T.radius,
    padding: 16,
    overflow: 'hidden',
    ...variants[variant],
  };

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={[cardStyle, style]}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
}
