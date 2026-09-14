import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, ALMA_FONTS } from '../../lib/theme';
import { useApp } from '../../lib/AppContext';
import { captainIdsOf, isCaptainOf } from '../../lib/roles';
import { slotAvailabilityOf, weeklySlots, weekSlotId, slotLabel, slotHours, seasonWeeks } from '../../lib/availability';
import { Header } from '../../components/Header';
import { SectionLabel } from '../../components/SectionLabel';
import { ContactRow } from '../../components/ContactRow';
import { Card, Eyebrow, DisplayCaps, SerifTitle, Chip, Avatar, TileFace, TILE_BY_ID, ALMA_TILES, Watercolor, Icon, Button } from '../../components/ui';

export default function TeamScreen() {
  const T = useTheme();
  const insets = useSafeAreaInsets();
  const { db, viewer: V } = useApp();
  const me = V.me;
  const myTeam = V.team || db.TEAMS[0];

  if (!me || !myTeam) {
    return (
      <View style={{ flex: 1, backgroundColor: T.appBg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={T.brand} />
      </View>
    );
  }

  const div = db.DIVISIONS.find(d => d.id === myTeam.divisionId);
  const captainIds = captainIdsOf(myTeam);
  const captains = captainIds.map(uid => db.PEOPLE[uid]).filter(Boolean);
  const roster = myTeam.roster.map(uid => db.PEOPLE[uid]).filter(Boolean);
  const others = roster.filter(p => !captainIds.includes(p.id));
  const crest = myTeam.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const [shareOpen, setShareOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View style={{ flex: 1, backgroundColor: T.appBg }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 120 }}>
        <Header
          eyebrow={`${myTeam.shortName} \u00B7 ${div?.name || 'Atlanta League'}`}
          title={myTeam.name} italic large
          action={!V.can.invitePlayers ? <Chip variant="default"><Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 10, letterSpacing: 1.6, color: T.ink }}>{V.def.chip}</Text></Chip> : undefined}
        />

        {/* Crest + stats */}
        <View style={{ paddingHorizontal: 18 }}>
          <Card style={{ padding: 18, flexDirection: 'row', gap: 16, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
            <Watercolor corner="tr" size={180} intensity={0.5} />
            <View style={{
              width: 76, height: 76, borderRadius: 999, backgroundColor: T.surfaceTint,
              alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: T.borderStrong,
            }}>
              <DisplayCaps size={22}>{crest}</DisplayCaps>
            </View>
            <View style={{ flex: 1, position: 'relative' }}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <StatBox label="Season pts" value={myTeam.points.toLocaleString()} />
                <StatBox label="Roster" value={String(roster.length)} />
              </View>
            </View>
          </Card>
        </View>

        {/* Roster */}
        <View style={{ paddingHorizontal: 18, paddingTop: 24 }}>
          <SectionLabel action={<Chip variant="default"><Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 10, letterSpacing: 1.6, color: T.ink }}>{roster.length} players</Text></Chip>}>
            Roster
          </SectionLabel>
          <Card style={{ marginTop: 12, padding: 0, overflow: 'hidden' }}>
            {captains.map((c, i) => (
              <RosterRow key={c.id} p={c} captain you={c.id === me?.id} divider={i > 0 || true} first={i === 0} onPress={() => setSelected(c.id)} />
            ))}
            {others.map((p, i) => (
              <RosterRow key={p.id} p={p} you={p.id === me?.id} divider first={false} onPress={() => setSelected(p.id)} />
            ))}
            {V.can.invitePlayers && (
              <TouchableOpacity onPress={() => setShareOpen(true)} style={{
                flexDirection: 'row', alignItems: 'center', gap: 10,
                paddingVertical: 14, paddingHorizontal: 16, backgroundColor: T.surfaceAlt,
                borderTopWidth: 1, borderTopColor: T.border,
              }}>
                <Icon name="plus" size={16} color={T.inkSoft} />
                <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 13, letterSpacing: 0.4, color: T.inkSoft }}>Invite a player</Text>
              </TouchableOpacity>
            )}
          </Card>
        </View>

        {/* Player's captain card */}
        {!V.can.invitePlayers && (
          <View style={{ paddingHorizontal: 18, paddingTop: 16, gap: 10 }}>
            {captains.map((c, i) => (
              <Card key={c.id} variant="tinted" style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Avatar initials={c.initials} tile={c.tile} size={40} tint={c.tint} />
                <View style={{ flex: 1 }}>
                  <Eyebrow>{captains.length > 1 ? (i === 0 ? 'Your captain' : 'Your co-captain') : 'Your captain'}</Eyebrow>
                  <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: 15, color: T.ink, marginTop: 2 }}>{c.name}</Text>
                </View>
                <Button variant="ghost" size="sm" onPress={() => setSelected(c.id)}>
                  <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 12, color: T.ink }}>Contact</Text>
                </Button>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {shareOpen && <ShareModal team={myTeam} code={(db.TEAM_CODES || {})[myTeam.id]} onClose={() => setShareOpen(false)} />}
      {selected && <PlayerModal db={db} uid={selected} team={myTeam} onClose={() => setSelected(null)} />}
    </View>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  const T = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: 20, color: T.ink }}>{value}</Text>
      <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: T.inkSoft, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function RosterRow({ p, captain, you, divider, first, onPress }: { p: any; captain?: boolean; you?: boolean; divider?: boolean; first?: boolean; onPress: () => void }) {
  const T = useTheme();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingVertical: 12, paddingHorizontal: 16,
      borderTopWidth: first ? 0 : 1, borderTopColor: T.border,
    }}>
      <Avatar initials={p.initials} tile={p.tile} size={40} tint={p.tint} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: 15, color: T.ink }}>{p.name}</Text>
          {captain && <Chip variant="accent"><Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 8, letterSpacing: 1.2, color: '#6E4234' }}>Captain</Text></Chip>}
          {you && <Chip variant="default"><Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 8, letterSpacing: 1.2, color: T.ink }}>You</Text></Chip>}
        </View>
        <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 11, color: T.inkSoft, marginTop: 2 }}>{p.email}</Text>
      </View>
      <Icon name="chevronRight" size={16} color={T.inkSoft} />
    </TouchableOpacity>
  );
}

