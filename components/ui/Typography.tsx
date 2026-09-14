import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import { useTheme, ALMA_FONTS } from '../../lib/theme';

interface EyebrowProps {
  children: React.ReactNode;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export function Eyebrow({ children, color, style }: EyebrowProps) {
  const T = useTheme();
  return (
    <Text style={[{
      fontFamily: ALMA_FONTS.uiMedium,
      fontSize: 10,
      letterSpacing: T.eyebrowTracking,
      textTransform: 'uppercase',
      color: color || T.inkSoft,
    }, style]}>{children}</Text>
  );
}

interface DisplayCapsProps {
  children: React.ReactNode;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export function DisplayCaps({ children, size = 22, color, style }: DisplayCapsProps) {
  const T = useTheme();
  return (
    <Text style={[{
      fontFamily: ALMA_FONTS.display,
      fontSize: size,
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: color || T.ink,
      lineHeight: size * 1.3,
    }, style]}>{children}</Text>
  );
}

interface SerifTitleProps {
  children: React.ReactNode;
  size?: number;
  italic?: boolean;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export function SerifTitle({ children, size = 22, italic = false, color, style }: SerifTitleProps) {
  const T = useTheme();
  return (
    <Text style={[{
      fontFamily: italic ? ALMA_FONTS.serifBoldItalic : ALMA_FONTS.serifSemiBold,
      fontSize: size,
      letterSpacing: -0.2,
      lineHeight: size * 1.3,
      color: color || T.ink,
    }, style]}>{children}</Text>
  );
}
