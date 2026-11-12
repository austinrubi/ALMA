import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme, ALMA_FONTS , fs } from '../lib/theme';
import { useApp } from '../lib/AppContext';
import { isCaptainOf } from '../lib/roles';
import { weeklySlots, weekSlotId, slotAvailabilityOf, slotLabel, slotHours, weekPlayDatesLabel } from '../lib/availability';
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
  const iAmEligible = iHost
    ? myTeam.roster.includes(V.uid)
    : awayRoster.includes(V.uid);
  const awaySelectionDone = !iHost && awayRoster.length > 0;
  // Away team can only seat once the home team has proposed at least one match
  const matchProposed = matches.some(m => !!m.plan?.when);
  const awayCanSeat = iHost || matchProposed;

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
          eyebrow={`${iHost ? 'Home match' : 'Away match'} \u00B7 Open tables`}
          title={`Week ${week}${(() => { const dl = weekPlayDatesLabel(db, week); return dl ? ` \u00B7 ${dl}` : ''; })()}`}
          back="Schedule"
          onBack={() => router.back()}
          large
          action={<Chip variant={mySeat ? 'success' : 'warn'}>
            <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(10), letterSpacing: 1.6, color: mySeat ? '#466357' : '#7E6537' }}>
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
                <Text style={{ flex: 1, fontFamily: ALMA_FONTS.serif, fontSize: fs(13.5), color: T.inkSoft, lineHeight: 20 }}>
                  {iHost
                    ? <>Three tables vs. <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, color: T.ink }}>{opp?.shortName}</Text>, two players a side. As the home team, your captain places players at each table.</>
                    : <>Three tables @ <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, color: T.ink }}>{opp?.shortName}</Text>, two players a side. Your captain selects who's playing, then you choose your table.</>}
                </Text>
              </Card>
            </View>

            {/* Away: waiting for home team to propose */}
            {!iHost && !matchProposed && (
              <View style={{ paddingHorizontal: 18, paddingTop: 16 }}>
                <Card variant="quiet" style={{ padding: 14, flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                  <Icon name="clock" size={18} color={T.inkSoft} />
                  <Text style={{ flex: 1, fontFamily: ALMA_FONTS.serif, fontSize: fs(13.5), color: T.inkSoft, lineHeight: 20 }}>
                    Waiting for <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, color: T.ink }}>{opp?.shortName}</Text> to propose a date and time. Seating opens once they do.
                  </Text>
                </Card>
              </View>
            )}

            {/* Away captain: select/edit players */}
            {!iHost && isCaptain && (
              <AwayRosterPicker
                db={db} myTeam={myTeam} week={week} app={app}
                existingRoster={awaySelectionDone ? awayRoster : undefined}
              />
            )}

            {/* Captain bench: captain places players (home) or subs (away) */}
            {isCaptain && (() => {
              // Count how many matches each player has been seated in across all weeks
              const matchCounts: Record<string, number> = {};
              for (const m of db.MATCHES) {
                for (const side of ['home', 'away'] as const) {
                  for (const uid of (m.seats[side] || [])) {
                    if (uid) matchCounts[uid] = (matchCounts[uid] || 0) + 1;
                  }
                }
              }
              return (
              <View style={{ paddingHorizontal: 18, paddingTop: 18 }}>
                <SectionLabel action={
                  <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(10), letterSpacing: 1.2, textTransform: 'uppercase', color: T.inkMute }}>Captain</Text>
                }>{iHost ? 'Not yet seated' : 'Substitutes'}</SectionLabel>
                <Card variant="quiet" style={{ marginTop: 12, padding: 12 }}>
                  {(() => {
                    // Home: show full bench (roster + subs). Away: show only subs.
                    const items = iHost ? bench : SUBS.filter((uid: string) => !seatOf[uid]);
                    return items.length ? (
                      <>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                          {items.map((uid: string) => {
                            const p = db.PEOPLE[uid];
                            if (!p) return null;
                            const on = picked === uid;
                            const played = matchCounts[uid] || 0;
                            return (
                              <TouchableOpacity key={uid} onPress={() => setPicked(on ? null : uid)} activeOpacity={0.7}
                                style={{
                                  flexDirection: 'row', alignItems: 'center', gap: 8,
                                  paddingVertical: 7, paddingHorizontal: 10, paddingLeft: 7, borderRadius: 999,
                                  backgroundColor: on ? T.brand : T.surface,
                                  borderWidth: 1, borderColor: on ? T.brand : T.border,
                                }}>
                                <Avatar initials={p.initials} tile={p.tile} size={26} tint={p.tint} />
                                <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: fs(13.5), color: on ? T.inkOnDeep : T.ink }}>
                                  {p.name.split(' ')[0]} {p.name.split(' ').slice(-1)[0][0]}.
                                </Text>
                                {played > 0 && !p.sub && (
                                  <View style={{ backgroundColor: on ? 'rgba(239,234,217,0.25)' : T.surfaceAlt, borderRadius: 999, paddingHorizontal: 5, paddingVertical: 1 }}>
                                    <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(9), color: on ? T.inkOnDeep : T.inkSoft }}>{played}</Text>
                                  </View>
                                )}
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                        {/* Availability for picked player */}
                        {picked && (() => {
                          const slots = weeklySlots(db);
                          const mine = slotAvailabilityOf(db, picked);
                          const weekSlots = slots.map(s => ({
                            ...s,
                            value: mine[weekSlotId(week, s.id)] || null,
                            note: mine[`${weekSlotId(week, s.id)}-note`] || null,
                          }));
                          const pickedName = db.PEOPLE[picked]?.name?.split(' ')[0] || 'Player';
                          const hasAny = weekSlots.some(s => s.value);
                          return (
                            <View style={{ marginTop: 10, backgroundColor: T.surfaceAlt, borderRadius: 10, padding: 10 }}>
                              <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(9.5), letterSpacing: 1.4, textTransform: 'uppercase', color: T.inkSoft, marginBottom: 6 }}>
                                {pickedName}'s availability · Week {week}
                              </Text>
                              {hasAny ? weekSlots.map(s => {
                                if (!s.value) return null;
                                const color = s.value === 'yes' ? T.accent : s.value === 'if_needed' ? '#C4A44E' : '#A0524A';
                                const label = s.value === 'yes' ? 'Available' : s.value === 'if_needed' ? 'If needed' : 'Unavailable';
                                return (
                                  <View key={s.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 3 }}>
                                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
                                    <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: fs(13), color: T.ink }}>{slotLabel(s)}</Text>
                                    <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(11), color: T.inkSoft }}>{slotHours(s)}</Text>
                                    <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(10), color }}>{label}</Text>
                                  </View>
                                );
                              }) : (
                                <Text style={{ fontFamily: ALMA_FONTS.serifItalic, fontSize: fs(13), color: T.inkSoft }}>
                                  {pickedName} hasn't filled in availability for this week yet.
                                </Text>
                              )}
                            </View>
                          );
                        })()}
                        <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(10.5), color: T.inkMute, marginTop: 10, lineHeight: 16 }}>
                          {picked ? 'Now tap an open seat below.' : iHost ? 'Tap a player to seat her yourself.' : 'Use The Majigan for a guest player.'}
                        </Text>
                      </>
                    ) : (
                      <Text style={{ fontFamily: ALMA_FONTS.serifItalic, fontSize: fs(14), color: T.inkSoft, padding: 6 }}>
                        {iHost ? 'Everyone is seated.' : 'No substitutes needed.'}
                      </Text>
                    );
                  })()}
                </Card>
              </View>
              );
            })()}

            {/* Away word bank: selected players (non-captain view) */}
            {!iHost && !isCaptain && awaySelectionDone && (
              <View style={{ paddingHorizontal: 18, paddingTop: 18 }}>
                <SectionLabel>Selected players</SectionLabel>
                <Card variant="quiet" style={{ marginTop: 8, padding: 12 }}>
                  {bench.length ? (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {bench.map(uid => {
                        const p = db.PEOPLE[uid];
                        if (!p) return null;
                        return (
                          <View key={uid}
                            style={{
                              flexDirection: 'row', alignItems: 'center', gap: 8,
                              paddingVertical: 7, paddingHorizontal: 10, paddingLeft: 7, borderRadius: 999,
                              backgroundColor: T.surface, borderWidth: 1, borderColor: T.border,
                            }}>
                            <Avatar initials={p.initials} tile={p.tile} size={26} tint={p.tint} />
                            <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: fs(13.5), color: T.ink }}>
                              {p.name.split(' ')[0]} {p.name.split(' ').slice(-1)[0][0]}.
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  ) : (
                    <Text style={{ fontFamily: ALMA_FONTS.serifItalic, fontSize: fs(14), color: T.inkSoft, padding: 6 }}>All selected players are seated.</Text>
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
                // Home: only captains seat players. Away: eligible players can self-seat once match is proposed.
                const canJoin = !locked && !imHere && !mySeat && openSeats > 0 && iAmEligible && awayCanSeat && (iHost ? isCaptain : true);
                const homeTeam = m.home === myTeam.id ? myTeam : opp;

                return (
                  <Card key={m.id} style={{
                    padding: 14, opacity: locked ? 0.72 : 1,
                    borderColor: imHere ? T.brand : undefined,
                    borderWidth: imHere ? 1 : undefined,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: fs(12), letterSpacing: 2, textTransform: 'uppercase', color: T.ink }}>
                        Match {m.table}
                      </Text>
                      <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(10.5), letterSpacing: 1, textTransform: 'uppercase', color: T.inkSoft }}>
                        {locked ? 'Score logged' : `${homeTeam?.shortName} host${m.home === myTeam.id ? ' (you)' : 's'}`}
                      </Text>
                    </View>

                    {/* My side */}
                    <View style={{ marginTop: 12 }}>
                      <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(9), letterSpacing: 2, textTransform: 'uppercase', color: T.ink, marginBottom: 6 }}>
                        {myTeam.shortName}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 10 }}>
                        {mySeats.map((uid, i) => (
                          <SeatSlot key={i} db={db} uid={uid} you={uid === V.uid}
                            active={!!picked && !locked && isCaptain && awayCanSeat}
                            onPeek={() => uid && setPeek(uid)}
                            onTake={() => {
                              if (locked || !isCaptain || !awayCanSeat) return;
                              if (picked) return seat(picked, m.id, i);
                            }}
                            onClear={!locked && uid && awayCanSeat && (isCaptain || uid === V.uid) ? () => unseat(m.id, i) : undefined} />
                        ))}
                      </View>
                    </View>

                    {/* Their side */}
                    <View style={{ marginTop: 12 }}>
                      <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(9), letterSpacing: 2, textTransform: 'uppercase', color: T.inkMute, marginBottom: 6 }}>
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
                            <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(12), color: T.inkOnDeep }}>Take a seat</Text>
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
                <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.inkOnDeep }}>Done</Text>
              </Button>
              <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(11), color: T.inkMute, textAlign: 'center', marginTop: 10, lineHeight: 17 }}>
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
          <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: fs(12.5), color: T.ink, textAlign: 'center', lineHeight: 16 }}>
            {p.name.split(' ')[0]}{'\n'}{p.name.split(' ').slice(1).join(' ')}
          </Text>
          {you && <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(8.5), letterSpacing: 1.6, textTransform: 'uppercase', color: T.brand }}>You</Text>}
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
          <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(9.5), letterSpacing: 1.6, textTransform: 'uppercase', color: active ? T.brand : T.inkMute, textAlign: 'center' }}>
            {readOnly ? 'Open' : active ? 'Seat here' : 'Open seat'}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