function PlayerModal({ db, uid, team, onClose }: { db: any; uid: string; team: any; onClose: () => void }) {
  const T = useTheme();
  const p = db.PEOPLE[uid];
  if (!p) return null;
  const capIds = captainIdsOf(team);
  const isCap = capIds.includes(uid);
  const weeks = seasonWeeks(db);
  const [wk, setWk] = useState(db.SEASON?.currentWeek || 1);
  const mine = slotAvailabilityOf(db, uid);
  const slots = weeklySlots(db);

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(15,34,48,0.55)', justifyContent: 'flex-end' }}>
        <TouchableOpacity activeOpacity={1} onPress={() => {}} style={{
          backgroundColor: T.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
          paddingHorizontal: 22, paddingTop: 20, paddingBottom: 100, maxHeight: '85%',
        }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ width: 36, height: 4, borderRadius: 999, backgroundColor: T.borderStrong, alignSelf: 'center', marginBottom: 20 }} />
            <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center', position: 'relative' }}>
              <Watercolor corner="tr" size={180} intensity={0.5} />
              <TileFace tile={p.tile} size={58} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: 22, color: T.ink }}>{p.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  {isCap && <Chip variant="accent"><Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 8, letterSpacing: 1.2, color: '#6E4234' }}>Captain</Text></Chip>}
                  <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 12, color: T.inkSoft }}>{team.name}</Text>
                </View>
                <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: T.inkMute, marginTop: 5 }}>
                  {(TILE_BY_ID[p.tile] || ALMA_TILES[0]).name}
                </Text>
              </View>
            </View>

            {/* Week selector */}
            <View style={{ marginTop: 18 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                <TouchableOpacity disabled={wk <= weeks[0]} onPress={() => setWk(w => Math.max(weeks[0], w - 1))}
                  style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: T.border, alignItems: 'center', justifyContent: 'center', opacity: wk <= weeks[0] ? 0.35 : 1 }}>
                  <Icon name="chevronLeft" size={14} color={T.inkSoft} />
                </TouchableOpacity>
                <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 9.5, letterSpacing: 2, textTransform: 'uppercase', color: T.inkSoft }}>
                  Week {wk} availability
                </Text>
                <TouchableOpacity disabled={wk >= weeks[weeks.length - 1]} onPress={() => setWk(w => Math.min(weeks[weeks.length - 1], w + 1))}
                  style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: T.border, alignItems: 'center', justifyContent: 'center', opacity: wk >= weeks[weeks.length - 1] ? 0.35 : 1 }}>
                  <Icon name="chevronRight" size={14} color={T.inkSoft} />
                </TouchableOpacity>
              </View>

              <Card style={{ padding: 0, overflow: 'hidden', marginBottom: 12 }}>
                {slots.map((s, i) => {
                  const v = mine[weekSlotId(wk, s.id)];
                  return (
                    <View key={s.id} style={{
                      flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, paddingHorizontal: 14,
                      borderTopWidth: i ? 1 : 0, borderTopColor: T.border,
                    }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: 14.5, color: T.ink }}>{slotLabel(s)}</Text>
                        <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 10.5, color: T.inkMute, marginTop: 2 }}>{slotHours(s)}</Text>
                      </View>
                      <View style={{
                        paddingVertical: 5, paddingHorizontal: 10, borderRadius: 999,
                        backgroundColor: v === 'yes' ? 'rgba(141,168,154,0.26)' : v === 'no' ? 'rgba(160,82,74,0.14)' : T.surfaceAlt,
                      }}>
                        <Text style={{
                          fontFamily: ALMA_FONTS.ui, fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase',
                          color: v === 'yes' ? '#3F564B' : v === 'no' ? '#A0524A' : T.inkMute,
                        }}>{v === 'yes' ? 'Free' : v === 'no' ? 'Busy' : 'No answer'}</Text>
                      </View>
                    </View>
                  );
                })}
              </Card>

              <Card style={{ padding: 0, overflow: 'hidden' }}>
                <ContactRow icon="mail" label="Email" value={p.email} href={`mailto:${p.email}`} />
                <ContactRow icon="phone" label="Mobile" value={p.phone} href={`tel:${p.phone.replace(/\D/g, '')}`} divider />
              </Card>
            </View>

            <View style={{ marginTop: 12 }}>
              <Button variant="secondary" fullWidth onPress={onClose}>
                <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 14, color: T.ink }}>Close</Text>
              </Button>
            </View>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

