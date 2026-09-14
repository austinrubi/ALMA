import React from 'react';

export const ALMA_COLORS = {
  // Brand palette — sampled from the logo
  sky: '#7FA2B6',
  sky50: '#EEF3F6',
  sky100: '#DDE7ED',
  sky200: '#BCCFD9',
  sky300: '#9CB6C5',
  sky400: '#7FA2B6',
  sky500: '#5E869D',
  sky600: '#4A6E84',
  sky700: '#355367',
  sky800: '#20384A',
  sky900: '#1B3A4C',

  navy: '#1B3A4C',
  navySoft: '#2B4F63',
  ink: '#0F2230',

  cream: '#EFEAD9',
  creamDeep: '#E1DAC1',
  ivory: '#FAF7EE',
  bone: '#CFE1E4',

  terracotta: '#B38778',
  terracottaDeep: '#8E5E4C',
  peach: '#D9A793',
  jade: '#8DA89A',
  jadeDeep: '#5E7C70',
  sage: '#BCC8B5',
  gold: '#B79768',
  goldDeep: '#8E6F45',

  // Semantic
  success: '#5E7C70',
  warn: '#B79768',
  danger: '#A0524A',
  info: '#4A6E84',

  // Tile suit palette
  tileBone: '#F4EEDC',
  tileBoneShadow: '#CABB95',
  tileBamboo: '#4F7A53',
  tileCharacter: '#9C2B2B',
  tileCircle: '#3F6E91',
  tileWind: '#1B3A4C',
  tileDragonRed: '#9C2B2B',
  tileDragonGreen: '#4F7A53',
  tileDragonWhite: '#BCC8B5',
} as const;

export const ALMA_FONTS = {
  display: 'Cinzel_600SemiBold',
  displayBold: 'Cinzel_700Bold',
  serif: 'CormorantGaramond_400Regular',
  serifItalic: 'CormorantGaramond_400Regular_Italic',
  serifMedium: 'CormorantGaramond_500Medium',
  serifSemiBold: 'CormorantGaramond_600SemiBold',
  serifBold: 'CormorantGaramond_700Bold',
  serifBoldItalic: 'CormorantGaramond_700Bold_Italic',
  ui: 'Jost_400Regular',
  uiMedium: 'Jost_500Medium',
  uiSemiBold: 'Jost_600SemiBold',
  uiBold: 'Jost_700Bold',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

export const RADII = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  '2xl': 32,
  pill: 999,
} as const;

export interface AlmaTheme {
  id: string;
  name: string;
  appBg: string;
  surface: string;
  surfaceAlt: string;
  surfaceTint: string;
  surfaceDeep: string;
  ink: string;
  inkSoft: string;
  inkMute: string;
  inkOnDeep: string;
  brand: string;
  accent: string;
  accentSoft: string;
  sage: string;
  gold: string;
  border: string;
  borderStrong: string;
  tabBg: string;
  tabActiveBg: string;
  tabActiveFg: string;
  tabFg: string;
  heroBg: string;
  heroFg: string;
  heroEyebrow: string;
  shadowSm: object;
  shadowMd: object;
  shadowLg: object;
  watercolor: string;
  watercolorAlt: string;
  displayFont: string;
  serifFont: string;
  uiFont: string;
  radius: number;
  pillRadius: number;
  eyebrowTracking: number;
}

export const PARLOR_THEME: AlmaTheme = {
  id: 'parlor',
  name: 'Heritage Parlor',
  appBg: '#E8F0EC',
  surface: '#F2F7F4',
  surfaceAlt: '#D4E0D8',
  surfaceTint: '#D0E4E6',
  surfaceDeep: '#1B3A5C',
  ink: '#1B3A5C',
  inkSoft: '#3A6278',
  inkMute: '#7A9BA8',
  inkOnDeep: '#EAF2EE',
  brand: '#1B5E6B',
  accent: '#4A8E7A',
  accentSoft: '#7BB5A3',
  sage: '#8BAF9E',
  gold: '#B79768',
  border: 'rgba(27,58,92,0.12)',
  borderStrong: 'rgba(27,58,92,0.28)',
  tabBg: 'rgba(242,247,244,0.94)',
  tabActiveBg: '#1B3A5C',
  tabActiveFg: '#EAF2EE',
  tabFg: '#3A6278',
  heroBg: '#1B3A5C',
  heroFg: '#EAF2EE',
  heroEyebrow: '#7BB5A3',
  shadowSm: { shadowColor: '#1B3A5C', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
  shadowMd: { shadowColor: '#1B3A5C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 },
  shadowLg: { shadowColor: '#1B3A5C', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.14, shadowRadius: 32 },
  watercolor: 'rgba(139,175,158,0.30)',
  watercolorAlt: 'rgba(75,142,122,0.20)',
  displayFont: ALMA_FONTS.display,
  serifFont: ALMA_FONTS.serif,
  uiFont: ALMA_FONTS.ui,
  radius: 16,
  pillRadius: 999,
  eyebrowTracking: 3,
};

export const ThemeContext = React.createContext<AlmaTheme>(PARLOR_THEME);
export const useTheme = () => React.useContext(ThemeContext);
