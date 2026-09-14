import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme, ALMA_FONTS } from '../lib/theme';
import { useApp } from '../lib/AppContext';
import { isCaptainOf } from '../lib/roles';
import { weeklySlots, weekSlotId, slotAvailabilityOf, slotLabel, slotHours } from '../lib/availability';
import { Header } from '../components/Header';
import { WeekStrip } from '../components/WeekStrip';
import { SectionLabel } from '../components/SectionLabel';
import { Card, Eyebrow, SerifTitle, Chip, Avatar, Icon, Button } from '../components/ui';

export default function PairingsScreen() {
  const T = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ week?: string }>();
  const router = useRouter();
  const { db, viewer: V, app } = useApp();

  const myTeam = V.team || db.TEAMS[0];

  if (!myTeam) {
    return (
      <View style={{ flex: 1, backgroundColor: T.appBg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={T.brand} />
      </View>
    );
  }

  const isCaptain = !!V.can.manageRoster;
  const [week, setWeek] = useState(params.week ? Number(params.week) : db.SEASON.currentWeek);
  const [picked, setPicked] = useState<string | null>(null);
  const [peek, setPeek] = useState<string | null>(null);

  const matches = db.MATCHES
    .filter(m => m.week === week && (m.home === myTeam.id || m.away === myTeam.id))
    .sort((a, b) => a.table - b.table);
  const sideOf = (m: typeof matches[0]) => (m.home === myTeam.id ? 'home' : 'away');
  const opp = matches.length ? db.TEAMS.find(t => t.id === (matches[0].home === myTeam.id ? matches[0].away : matches[0].home)) : null;

  const seatOf: Record<string, { matchId: string; seatIdx: number; table: number }> = {};
  matches.forEach(m => (m.seats[sideOf(m)] || []).forEach((uid, i) => { if (uid) seatOf[uid] = { matchId: m.id, seatIdx: i, table: m.table }; }));
  const iHost = matches.length ? matches[0].home === myTeam.id : true;
  const SUBS = db.SUBSTITUTES || [];
  const awayRoster = ((db.SEASON.awayRoster || {})[week]) || [];
  const eligible = iHost ? myTeam.roster : awayRoster;
  const bench = [...eligible.filter(uid => !seatOf[uid]), ...SUBS.filter(uid => !seatOf[uid])];
  const mySeat = seatOf[V.uid] || null;
  const iAmEligible = iHost ? myTeam.roster.includes(V.uid) : awayRoster.includes(V.uid);

  const seat = (uid: string, matchId: string, seatIdx: number) => {
    app.assignSeat({ week, teamId: myTeam.id, matchId, seatIdx, uid });
    setPicked(null);
  };
  const unseat = (matchId: string, seatIdx: number) => {
    app.assignSeat({ week, teamId: myTeam.id, matchId, seatIdx, uid: null });
    setPicked(null);
  };
  const join = (m: typeof matches[0]) => {
    const seats = [0, 1].map(i => (m.seats[sideOf(m)] || [])[i] || null);
    const free = seats.indexOf(null);
    if (free >= 0) seat(V.uid, m.id, free);
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.appBg }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 130 }}>
        <Header
          eyebrow={`${db.SEASON.name} \u00B7 Open tables`}
          title={`Week ${week}`}
          back="Schedule"
          onBack={() => router.back()}
          large
          action={<Chip variant={mySeat ? 'success' : 'warn'}>
            <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 10, letterSpacing: 1.6, color: mySeat ? '#466357' : '#7E6537' }}>
              {mySeat ? `Match ${mySeat.table}` : 'No table yet'}
            </Text>
          </Chip>}
        />

        <View style={{ paddingHorizontal: 18 }}>
          <WeekStrip db={db} week={week} onChange={w => { setWeek(w); setPicked(null); }} />
        </View>

        {!matches.length ? (
          <View style={{ paddingHorizontal: 18, paddingTop: 18 }}>
            <Card variant="quiet" style={{ padding: 22, alignItems: 'center' }}>
              <SerifTitle size={15} italic color={T.inkSoft}>Tables for Week {week} have not opened yet.</SerifTitle>
            </Card>
          </View>
        ) : (
          <>
            {/* Info card */}
            <View style={{ paddingHorizontal: 18, paddingTop: 16 }}>
              <Card variant="quiet" style={{ padding: 14, flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                <Icon name="info" size={18} color={T.inkSoft} />
                <Text style={{ flex: 1, fontFamily: ALMA_FONTS.serif, fontSize: 13.5, color: T.inkSoft, lineHeight: 20 }}>
                  Four tables against <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, color: T.ink }}>{opp?.shortName}</Text>, two players a side. Tap anyone already seated to see her availability, then take a seat.
                </Text>
              </Card>
            </View>

            {/* Captain bench */}
            {isCaptain && (
              <View style={{ paddingHorizontal: 18, paddingTop: 18 }}>
                <SectionLabel action={
                  <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: T.inkMute }}>Captain</Text>
                }>{iHost ? 'Not yet seated' : 'Cleared but not seated'}</SectionLabel>
                <Card variant="quiet" style={{ marginTop: 12, padding: 12 }}>
                  {bench.length ? (
                    <>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {bench.map(uid => {
                          const p = db.PEOPLE[uid];
                          if (!p) return null;
                          const on = picked === uid;
                          return (
                            <TouchableOpacity key={uid} onPress={() => setPicked(on ? null : uid)} activeOpacity={0.7}
                              style={{
                                flexDirection: 'row', alignItems: 'center', gap: 8,
                                paddingVertical: 7, paddingHorizontal: 10, paddingLeft: 7, borderRadius: 999,
                                backgroundColor: on ? T.brand : T.surface,
                                borderWidth: 1, borderColor: on ? T.brand : T.border,
                              }}>
                              <Avatar initials={p.initials} tile={p.tile} size={26} tint={p.tint} />
                              <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: 13.5, color: on ? T.inkOnDeep : T.ink }}>
                                {p.name.split(' ')[0]} {p.name.split(' ').slice(-1)[0][0]}.
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                      <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 10.5, color: T.inkMute, marginTop: 10, lineHeight: 16 }}>
                        {picked ? 'Now tap an open seat below.' : 'Tap a player to seat her yourself.'}
                      </Text>
                    </>
                  ) : (
                    <Text style={{ fontFamily: ALMA_FONTS.serifItalic, fontSize: 14, color: T.inkSoft, padding: 6 }}>Everyone is seated.</Text>
                  )}
                </Card>
              </View>
            )}

            {/* Table cards */}
            <View style={{ paddingHorizontal: 18, paddingTop: 20, gap: 12 }}>
              {matches.map(m => {
                const side = sideOf(m);
                const otherSide = side === 'home' ? 'away' : 'home';
                const mySeats = [0, 1].map(i => (m.seats[side] || [])[i] || null);
                const theirSeats = [0, 1].map(i => (m.seats[otherSide] || [])[i] || null);
                const locked = m.status === 'final';
                const imHere = mySeats.includes(V.uid);
                const openSeats = mySeats.filter(s => !s).length;
                const canJoin = !locked && !imHere && !mySeat && openSeats > 0 && iAmEligible;
                const homeTeam = m.home === myTeam.id ? myTeam : opp;

                return (
                  <Card key={m.id} style={{
                    padding: 14, opacity: locked ? 0.72 : 1,
                    borderColor: imHere ? T.brand : undefined,
                    borderWidth: imHere ? 1 : undefined,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: T.ink }}>
                        Match {m.table}
                      </Text>
                      <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 10.5, letterSpacing: 1, textTransform: 'uppercase', color: T.inkSoft }}>
                        {locked ? 'Score logged' : `${homeTeam?.shortName} host${m.home === myTeam.id ? ' (you)' : 's'}`}
                      </Text>
                    </View>

                    {/* My side */}
                    <View style={{ marginTop: 12 }}>
                      <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: T.ink, marginBottom: 6 }}>
                        {myTeam.shortName}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 10 }}>
                        {mySeats.map((uid, i) => (
                          <SeatSlot key={i} db={db} uid={uid} you={uid === V.uid}
                            active={!!picked && !locked && isCaptain}
                            onPeek={() => uid && setPeek(uid)}
                            onTake={() => {
                              if (locked) return;
                              if (picked && isCaptain) return seat(picked, m.id, i);
                              if (!mySeat && iAmEligible) return seat(V.uid, m.id, i);
                            }}
                            onClear={!locked && uid && (uid === V.uid || isCaptain) ? () => unseat(m.id, i) : undefined} />
                        ))}
                      </View>
                    </View>

                    {/* Their side */}
                    <View style={{ marginTop: 12 }}>
                      <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: T.inkMute, marginBottom: 6 }}>
                        {opp?.shortName}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 10 }}>
                        {theirSeats.map((uid, i) => (
                          <SeatSlot key={i} db={db} uid={uid} readOnly onPeek={() => uid && setPeek(uid)} />
                        ))}
                      </View>
                    </View>

                    {/* Footer: join/leave */}
                    {!locked && (
                      <View style={{ marginTop: 12, paddingTop: 11, borderTopWidth: 1, borderTopColor: T.border, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={{ flex: 1 }} />
                        {canJoin && (
                          <Button variant="primary" size="sm" onPress={() => join(m)}>
                            <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 12, color: T.inkOnDeep }}>Take a seat</Text>
                          </Button>
                        )}
                        {imHere && (
                          <Button variant="secondary" size="sm" onPress={() => unseat(m.id, mySeats.indexOf(V.uid))}>
                            <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 12, color: T.ink }}>Leave</Text>
                          </Button>
                        )}
                      </View>
                    )}
                  </Card>
                );
              })}
            </View>

            {/* Done */}
            <View style={{ paddingHorizontal: 18, paddingTop: 20 }}>
              <Button variant="primary" fullWidth onPress={() => router.back()}>
                <Icon name="check" size={16} color={T.inkOnDeep} />
                <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 14, color: T.inkOnDeep }}>Done</Text>
              </Button>
              <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 11, color: T.inkMute, textAlign: 'center', marginTop: 10, lineHeight: 17 }}>
                Seats save as you take them. Once your table is full, reach out to the other pair.
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Player peek sheet */}
      {peek && <PlayerPeek db={db} uid={peek} week={week} onClose={() => setPeek(null)} />}
    </View>
  );
}

