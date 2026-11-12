import React from 'react';
import { TouchableOpacity, Text, ViewStyle, StyleProp, View } from 'react-native';
import { useTheme, ALMA_FONTS, RADII , fs } from '../../lib/theme';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'onDeep' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ children, variant = 'primary', size = 'md', onPress, disabled, fullWidth, style }: ButtonProps) {
  const T = useTheme();

  const variants: Record<string, { bg: string; fg: string; border: string }> = {
    primary:   { bg: T.brand, fg: T.inkOnDeep, border: 'transparent' },
    secondary: { bg: T.surface, fg: T.ink, border: T.borderStrong },
    accent:    { bg: 'transparent', fg: T.accent, border: T.accent },
    ghost:     { bg: 'transparent', fg: T.ink, border: 'transparent' },
    onDeep:    { bg: T.surface, fg: T.ink, border: 'transparent' },
    danger:    { bg: 'transparent', fg: '#A0524A', border: 'rgba(160,82,74,0.5)' },
  };

  const sizes: Record<string, { paddingVertical: number; paddingHorizontal: number; fontSize: number; borderRadius: number }> = {
    sm: { paddingVertical: 8, paddingHorizontal: 14, fontSize: fs(12), borderRadius: RADII.pill },
    md: { paddingVertical: 12, paddingHorizontal: 22, fontSize: fs(14), borderRadius: RADII.pill },
    lg: { paddingVertical: 14, paddingHorizontal: 28, fontSize: fs(15), borderRadius: RADII.pill },
  };

  const v = variants[variant];
  const s = sizes[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[{
        backgroundColor: v.bg,
        borderWidth: 1,
        borderColor: v.border,
        borderRadius: s.borderRadius,
        paddingVertical: s.paddingVertical,
        paddingHorizontal: s.paddingHorizontal,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        opacity: disabled ? 0.4 : 1,
        width: fullWidth ? '100%' : undefined,
      }, style]}
    >
      {typeof children === 'string' ? (
        <Text style={{
          fontFamily: ALMA_FONTS.uiMedium,
          fontSize: s.fontSize,
          letterSpacing: 0.5,
          color: v.fg,
        }}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}