function ShareModal({ team, code, onClose }: { team: any; code?: string; onClose: () => void }) {
  const T = useTheme();
  const password = code || 'MAHJ-4471';

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(15,34,48,0.55)', justifyContent: 'flex-end' }}>
        <TouchableOpacity activeOpacity={1} onPress={() => {}} style={{
          backgroundColor: T.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
          paddingHorizontal: 22, paddingTop: 20, paddingBottom: 100,
        }}>
          <View style={{ width: 36, height: 4, borderRadius: 999, backgroundColor: T.borderStrong, alignSelf: 'center', marginBottom: 18 }} />
          <Eyebrow>Invite a player</Eyebrow>
          <SerifTitle size={22} italic style={{ marginTop: 8 }}>Send this to your roster.</SerifTitle>
          <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: 14, color: T.inkSoft, marginTop: 6, lineHeight: 21 }}>
            They'll tap the link and join {team.name} after entering this code. It works until your roster is full.
          </Text>

          <View style={{
            marginTop: 16, padding: 16, backgroundColor: T.surfaceAlt,
            borderWidth: 1, borderColor: T.border, borderRadius: 14,
            flexDirection: 'row', alignItems: 'center', gap: 12,
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: T.inkSoft }}>Team code</Text>
              <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: 24, letterSpacing: 2, color: T.ink, marginTop: 4 }}>{password}</Text>
            </View>
            <TouchableOpacity style={{
              backgroundColor: T.surface, borderWidth: 1, borderColor: T.borderStrong,
              borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12,
              flexDirection: 'row', alignItems: 'center', gap: 4,
            }}>
              <Icon name="copy" size={12} color={T.ink} />
              <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 11, letterSpacing: 0.8, color: T.ink }}>Copy</Text>
            </TouchableOpacity>
          </View>

          <View style={{ gap: 8, marginTop: 14 }}>
            <Button variant="primary" fullWidth>
              <Icon name="share" size={14} color={T.inkOnDeep} />
              <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 14, color: T.inkOnDeep }}>Share via text</Text>
            </Button>
            <Button variant="ghost" fullWidth onPress={onClose}>
              <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 14, color: T.ink }}>Done</Text>
            </Button>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
