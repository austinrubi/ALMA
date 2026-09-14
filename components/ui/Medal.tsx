import React from 'react';
import { View, Text, ViewStyle, StyleProp } from 'react-native';
import { useTheme, ALMA_FONTS } from '../../lib/theme';

interface MedalProps {
  tier?: 'gold' | 'jade' | 'terracotta';
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Medal({ tier = 'gold', children, style }: MedalProps) {
  const tiers: Record<string, { bg: string; bd: string; fg: string }> = {
    gold:       { bg: 'rgba(183,151,104,0.34)', bd: 'rgba(140,110,58,0.45)', fg: '#553D18' },
    jade:       { bg: 'rgba(141,168,154,0.36)', bd: 'rgba(93,124,108,0.45)', fg: '#2F4438' },
    terracotta: { bg: 'rgba(179,135,120,0.34)', bd: 'rgba(140,94,78,0.45)',  fg: '#5A3227' },
  };

  const v = tiers[tier];

  return (
    <View style={[{
      backgroundColor: v.bg,
      borderWidth: 1,
      borderColor: v.bd,
      borderRadius: 999,
      paddingVertical: 4,
      paddingHorizontal: 11,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    }, style]}>
      <Text style={{ fontSize: 12, color: v.fg }}>{'❖'}</Text>
      <Text style={{
        fontFamily: ALMA_FONTS.displayBold,
        fontSize: 11,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: v.fg,
      }}>{children}</Text>
    </View>
  );
}
