import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme, ALMA_FONTS , fs } from '../lib/theme';
import { useApp } from '../lib/AppContext';
import { Header } from '../components/Header';
import { SectionLabel } from '../components/SectionLabel';
import { Field } from '../components/Field';
import { Card, Eyebrow, TileFace, ALMA_TILES, TILE_BY_ID, Watercolor, Button } from '../components/ui';

function formatPhone(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 10);
  if (d.length < 10) return v;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export default function EditProfileScreen() {
  const T = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { db, viewer: V, app } = useApp();
  const me = db.PEOPLE[db.CURRENT_USER];

  const [form, setForm] = useState({
    name: me?.name || '',
    email: me?.email || '',
    phone: me?.phone || '',
    tile: me?.tile || 'plum',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const dirty = form.name !== me?.name || form.email !== me?.email
             || form.phone !== me?.phone || form.tile !== me?.tile;

  const save = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'A name is required.';
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(form.email.trim())) e.email = 'Enter a valid email address.';
    if (form.phone.replace(/\D/g, '').length < 10) e.phone = 'Enter a 10-digit mobile number.';
    setErrors(e);
    if (Object.keys(e).length) return;

    app.updateProfile({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: formatPhone(form.phone),
      tile: form.tile,
      initials: form.name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    });
    router.back();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: T.appBg }} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 140 }}>
      <Header
        eyebrow="Account"
        title="Edit profile"
        large
        action={
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(11), letterSpacing: 1.2, textTransform: 'uppercase', color: T.inkSoft }}>
              Cancel
            </Text>
          </TouchableOpacity>
        }
      />

      {/* Tile picker */}
      <View style={{ paddingHorizontal: 18 }}>
        <Card style={{ padding: 18, position: 'relative', overflow: 'hidden' }}>
          <Watercolor corner="tr" size={170} intensity={0.5} />
          <View style={{ position: 'relative', flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <TileFace tile={form.tile} size={54} />
            <View style={{ flex: 1 }}>
              <Eyebrow>Your tile</Eyebrow>
              <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: fs(15), color: T.ink, marginTop: 3 }}>
                {(TILE_BY_ID[form.tile] || ALMA_TILES[0]).name}
              </Text>
            </View>
          </View>
          <View style={{
            position: 'relative', marginTop: 16,
            flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center',
          }}>
            {ALMA_TILES.map(tl => (
              <TouchableOpacity key={tl.id} onPress={() => set('tile', tl.id)} style={{ alignItems: 'center', gap: 5 }}>
                <TileFace tile={tl.id} size={46} selected={tl.id === form.tile} />
                <Text style={{
                  fontFamily: ALMA_FONTS.ui, fontSize: fs(9), letterSpacing: 0.8,
                  textTransform: 'uppercase', textAlign: 'center',
                  color: tl.id === form.tile ? T.ink : T.inkMute,
                }}>{tl.short}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      </View>

      {/* Contact fields */}
      <View style={{ paddingHorizontal: 18, paddingTop: 22 }}>
        <SectionLabel>Contact</SectionLabel>
        <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(11), color: T.inkSoft, marginTop: 8, lineHeight: 17 }}>
          Visible to your captain and teammates so they can reach you about tables.
        </Text>
        <View style={{ marginTop: 14, gap: 14 }}>
          <Field label="Full name" required value={form.name} onChange={v => set('name', v)} hint={errors.name} error={!!errors.name} />
          <Field label="Email" type="email" required value={form.email} onChange={v => set('email', v)} hint={errors.email} error={!!errors.email} />
          <Field label="Mobile phone" required value={form.phone} onChange={v => set('phone', v)} hint={errors.phone || 'Used for match reminders.'} error={!!errors.phone} />
        </View>
      </View>

      {/* Save */}
      <View style={{ paddingHorizontal: 18, paddingTop: 22, gap: 8 }}>
        <Button variant="primary" fullWidth disabled={!dirty} onPress={save}>
          <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.inkOnDeep }}>Save changes</Text>
        </Button>
        <Button variant="ghost" fullWidth onPress={() => router.back()}>
          <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.ink }}>Back to profile</Text>
        </Button>
      </View>
    </ScrollView>
  );
}
