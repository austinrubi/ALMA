import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme, ALMA_FONTS , fs } from '../lib/theme';
import { Icon } from './ui';

interface NavRowProps {
  icon: string;
  label: string;
  sub: string;
  onPress?: () => void;
  divider?: boolean;
}

export function NavRow({ icon, label, sub, onPress, divider }: NavRowProps) {
  const T = useTheme();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingVertical: 14, paddingHorizontal: 16,
      borderTopWidth: divider ? 1 : 0, borderTopColor: T.border,
    }}>
      <View style={{
        width: 32, height: 32, borderRadius: 8, backgroundColor: T.surfaceAlt,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={icon} size={16} color={T.ink} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: fs(15), color: T.ink }}>{label}</Text>
        <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(11), color: T.inkSoft, marginTop: 2 }}>{sub}</Text>
      </View>
      <Icon name="chevronRight" size={16} color={T.inkSoft} />
    </TouchableOpacity>
  );
}