function SeatSlot({ db, uid, you, active, readOnly, onPeek, onTake, onClear }: {
  db: any; uid: string | null; you?: boolean; active?: boolean; readOnly?: boolean;
  onPeek?: () => void; onTake?: () => void; onClear?: () => void;
}) {
  const T = useTheme();
  const p = uid ? db.PEOPLE[uid] : null;

  return (
    <TouchableOpacity
      onPress={() => (p ? onPeek?.() : !readOnly && onTake?.())}
      activeOpacity={0.7}
      style={{
        flex: 1, position: 'relative',
        backgroundColor: you ? T.surfaceTint : p ? T.surface : T.surfaceAlt,
        borderWidth: 1,
        borderStyle: p ? 'solid' : 'dashed',
        borderColor: you ? T.brand : active && !p ? T.brand : p ? T.border : T.borderStrong,
        borderRadius: 14, padding: 12, minHeight: 96,
        alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
      {p ? (
        <>
          <Avatar initials={p.initials} tile={p.tile} size={38} tint={p.tint} />
          <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: 12.5, color: T.ink, textAlign: 'center', lineHeight: 16 }}>
            {p.name.split(' ')[0]}{'\n'}{p.name.split(' ').slice(1).join(' ')}
          </Text>
          {you && <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 8.5, letterSpacing: 1.6, textTransform: 'uppercase', color: T.brand }}>You</Text>}
          {onClear && (
            <TouchableOpacity onPress={(e) => { e.stopPropagation?.(); onClear(); }}
              style={{
                position: 'absolute', top: 5, right: 5, width: 20, height: 20, borderRadius: 999,
                backgroundColor: T.surfaceAlt, borderWidth: 1, borderColor: T.border,
                alignItems: 'center', justifyContent: 'center',
              }}>
              <Icon name="x" size={11} color={T.inkSoft} />
            </TouchableOpacity>
          )}
        </>
      ) : (
        <>
          <Icon name={readOnly ? 'clock' : 'plus'} size={18} color={active ? T.brand : T.inkMute} />
          <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 9.5, letterSpacing: 1.6, textTransform: 'uppercase', color: active ? T.brand : T.inkMute, textAlign: 'center' }}>
            {readOnly ? 'Open' : active ? 'Seat here' : 'Open seat'}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

