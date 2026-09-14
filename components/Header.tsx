import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useTheme, ALMA_FONTS } from '../lib/theme';
import { Eyebrow, DisplayCaps, SerifTitle, Icon } from './ui';

interface HeaderProps {
  title?: string;
  eyebrow?: string;
  back?: string;
  onBack?: () => void;
  action?: React.ReactNode;
  dark?: boolean;
  large?: boolean;
  italic?: boolean;
}

export function Header({ title, eyebrow, back, onBack, action, dark = false, large = true, italic = false }: HeaderProps) {
  const T = useTheme();
  const fg = dark ? T.inkOnDeep : T.ink;
  const fgSoft = dark ? 'rgba(239,234,217,0.7)' : T.inkSoft;

  return (
    <View style={{ paddingHorizontal: 22, paddingTop: 14, paddingBottom: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 28 }}>
        {back ? (
          <TouchableOpacity onPress={onBack} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="chevronLeft" size={18} color={fg} />
            <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 13, letterSpacing: 0.5, color: fg }}>{back}</Text>
          </TouchableOpacity>
        ) : <View />}
        {action || <View />}
      </View>
      {eyebrow && (
        <View style={{ marginTop: 12 }}>
          <Eyebrow color={fgSoft}>{eyebrow}</Eyebrow>
        </View>
      )}
      {title && (
        <View style={{ marginTop: 6 }}>
          {italic ? (
            <SerifTitle size={large ? 30 : 22} italic color={fg}>{title}</SerifTitle>
          ) : (
            <DisplayCaps size={large ? 28 : 20} color={fg}>{title}</DisplayCaps>
          )}
        </View>
      )}
    </View>
  );
}