function AwayRosterPicker({ db, myTeam, week, app, existingRoster }: { db: any; myTeam: any; week: number; app: any; existingRoster?: string[] }) {
  const T = useTheme();
  const [selected, setSelected] = useState<string[]>(existingRoster || []);
  // Reset selections when week or existingRoster changes
  React.useEffect(() => { setSelected(existingRoster || []); }, [week, existingRoster?.join(',')]);
  const SUBS = db.SUBSTITUTES || [];
  const roster = myTeam.roster.filter((uid: string) => !SUBS.includes(uid));

  // Find players who are seated in matches with logged scores — they can't be removed
  const matches = db.MATCHES.filter((m: any) => m.week === week && (m.home === myTeam.id || m.away === myTeam.id));
  const lockedPlayers = new Set<string>();
  for (const m of matches) {
    if (m.status === 'final') {
      const side = m.home === myTeam.id ? 'home' : 'away';
      for (const uid of (m.seats[side] || [])) {
        if (uid) lockedPlayers.add(uid);
      }
    }
  }

  const toggle = (uid: string) => {
    if (lockedPlayers.has(uid)) return;
    let next: string[];
    if (selected.includes(uid)) {
      next = selected.filter(u => u !== uid);
    } else if (selected.length < 6) {
      next = [...selected, uid];
    } else {
      return;
    }
    setSelected(next);
    app.setAwayRoster(week, next);
  };

  return (
    <View style={{ paddingHorizontal: 18, paddingTop: 18 }}>
      <SectionLabel action={
        <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(10), letterSpacing: 1.2, textTransform: 'uppercase', color: T.inkMute }}>Captain</Text>
      }>Select players for this week</SectionLabel>
      <Card variant="quiet" style={{ marginTop: 12, padding: 14 }}>
        <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: fs(13.5), color: T.inkSoft, lineHeight: 20, marginBottom: 12 }}>
          Choose up to 6 players. Selected players will seat themselves at a table. You can change this at any time.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {roster.map((uid: string) => {
            const p = db.PEOPLE[uid];
            if (!p) return null;
            const on = selected.includes(uid);
            const locked = lockedPlayers.has(uid);
            return (
              <TouchableOpacity key={uid} onPress={() => toggle(uid)} activeOpacity={locked ? 1 : 0.7}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 8,
                  paddingVertical: 7, paddingHorizontal: 10, paddingLeft: 7, borderRadius: 999,
                  backgroundColor: on ? T.brand : T.surface,
                  borderWidth: 1, borderColor: on ? T.brand : T.border,
                  opacity: locked ? 0.6 : 1,
                }}>
                <Avatar initials={p.initials} tile={p.tile} size={26} tint={p.tint} />
                <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: fs(13.5), color: on ? T.inkOnDeep : T.ink }}>
                  {p.name.split(' ')[0]} {p.name.split(' ').slice(-1)[0][0]}.
                </Text>
                {locked && <Icon name="check" size={12} color={T.inkOnDeep} />}
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(10.5), color: T.inkMute, marginTop: 10, lineHeight: 16 }}>
          {selected.length}/6 selected{lockedPlayers.size > 0 ? ` · ${lockedPlayers.size} locked (score logged)` : ''}
        </Text>
        {selected.length > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 }}>
            <Icon name="check" size={14} color={T.accent} />
            <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(12), color: T.accent }}>Selections save automatically</Text>
          </View>
        )}
      </Card>
    </View>
  );
}