function PlayerPeek({ db, uid, week, onClose }: { db: any; uid: string; week: number; onClose: () => void }) {
  const T = useTheme();
  const p = db.PEOPLE[uid];
  if (!p) return null;
  const mine = slotAvailabilityOf(db, uid);
  const yes = weeklySlots(db).filter(s => mine[weekSlotId(week, s.id)] === 'yes');

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(15,34,48,0.55)', justifyContent: 'flex-end' }}>
        <TouchableOpacity activeOpacity={1} onPress={() => {}} style={{
          backgroundColor: T.surface, borderTopLeftRadius: 22, borderTopRightRadius: 22,
          paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, maxHeight: '82%',
        }}>
          <View style={{ width: 38, height: 4, borderRadius: 999, backgroundColor: T.borderStrong, alignSelf: 'center', marginBottom: 18 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Avatar initials={p.initials} tile={p.tile} size={52} tint={p.tint} />
            <View style={{ flex: 1 }}>
              <SerifTitle size={20}>{p.name}</SerifTitle>
              <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 11, color: T.inkSoft, marginTop: 2 }}>
                {(db.TEAMS.find((t: any) => t.roster.includes(uid)) || {}).name || 'League member'}
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 18 }}>
            <Eyebrow>Free in Week {week}</Eyebrow>
            <View style={{ marginTop: 8, gap: 6 }}>
              {yes.length ? yes.map(s => (
                <View key={s.id} style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                  <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: 15, color: T.ink }}>{slotLabel(s)}</Text>
                  <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 11, color: T.inkSoft }}>{slotHours(s)}</Text>
                </View>
              )) : (
                <Text style={{ fontFamily: ALMA_FONTS.serifItalic, fontSize: 14, color: T.inkSoft }}>
                  She hasn't marked any window open this week.
                </Text>
              )}
            </View>
          </View>

          <View style={{ marginTop: 20 }}>
            <Eyebrow>Reach her</Eyebrow>
            <View style={{ marginTop: 8, gap: 8 }}>
              {p.phone ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Icon name="phone" size={15} color={T.inkSoft} />
                  <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 13, color: T.ink }}>{p.phone}</Text>
                </View>
              ) : null}
              {p.email ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Icon name="mail" size={15} color={T.inkSoft} />
                  <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 13, color: T.ink }}>{p.email}</Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={{ marginTop: 22 }}>
            <Button variant="secondary" fullWidth onPress={onClose}>
              <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 14, color: T.ink }}>Close</Text>
            </Button>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
