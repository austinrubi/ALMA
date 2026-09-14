import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { useTheme, ALMA_FONTS } from '../lib/theme';
import { Icon } from './ui';

interface ContactRowProps {
  icon: string;
  label: string;
  value: string;
  href?: string;
  divider?: boolean;
}

export function ContactRow({ icon, label, value, href, divider }: ContactRowProps) {
  const T = useTheme();

  const content = (
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingVertical: 12, paddingHorizontal: 16,
      borderTopWidth: divider ? 1 : 0, borderTopColor: T.border,
    }}>
      <View style={{
        width: 32, height: 32, borderRadius: 8, backgroundColor: T.surfaceAlt,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={icon} size={15} color={T.ink} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: T.inkSoft }}>{label}</Text>
        <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: 15, color: T.ink, marginTop: 2 }} numberOfLines={1}>{value}</Text>
      </View>
      <Icon name="chevronRight" size={16} color={T.inkSoft} />
    </View>
  );

  if (href) {
    return (
      <TouchableOpacity onPress={() => Linking.openURL(href)} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}
