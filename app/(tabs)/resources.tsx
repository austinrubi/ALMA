import React, { useState } from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme, ALMA_FONTS } from '../../lib/theme';
import { useApp } from '../../lib/AppContext';
import { Header } from '../../components/Header';
import { SectionLabel } from '../../components/SectionLabel';
import { Card, Eyebrow, DisplayCaps, SerifTitle, Chip, Watercolor, Icon } from '../../components/ui';

const FAQ_URL = 'https://docs.google.com/document/d/1pZC1QYY0vlvelieRBGe4ww4i23xlpDJDGCZNxHesbI8/edit?usp=sharing';
const GUIDEBOOK_URL = 'https://docs.google.com/document/d/1YWwv3kNYsr3Nr65pMXbtc2yQhLV9MrHZaIL3p3bm8r0/edit?usp=sharing';

export default function ResourcesScreen() {
  const T = useTheme();
  const insets = useSafeAreaInsets();
  const { db, viewer: V } = useApp();
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const faqs = db.FAQS;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: T.appBg }} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 120 }}>
      <Header title="Resources" large />

      {/* Quick links */}
      <View style={{ paddingHorizontal: 18, paddingTop: 8, gap: 10 }}>
        <TouchableOpacity onPress={() => Linking.openURL(FAQ_URL)} activeOpacity={0.7}>
          <Card style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: T.surfaceTint, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="info" size={22} color={T.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: 17, color: T.ink }}>FAQ</Text>
              <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 12, color: T.inkSoft, marginTop: 2 }}>Full frequently asked questions</Text>
            </View>
            <Icon name="chevronRight" size={18} color={T.inkSoft} />
          </Card>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Linking.openURL(GUIDEBOOK_URL)} activeOpacity={0.7}>
          <Card style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: T.surfaceTint, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="document" size={22} color={T.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: 17, color: T.ink }}>Official Guidebook</Text>
              <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 12, color: T.inkSoft, marginTop: 2 }}>Rules, scoring, and season format</Text>
            </View>
            <Icon name="chevronRight" size={18} color={T.inkSoft} />
          </Card>
        </TouchableOpacity>

        <Card style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: T.surfaceTint, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="edit" size={22} color={T.brand} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: 17, color: T.ink }}>Scorecard</Text>
            <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 12, color: T.inkSoft, marginTop: 2 }}>Log scores from the Schedule tab</Text>
          </View>
          <Chip variant="info">
            <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 10, letterSpacing: 1.2, color: '#355367' }}>In-app</Text>
          </Chip>
        </Card>
      </View>

      {/* In-app FAQ */}
      <View style={{ paddingHorizontal: 18, paddingTop: 26 }}>
        <SectionLabel>Quick answers</SectionLabel>
      </View>
      <View style={{ paddingHorizontal: 18, paddingTop: 10, gap: 8 }}>
        {faqs.map(f => {
          const open = openFaq === f.id;
          return (
            <Card key={f.id} style={{ padding: 0, overflow: 'hidden' }}>
              <TouchableOpacity onPress={() => setOpenFaq(open ? null : f.id)} activeOpacity={0.7}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 }}>
                <View style={{ flex: 1 }}>
                  <Eyebrow>{f.cat}</Eyebrow>
                  <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: 15, color: T.ink, marginTop: 4 }}>{f.q}</Text>
                </View>
                <Icon name={open ? 'chevronDown' : 'chevronRight'} size={16} color={T.inkSoft} />
              </TouchableOpacity>
              {open && (
                <View style={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: T.border }}>
                  <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: 15, color: T.ink, lineHeight: 23 }}>{f.a}</Text>
                </View>
              )}
            </Card>
          );
        })}
        <TouchableOpacity onPress={() => Linking.openURL(FAQ_URL)} style={{ alignSelf: 'center', paddingTop: 8 }}>
          <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 13, color: T.brand, textDecorationLine: 'underline' }}>
            View full FAQ
          </Text>
        </TouchableOpacity>
      </View>

      {/* About */}
      <View style={{ paddingHorizontal: 18, paddingTop: 26 }}>
        <SectionLabel>About ALMA</SectionLabel>
      </View>
      <View style={{ paddingHorizontal: 18, paddingTop: 10 }}>
        <Card style={{ padding: 22, position: 'relative', overflow: 'hidden' }}>
          <Watercolor corner="tr" size={200} intensity={0.5} />
          <View style={{ position: 'relative' }}>
            <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: 15, color: T.ink, lineHeight: 24 }}>
              ALMA is the premiere TEAM mahjong league. Teams compete for 8 weeks in a city-specific format. Schedule and join matches that work with your calendar — our custom app keeps everything organized.
            </Text>
          </View>
        </Card>
        {db.PEOPLE[db.ADMIN_USER] && (
          <View style={{ paddingTop: 10 }}>
            <Card variant="tinted" style={{ padding: 16, flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
              <Icon name="mail" size={20} color={T.inkSoft} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: 14, color: T.ink }}>League administrator</Text>
                <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 11, color: T.inkSoft, marginTop: 2 }}>
                  {db.PEOPLE[db.ADMIN_USER]?.name} · {db.PEOPLE[db.ADMIN_USER]?.email}
                </Text>
              </View>
            </Card>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
