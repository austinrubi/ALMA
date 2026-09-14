import React from 'react';
import { View, Text, ViewStyle, StyleProp } from 'react-native';
import { useTheme, ALMA_FONTS } from '../../lib/theme';

export interface TileDef {
  id: string;
  glyph: string;
  name: string;
  short: string;
  ink: string;
}

export const ALMA_TILES: TileDef[] = [
  { id: 'plum',    glyph: '\u6885', name: 'Plum',          short: 'Plum',   ink: '#A6486B' },
  { id: 'orchid',  glyph: '\u862D', name: 'Orchid',        short: 'Orchid', ink: '#6B5AA6' },
  { id: 'mum',     glyph: '\u83CA', name: 'Chrysanthemum', short: 'Mum',    ink: '#B8862F' },
  { id: 'bamboo',  glyph: '\u7AF9', name: 'Bamboo',        short: 'Bamboo', ink: '#3F7A5A' },
  { id: 'red',     glyph: '\u4E2D', name: 'Red Dragon',    short: 'Red',    ink: '#9E3B2E' },
  { id: 'green',   glyph: '\u767C', name: 'Green Dragon',  short: 'Green',  ink: '#3F564B' },
  { id: 'flower',  glyph: '\u82B1', name: 'Flower',        short: 'Flower', ink: '#B38778' },
  { id: 'spring',  glyph: '\u6625', name: 'Spring',        short: 'Spring', ink: '#8C6A2F' },
];

export const TILE_BY_ID: Record<string, TileDef> = {};
ALMA_TILES.forEach(t => { TILE_BY_ID[t.id] = t; });
// Special tiles
TILE_BY_ID.joker = { id: 'joker', glyph: '\u5BF6', name: 'Joker', short: 'Joker', ink: '#9E3B2E' };
TILE_BY_ID.blank = { id: 'blank', glyph: '', name: 'Blank', short: 'Blank', ink: '#0F5C6B' };

interface TileFaceProps {
  tile: string;
  size?: number;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function TileFace({ tile, size = 40, selected = false, style }: TileFaceProps) {
  const T = useTheme();
  const def = TILE_BY_ID[tile] || ALMA_TILES[0];

  return (
    <View style={[{
      width: size,
      height: size * 1.16,
      borderRadius: Math.max(5, size * 0.18),
      backgroundColor: '#FBF7EC',
      borderWidth: selected ? 2 : 1,
      borderColor: selected ? T.brand : 'rgba(15,92,107,0.20)',
      alignItems: 'center',
      justifyContent: 'center',
    }, style]}>
      <Text style={{
        fontFamily: ALMA_FONTS.display,
        fontSize: size * 0.56,
        color: def.ink,
        lineHeight: size * 0.7,
      }}>{def.glyph}</Text>
    </View>
  );
}
