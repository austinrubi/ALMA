import React from 'react';
import { View, ScrollView, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme, ALMA_FONTS } from '../../lib/theme';
import { useApp } from '../../lib/AppContext';
import { weeksAnsweredCount, seasonWeeks } from '../../lib/availability';
import { Header } from '../../components/Header';
import { ContactRow } from '../../components/ContactRow';
import { NavRow } from '../../components/NavRow';
import { SectionLabel } from '../../components/SectionLabel';
import { Card, Eyebrow, SerifTitle, Chip, TileFace, Watercolor } from '../../components/ui';

export default function ProfileScreen() {
  const T = useTheme();
  const insets = useSafeAreaInsets();
  const { db, viewer: V, session, app } = useApp();
  const router = useRouter();
  const me = V.me;
  const myTeam = V.team;

  if (!me) {
    return (
      <View style={{ flex: 1, backgroundColor: T.appBg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={T.brand} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: T.appBg }} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 120 }}>
      <Header title="Profile" large />

      {/* Identity card */}
      <View style={{ paddingHorizontal: 18 }}>
        <Card style={{ padding: 20, flexDirection: 'row', gap: 16, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <Watercolor corner="tr" size={180} intensity={0.55} />
          <View style={{ position: 'relative' }}>
            <TileFace tile={me?.tile || 'plum'} size={64} />
          </View>
          <View style={{ flex: 1, position: 'relative' }}>
            <Eyebrow>{V.def.tagline}</Eyebrow>
            <SerifTitle size={22} style={{ marginTop: 4 }}>{me?.name}</SerifTitle>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <Chip variant={V.isPlayer ? 'default' : 'accent'} style={{ paddingVertical: 2, paddingHorizontal: 6 }}>
                <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 8, letterSpacing: 1.2, textTransform: 'uppercase', color: V.isPlayer ? T.ink : '#6E4234' }}>
                  {V.def.chip}
                </Text>
              </Chip>
              <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 12, color: T.inkSoft, marginLeft: 4 }}>
                {myTeam ? myTeam.shortName : 'No team yet'}
              </Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Contact card */}
      <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <ContactRow icon="mail" label="Email" value={me?.email || ''} href={`mailto:${me?.email}`} />
          <ContactRow icon="phone" label="Mobile" value={me?.phone || ''} href={`tel:${me?.phone?.replace(/\D/g, '')}`} divider />
        </Card>
      </View>

      {/* Settings */}
      <View style={{ paddingHorizontal: 18, paddingTop: 24 }}>
        <SectionLabel>Account</SectionLabel>
        <Card style={{ marginTop: 12, padding: 0, overflow: 'hidden' }}>
          <NavRow icon="profile" label="Edit profile" sub="Name, tile, contact" onPress={() => router.push('/edit-profile')} />
          {!V.isAdmin && (
            <NavRow icon="clock" label="Availability"
              sub={`Week by week \u00B7 ${weeksAnsweredCount(db, V.uid)} of ${seasonWeeks(db).length} weeks set`}
              onPress={() => router.push('/availability')}
              divider />
          )}
          <NavRow icon="book" label="Rules & About ALMA"
            sub={V.can.captainDocs ? 'Library, handbook, code of conduct' : 'Library, code of conduct'}
            onPress={() => router.push('/(tabs)/resources')}
            divider />
        </Card>
      </View>

      {/* Dev role switcher */}
      <View style={{ paddingHorizontal: 18, paddingTop: 24 }}>
        <SectionLabel>Dev Tools</SectionLabel>
        <RoleSwitcher />
      </View>

      <View style={{ paddingTop: 20, alignItems: 'center' }}>
        <TouchableOpacity onPress={() => app.signOut()}>
          <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 12, color: T.inkMute, letterSpacing: 1, textTransform: 'uppercase' }}>
            Sign out
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function RoleSwitcher() {
  const T = useTheme();
  const router = useRouter();
  const { role, app, db } = useApp();
  const roles = [
    { id: 'captain', label: 'Captain', who: db.PEOPLE[db.CAPTAIN_USER]?.name },
    { id: 'player',  label: 'Player',  who: db.PEOPLE[db.PLAYER_USER]?.name },
    { id: 'admin',   label: 'Admin',   who: db.PEOPLE[db.ADMIN_USER]?.name },
  ];

  return (
    <Card style={{ marginTop: 12, padding: 12, gap: 8 }}>
      <Eyebrow>Viewing as</Eyebrow>
      {roles.map(r => {
        const on = r.id === role;
        return (
          <TouchableOpacity key={r.id} onPress={() => app.setRole(r.id)}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              padding: 10, borderRadius: 10,
              backgroundColor: on ? T.brand : T.surface,
              borderWidth: 1, borderColor: on ? T.brand : T.border,
            }}>
            <View>
              <Text style={{ fontFamily: ALMA_FONTS.uiSemiBold, fontSize: 13, color: on ? T.inkOnDeep : T.ink }}>{r.label}</Text>
              <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 10, color: on ? 'rgba(239,234,217,0.7)' : T.inkSoft, marginTop: 1 }}>{r.who}</Text>
            </View>
            {on && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: T.inkOnDeep }} />}
          </TouchableOpacity>
        );
      })}

      <View style={{ height: 1, backgroundColor: T.border, marginVertical: 4 }} />
      <Eyebrow>Flows</Eyebrow>
      <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}
        style={{ padding: 10, borderRadius: 10, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border }}>
        <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 12, color: T.ink }}>Welcome / Sign-in screen</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}
        style={{ padding: 10, borderRadius: 10, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border }}>
        <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 12, color: T.ink }}>Sign-up flow</Text>
      </TouchableOpacity>

      <View style={{ height: 1, backgroundColor: T.border, marginVertical: 4 }} />
      <Eyebrow>Season phases</Eyebrow>
      <TouchableOpacity onPress={() => router.push('/preseason')}
        style={{ padding: 10, borderRadius: 10, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border }}>
        <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 12, color: T.ink }}>Preseason</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/season-over')}
        style={{ padding: 10, borderRadius: 10, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border }}>
        <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 12, color: T.ink }}>Season over</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/champion')}
        style={{ padding: 10, borderRadius: 10, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border }}>
        <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 12, color: T.ink }}>Champion celebration</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/admin')}
        style={{ padding: 10, borderRadius: 10, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border }}>
        <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 12, color: T.ink }}>Admin console</Text>
      </TouchableOpacity>
    </Card>
  );
}
