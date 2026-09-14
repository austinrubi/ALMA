import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { useTheme, ALMA_FONTS } from '../lib/theme';

interface SegmentedOption {
  value: string;
  label: string;
}

interface SegmentedProps {
  value: string;
  options: SegmentedOption[];
  onChange: (v: string) => void;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Segmented({ value, options, onChange, fullWidth, style }: SegmentedProps) {
  const T = useTheme();
  return (
    <View style={[{
      flexDirection: 'row', padding: 3,
      backgroundColor: T.surfaceAlt, borderRadius: 999,
      borderWidth: 1, borderColor: T.border,
      width: fullWidth ? '100%' : undefined,
    }, style]}>
      {options.map(o => {
        const on = o.value === value;
        return (
          <TouchableOpacity key={o.value} onPress={() => onChange(o.value)} activeOpacity={0.7}
            style={{
              flex: fullWidth ? 1 : undefined,
              backgroundColor: on ? T.surface : 'transparent',
              borderRadius: 999, paddingVertical: 8, paddingHorizontal: 16,
              alignItems: 'center',
              ...(on ? T.shadowSm as ViewStyle : {}),
            }}>
            <Text style={{
              fontFamily: ALMA_FONTS.uiMedium, fontSize: 12, letterSpacing: 0.4,
              color: on ? T.ink : T.inkSoft,
            }}>{o.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
