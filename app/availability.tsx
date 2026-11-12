import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme, ALMA_FONTS , fs } from '../lib/theme';
import { useApp } from '../lib/AppContext';
import {
  weeklySlots, weekSlotId, seasonWeeks,
  slotAvailabilityOf, weekAnswerCount, weeksAnsweredCount,
  slotLabel, slotHours, weekPlayDatesLabel,
} from '../lib/availability';
import { Header } from '../components/Header';
import { SectionLabel } from '../components/SectionLabel';
import { Card, Eyebrow, Chip, Icon, Button } from '../components/ui';

export default function AvailabilityScreen() {
  const T = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { db, viewer: V, app } = useApp();

  const published = !!(db.SEASON && db.SEASON.published);
  const weeks = seasonWeeks(db);
  const [week, setWeek] = useState(db.SEASON.currentWeek || 1);
  const slots = published ? weeklySlots(db) : [];
  const mine = slotAvailabilityOf(db, V.uid);
  const answered = slots.filter(s => mine[weekSlotId(week, s.id)]).length;
  const complete = slots.length > 0 && answered === slots.length;
  const weeksDone = weeksAnsweredCount(db, V.uid);

  const copyToRest = () => {
    weeks.filter(w => w > week).forEach(w => {
      slots.forEach(s => {
        const v = mine[weekSlotId(week, s.id)];
        if (v) app.setSlotAvailability(V.uid, weekSlotId(w, s.id), v);
      });
    });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: T.appBg }} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 130 }}>
      <Header
        eyebrow={`${db.SEASON.name} \u00B7 Account`}
        title="Availability"
        back="Profile"
        onBack={() => router.back()}
        large
        action={
          <Chip variant={weeksDone === weeks.length ? 'success' : 'info'}>
            <Text style={{
              fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(10), letterSpacing: 1.6,
              color: weeksDone === weeks.length ? '#466357' : '#355367',
            }}>{weeksDone}/{weeks.length} weeks</Text>
          </Chip>
        }
      />

      {!published ? (
        <View style={{ paddingHorizontal: 18, paddingTop: 4 }}>
          <Card variant="quiet" style={{ padding: 16, flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <Icon name="clock" size={18} color={T.inkSoft} />
            <Text style={{ flex: 1, fontFamily: ALMA_FONTS.serif, fontSize: fs(14), color: T.inkSoft, lineHeight: 21 }}>
              The league is still setting the calendar. Your weekly time slots appear here the moment it's published.
            </Text>
          </Card>
        </View>
      ) : (
        <View>
          {/* Week selector with completion dots */}
          <View style={{ paddingHorizontal: 18 }}>
            <View style={{ flexDirection: 'row', gap: 6, paddingTop: 4 }}>
              {weeks.map(w => {
                const on = w === week;
                const { answered: a, total } = weekAnswerCount(db, V.uid, w);
                const done = total > 0 && a === total;
                return (
                  <TouchableOpacity key={w} onPress={() => setWeek(w)} activeOpacity={0.7} style={{
                    flex: 1, paddingTop: 7, paddingBottom: 5, borderRadius: 11,
                    backgroundColor: on ? T.brand : T.surface,
                    borderWidth: 1, borderColor: on ? T.brand : T.border,
                    alignItems: 'center', gap: 3,
                  }}>
                    <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: fs(13), color: on ? T.inkOnDeep : T.ink }}>{w}</Text>
                    {(() => {
                      const dl = weekPlayDatesLabel(db, w);
                      return dl ? <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(7.5), color: on ? 'rgba(239,234,217,0.7)' : T.inkMute }}>{dl}</Text> : null;
                    })()}
                    <View style={{
                      width: 5, height: 5, borderRadius: 999,
                      backgroundColor: done
                        ? (on ? T.inkOnDeep : T.brand)
                        : (on ? 'rgba(239,234,217,0.35)' : T.borderStrong),
                    }} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Slots for selected week */}
          <View style={{ paddingHorizontal: 18, paddingTop: 18 }}>
            <SectionLabel action={
              <Text style={{
                fontFamily: ALMA_FONTS.ui, fontSize: fs(10), letterSpacing: 1.2,
                textTransform: 'uppercase',
                color: complete ? T.brand : T.inkMute,
              }}>{answered}/{slots.length} answered</Text>
            }>Week {week}{(() => { const dl = weekPlayDatesLabel(db, week); return dl ? ` · ${dl}` : ''; })()}</SectionLabel>

            <Card style={{ marginTop: 12, padding: 0, overflow: 'hidden' }}>
              {/* Prompt */}
              <View style={{ paddingVertical: 14, paddingHorizontal: 16 }}>
                <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: fs(13.5), color: T.inkSoft, lineHeight: 20 }}>
                  Can you play in each window during Week {week}?
                </Text>
              </View>

              {/* Slot rows */}
              {slots.map(s => (
                <SlotRow key={s.id} slot={s} week={week} mine={mine} V={V} app={app} />
              ))}

              {/* Footer status */}
              <View style={{
                paddingVertical: 11, paddingHorizontal: 16,
                borderTopWidth: 1, borderTopColor: T.border,
                backgroundColor: T.surfaceAlt,
                flexDirection: 'row', alignItems: 'center', gap: 8,
              }}>
                <Icon name={complete ? 'check' : 'info'} size={14} color={complete ? T.brand : T.inkSoft} />
                <Text style={{ fontFamily: ALMA_FONTS.serifItalic, fontSize: fs(13), color: T.inkSoft, flex: 1 }}>
                  {complete ? `Week ${week} is set \u2014 change an answer any time.` : 'Answer every slot so your captains can seat you.'}
                </Text>
              </View>
            </Card>

            {/* Copy to remaining weeks */}
            {week < weeks[weeks.length - 1] && answered > 0 && (
              <View style={{ marginTop: 12 }}>
                <Button variant="secondary" fullWidth onPress={copyToRest}>
                  <Icon name="copy" size={15} color={T.ink} />
                  <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.ink }}>
                    Apply Week {week} to the remaining weeks
                  </Text>
                </Button>
              </View>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function SlotRow({ slot: s, week, mine, V, app }: { slot: any; week: number; mine: Record<string, string>; V: any; app: any }) {
  const T = useTheme();
  const v = mine[weekSlotId(week, s.id)] || null;
  const noteKey = `${weekSlotId(week, s.id)}-note`;
  const savedNote = mine[noteKey] || '';
  const [localNote, setLocalNote] = useState(savedNote);

  // Sync local note when the saved note changes (e.g. week switch)
  React.useEffect(() => { setLocalNote(savedNote); }, [savedNote]);

  return (
    <View style={{
      paddingVertical: 13, paddingHorizontal: 16,
      borderTopWidth: 1, borderTopColor: T.border,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: fs(15), color: T.ink }}>{slotLabel(s)}</Text>
          <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(11), color: T.inkSoft, marginTop: 2 }}>{slotHours(s)}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {[{ key: 'yes', label: 'Yes' }, { key: 'if_needed', label: 'If needed' }, { key: 'no', label: 'No' }].map(o => {
            const on = v === o.key;
            const isIfNeeded = o.key === 'if_needed';
            return (
              <TouchableOpacity key={o.key} activeOpacity={0.7}
                onPress={() => app.setSlotAvailability(V.uid, weekSlotId(week, s.id), on ? null : o.key)}
                style={{
                  minWidth: isIfNeeded ? 78 : 50, paddingVertical: 9, paddingHorizontal: isIfNeeded ? 8 : 12,
                  backgroundColor: on
                    ? (isIfNeeded ? '#C4A44E' : T.brand)
                    : T.surfaceAlt,
                  borderWidth: 1, borderColor: on
                    ? (isIfNeeded ? '#C4A44E' : T.brand)
                    : T.border,
                  borderRadius: 11, alignItems: 'center',
                }}>
                <Text style={{
                  fontFamily: ALMA_FONTS.uiMedium, fontSize: isIfNeeded ? 10.5 : 12, letterSpacing: 0.5,
                  color: on ? T.inkOnDeep : T.inkSoft,
                }}>{o.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}
