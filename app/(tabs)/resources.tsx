import React, { useState } from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, Linking, Modal, Image, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme, ALMA_FONTS , fs } from '../../lib/theme';
import { useApp } from '../../lib/AppContext';
import { Header } from '../../components/Header';
import { SectionLabel } from '../../components/SectionLabel';
import { Card, Eyebrow, DisplayCaps, SerifTitle, Chip, Watercolor, Icon, Button } from '../../components/ui';

const FAQ_URL = 'https://docs.google.com/document/d/1pZC1QYY0vlvelieRBGe4ww4i23xlpDJDGCZNxHesbI8/edit?usp=sharing';
const GUIDEBOOK_URL = 'https://docs.google.com/document/d/1YWwv3kNYsr3Nr65pMXbtc2yQhLV9MrHZaIL3p3bm8r0/edit?usp=sharing';

export default function ResourcesScreen() {
  const T = useTheme();
  const insets = useSafeAreaInsets();
  const { db, viewer: V } = useApp();
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const faqs = db.FAQS;
  const [scorecardOpen, setScorecardOpen] = useState(false);

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
              <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: fs(17), color: T.ink }}>FAQ</Text>
              <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(12), color: T.inkSoft, marginTop: 2 }}>Full frequently asked questions</Text>
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
              <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: fs(17), color: T.ink }}>Official Guidebook</Text>
              <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(12), color: T.inkSoft, marginTop: 2 }}>Rules, scoring, and season format</Text>
            </View>
            <Icon name="chevronRight" size={18} color={T.inkSoft} />
          </Card>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setScorecardOpen(true)} activeOpacity={0.7}>
          <Card style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: T.surfaceTint, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="edit" size={22} color={T.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: fs(17), color: T.ink }}>Scorecard</Text>
              <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(12), color: T.inkSoft, marginTop: 2 }}>Official ALMA scorecard</Text>
            </View>
            <Icon name="chevronRight" size={18} color={T.inkSoft} />
          </Card>
        </TouchableOpacity>

        <Modal visible={scorecardOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setScorecardOpen(false)}>
          <View style={{ flex: 1, backgroundColor: T.appBg }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingTop: insets.top + 12, paddingBottom: 12 }}>
              <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: fs(20), color: T.ink }}>Scorecard</Text>
              <TouchableOpacity onPress={() => setScorecardOpen(false)}>
                <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.brand }}>Done</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 18 }} maximumZoomScale={3} minimumZoomScale={1}>
              <Image
                source={require('../../assets/images/alma-scorecard.png')}
                style={{ width: Dimensions.get('window').width - 36, height: (Dimensions.get('window').width - 36) * 1.414 }}
                resizeMode="contain"
              />
            </ScrollView>
          </View>
        </Modal>
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
                  <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: fs(15), color: T.ink, marginTop: 4 }}>{f.q}</Text>
                </View>
                <Icon name={open ? 'chevronDown' : 'chevronRight'} size={16} color={T.inkSoft} />
              </TouchableOpacity>
              {open && (
                <View style={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: T.border }}>
                  <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: fs(15), color: T.ink, lineHeight: 23 }}>{f.a}</Text>
                </View>
              )}
            </Card>
          );
        })}
        <TouchableOpacity onPress={() => Linking.openURL(FAQ_URL)} style={{ alignSelf: 'center', paddingTop: 8 }}>
          <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(13), color: T.brand, textDecorationLine: 'underline' }}>
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
            <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: fs(15), color: T.ink, lineHeight: 24 }}>
              ALMA is the premiere TEAM mahjong league. Teams compete for 8 weeks in a city-specific format. Schedule and join matches that work with your calendar — our custom app keeps everything organized.
            </Text>
          </View>
        </Card>
        <View style={{ paddingTop: 10 }}>
          <Card variant="tinted" style={{ padding: 16, flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <Icon name="mail" size={20} color={T.inkSoft} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: fs(14), color: T.ink }}>Contact us</Text>
              <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(11), color: T.inkSoft, marginTop: 2 }}>
                info@almamahj.com
              </Text>
            </View>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}
