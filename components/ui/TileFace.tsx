import React from 'react';
import { View, Text, Image, ViewStyle, StyleProp, ImageSourcePropType } from 'react-native';
import { useTheme, ALMA_FONTS } from '../../lib/theme';

export interface TileDef {
  id: string;
  glyph: string;
  name: string;
  short: string;
  ink: string;
  image?: ImageSourcePropType;
}

export const ALMA_TILES: TileDef[] = [
  { id: 'joker-01', glyph: '', name: 'Bernese',    short: 'Bernese',    ink: '#1B5E6B', image: require('../../assets/images/joker-01.png') },
  { id: 'joker-02', glyph: '', name: 'Bear',       short: 'Bear',       ink: '#1B5E6B', image: require('../../assets/images/joker-02.png') },
  { id: 'joker-03', glyph: '', name: 'Fox',        short: 'Fox',        ink: '#1B5E6B', image: require('../../assets/images/joker-03.png') },
  { id: 'joker-04', glyph: '', name: 'Panther',    short: 'Panther',    ink: '#1B5E6B', image: require('../../assets/images/joker-04.png') },
  { id: 'joker-05', glyph: '', name: 'Ram',        short: 'Ram',        ink: '#1B5E6B', image: require('../../assets/images/joker-05.png') },
  { id: 'joker-06', glyph: '', name: 'St. Bernard',short: 'St. Bernard',ink: '#1B5E6B', image: require('../../assets/images/joker-06.png') },
  { id: 'joker-07', glyph: '', name: 'Grizzly',    short: 'Grizzly',    ink: '#1B5E6B', image: require('../../assets/images/joker-07.png') },
  { id: 'joker-08', glyph: '', name: 'Shiba',      short: 'Shiba',      ink: '#1B5E6B', image: require('../../assets/images/joker-08.png') },
  { id: 'joker-09', glyph: '', name: 'Ocelot',     short: 'Ocelot',     ink: '#1B5E6B', image: require('../../assets/images/joker-09.png') },
  { id: 'joker-10', glyph: '', name: 'Bighorn',    short: 'Bighorn',    ink: '#1B5E6B', image: require('../../assets/images/joker-10.png') },
];

export const TILE_BY_ID: Record<string, TileDef> = {};
ALMA_TILES.forEach(t => { TILE_BY_ID[t.id] = t; });
// Legacy tile id aliases (users who had old tile selections)
TILE_BY_ID.joker = TILE_BY_ID['joker-05'];
TILE_BY_ID.plum = ALMA_TILES[0];
TILE_BY_ID.orchid = ALMA_TILES[1];
TILE_BY_ID.mum = ALMA_TILES[2];
TILE_BY_ID.bamboo = ALMA_TILES[3];
TILE_BY_ID.red = ALMA_TILES[4];
TILE_BY_ID.green = ALMA_TILES[5];
TILE_BY_ID.flower = ALMA_TILES[6];
TILE_BY_ID.spring = ALMA_TILES[7];
// Special tiles
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
      width: size * 0.85,
      height: size * 1.16,
      borderRadius: 0,
      backgroundColor: '#FBF7EC',
      borderWidth: selected ? 2 : 1,
      borderColor: selected ? T.brand : 'rgba(15,92,107,0.20)',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }, style]}>
      {def.image ? (
        <Image source={def.image} style={{
          width: size * 0.72,
          height: size * 1.02,
          borderRadius: 0,
        }} resizeMode="cover" />
      ) : (
        <Text style={{
          fontFamily: ALMA_FONTS.display,
          fontSize: size * 0.56,
          color: def.ink,
          lineHeight: size * 0.7,
        }}>{def.glyph}</Text>
      )}
    </View>
  );
}
