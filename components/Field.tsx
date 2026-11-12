import React, { useState } from 'react';
import { View, Text, TextInput, ViewStyle, StyleProp } from 'react-native';
import { useTheme, ALMA_FONTS , fs } from '../lib/theme';

interface FieldProps {
  label?: string;
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password';
  required?: boolean;
  hint?: string;
  error?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Field({ label, value, onChange, placeholder, type = 'text', required, hint, error, style }: FieldProps) {
  const T = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={[{ gap: 6 }, style]}>
      {label && (
        <Text style={{
          fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(11), letterSpacing: 1.2,
          textTransform: 'uppercase', color: T.inkSoft,
        }}>
          {label}{required && <Text style={{ color: T.accent, marginLeft: 4 }}> *</Text>}
        </Text>
      )}
      <TextInput
        value={value || ''}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={T.inkMute}
        secureTextEntry={type === 'password'}
        keyboardType={type === 'email' ? 'email-address' : 'default'}
        autoCapitalize={type === 'email' ? 'none' : 'sentences'}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          backgroundColor: T.surface,
          borderWidth: 1,
          borderColor: error ? T.accent : focused ? T.brand : T.border,
          borderRadius: 10,
          paddingVertical: 12,
          paddingHorizontal: 14,
          fontFamily: ALMA_FONTS.serif,
          fontSize: fs(16),
          color: T.ink,
        }}
      />
      {hint && (
        <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(11), color: error ? T.accent : T.inkMute }}>{hint}</Text>
      )}
    </View>
  );
}