function PlayerPeek({ db, uid, week, onClose }: { db: any; uid: string; week: number; onClose: () => void }) {
  const T = useTheme();
  const p = db.PEOPLE[uid];
  if (!p) return null;
  const mine = slotAvailabilityOf(db, uid);
  const yes = weeklySlots(db).filter(s => {
    const v = mine[weekSlotId(week, s.id)];
    return v === 'yes' || v === 'if_needed';
  });

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
              <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(11), color: T.inkSoft, marginTop: 2 }}>
                {(db.TEAMS.find((t: any) => t.roster.includes(uid)) || {}).name || 'League member'}
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 18 }}>
            <Eyebrow>Free in Week {week}</Eyebrow>
            <View style={{ marginTop: 8, gap: 8 }}>
              {yes.length ? yes.map(s => {
                const key = weekSlotId(week, s.id);
                const status = mine[key];
                return (
                  <View key={s.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: fs(15), color: T.ink }}>{slotLabel(s)}</Text>
                    <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(11), color: T.inkSoft }}>{slotHours(s)}</Text>
                    {status === 'if_needed' && (
                      <View style={{ backgroundColor: 'rgba(196,164,78,0.15)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                        <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(9), letterSpacing: 0.8, color: '#7E6537' }}>If needed</Text>
                      </View>
                    )}
                  </View>
                );
              }) : (
                <Text style={{ fontFamily: ALMA_FONTS.serifItalic, fontSize: fs(14), color: T.inkSoft }}>
                  No availability marked for this week yet.
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
                  <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(13), color: T.ink }}>{p.phone}</Text>
                </View>
              ) : null}
              {p.email ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Icon name="mail" size={15} color={T.inkSoft} />
                  <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(13), color: T.ink }}>{p.email}</Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={{ marginTop: 22 }}>
            <Button variant="secondary" fullWidth onPress={onClose}>
              <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.ink }}>Close</Text>
            </Button>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
