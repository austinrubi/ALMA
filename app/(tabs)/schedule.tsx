import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme, ALMA_FONTS , fs } from '../../lib/theme';
import { useApp } from '../../lib/AppContext';
import { weekPlayDatesLabel, weeklySlots, weekSlotId, slotAvailabilityOf, slotLabel, slotHours } from '../../lib/availability';
import { isCaptainOf } from '../../lib/roles';
import { Header } from '../../components/Header';
import { WeekStrip } from '../../components/WeekStrip';
import { Card, Eyebrow, DisplayCaps, SerifTitle, Chip, Avatar, Icon, Button } from '../../components/ui';

export default function ScheduleScreen() {
  const T = useTheme();
  const insets = useSafeAreaInsets();
  const { db, viewer: V, app } = useApp();
  const router = useRouter();
  const [week, setWeek] = useState(db.SEASON.currentWeek);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);

  const myTeam = V.team || db.TEAMS[0];

  if (!myTeam) {
    return (
      <View style={{ flex: 1, backgroundColor: T.appBg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={T.brand} />
      </View>
    );
  }

  const isCaptain = !!V.can.manageRoster;
  const matches = db.MATCHES
    .filter(m => m.week === week && (m.home === myTeam.id || m.away === myTeam.id))
    .sort((a, b) => a.table - b.table);
  const isHome = matches.length ? matches[0].home === myTeam.id : true;
  const opp = matches.length ? db.TEAMS.find(t => t.id === (isHome ? matches[0].away : matches[0].home)) : null;
  const scored = matches.filter(m => m.status === 'final' && m.result);
  const myPts = scored.reduce((s, m) => s + (m.home === myTeam.id ? m.result!.home : m.result!.away), 0);
  const oppPts = scored.reduce((s, m) => s + (m.home === myTeam.id ? m.result!.away : m.result!.home), 0);

  // Seating logic (from pairings)
  const sideOf = (m: typeof matches[0]) => (m.home === myTeam.id ? 'home' : 'away');
  const seatOf: Record<string, { matchId: string; seatIdx: number; table: number }> = {};
  matches.forEach(m => (m.seats[sideOf(m)] || []).forEach((uid, i) => { if (uid) seatOf[uid] = { matchId: m.id, seatIdx: i, table: m.table }; }));
  const SUBS = db.SUBSTITUTES || [];
  const awayRoster = ((db.SEASON.awayRoster || {})[week]) || [];
  const eligible = isHome ? myTeam.roster : awayRoster;
  const bench = [...eligible.filter(uid => !seatOf[uid]), ...SUBS.filter(uid => !seatOf[uid])];
  const mySeat = seatOf[V.uid] || null;
  const iAmEligible = isHome ? myTeam.roster.includes(V.uid) : awayRoster.includes(V.uid);
  const awaySelectionDone = !isHome && awayRoster.length > 0;
  const matchProposed = matches.some(m => !!m.plan?.when);
  const awayCanSeat = isHome || matchProposed;

  // Match counts per player
  const matchCounts: Record<string, number> = {};
  for (const m of db.MATCHES) {
    for (const side of ['home', 'away'] as const) {
      for (const uid of (m.seats[side] || [])) {
        if (uid) matchCounts[uid] = (matchCounts[uid] || 0) + 1;
      }
    }
  }

  const seatPlayer = (uid: string, matchId: string, seatIdx: number) => {
    app.assignSeat({ week, teamId: myTeam.id, matchId, seatIdx, uid });
    setPicked(null);
  };
  const unseatPlayer = (matchId: string, seatIdx: number) => {
    app.assignSeat({ week, teamId: myTeam.id, matchId, seatIdx, uid: null });
    setPicked(null);
  };
  const joinTable = (m: typeof matches[0]) => {
    const seats = [0, 1].map(i => (m.seats[sideOf(m)] || [])[i] || null);
    const free = seats.indexOf(null);
    if (free >= 0) seatPlayer(V.uid, m.id, free);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: T.appBg }} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 120 }}>
      <Header title="Schedule" large />

      <View style={{ paddingHorizontal: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Eyebrow>{`The Season \u00B7 ${db.SEASON.weekCount} weeks`}</Eyebrow>
          {opp && <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(11), color: T.inkSoft }}>{isHome ? 'vs.' : '@'} {opp.shortName}</Text>}
        </View>
        <View style={{ paddingTop: 10 }}>
          <WeekStrip db={db} week={week} onChange={w => { setWeek(w); setPicked(null); }} />
        </View>
      </View>

      {/* Pairing summary */}
      {!!matches.length && (
        <View style={{ paddingHorizontal: 18, paddingTop: 18 }}>
          <Card variant="quiet" style={{ padding: 16 }}>
            <Eyebrow>{isHome ? 'Home match' : 'Away match'} {`\u00B7 Week ${week}`}{(() => { const dl = weekPlayDatesLabel(db, week); return dl ? ` \u00B7 ${dl}` : ''; })()}</Eyebrow>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
              <View>
                <DisplayCaps size={18}>{myTeam.shortName}</DisplayCaps>
                <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(11), color: T.inkSoft, marginTop: 2 }}>{isHome ? 'vs.' : '@'} {opp?.shortName}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: fs(22), color: T.ink }}>{myPts} – {oppPts}</Text>
                <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(10), color: T.inkSoft, letterSpacing: 1 }}>
                  {scored.length} of {matches.length} tables scored
                </Text>
              </View>
            </View>
          </Card>
        </View>
      )}

      {/* Away: waiting for home team to propose */}
      {!!matches.length && !isHome && !matchProposed && (
        <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
          <Card variant="quiet" style={{ padding: 14, flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <Icon name="clock" size={18} color={T.inkSoft} />
            <Text style={{ flex: 1, fontFamily: ALMA_FONTS.serif, fontSize: fs(13.5), color: T.inkSoft, lineHeight: 20 }}>
              Waiting for <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, color: T.ink }}>{opp?.shortName}</Text> to propose a date and time. Seating opens once they do.
            </Text>
          </Card>
        </View>
      )}

      {/* Away captain: select players for this week */}
      {!!matches.length && !isHome && isCaptain && (
        <AwayRosterInline db={db} myTeam={myTeam} week={week} app={app} matches={matches} />
      )}

      {/* HOME captain bench — pick a player, then tap a seat to place them */}
      {!!matches.length && isHome && isCaptain && (() => {
        if (!bench.length && !picked) return null;
        return (
          <View style={{ paddingHorizontal: 18, paddingTop: 16 }}>
            <Eyebrow>Seat players</Eyebrow>
            <Card variant="quiet" style={{ marginTop: 8, padding: 12 }}>
              {bench.length ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {bench.map((uid: string) => {
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
              ) : (
                <Text style={{ fontFamily: ALMA_FONTS.serifItalic, fontSize: fs(14), color: T.inkSoft, padding: 6 }}>Everyone is seated.</Text>
              )}
              {/* Availability for picked player */}
              {picked && (() => {
                const slots = weeklySlots(db);
                const avail = slotAvailabilityOf(db, picked);
                const weekSlots = slots.map(s => ({ ...s, value: avail[weekSlotId(week, s.id)] || null }));
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
                {picked ? 'Now tap an open seat below.' : 'Tap a player, then tap an open seat. The number shows matches played.'}
              </Text>
            </Card>
          </View>
        );
      })()}

      {/* Match cards with inline seating */}
      <View style={{ paddingHorizontal: 18, paddingTop: 18, gap: 10 }}>
        {!matches.length && (
          <Card variant="quiet" style={{ padding: 24, alignItems: 'center' }}>
            <SerifTitle size={16} italic color={T.inkSoft}>No fixtures posted for Week {week}.</SerifTitle>
          </Card>
        )}
        {matches.map(m => {
          const side = sideOf(m);
          const otherSide = side === 'home' ? 'away' : 'home';
          const mySeats = [0, 1].map(i => (m.seats[side] || [])[i] || null);
          const theirSeats = [0, 1].map(i => (m.seats[otherSide] || [])[i] || null);
          const locked = m.status === 'final';
          const imHere = mySeats.includes(V.uid);
          const openSeats = mySeats.filter(s => !s).length;
          // Home: only captain can seat (via pick+tap). Away: eligible players self-seat via button.
          const canSelfSeat = !locked && !imHere && !mySeat && openSeats > 0 && iAmEligible && awayCanSeat && !isHome;
          const canCaptainSeat = !locked && isHome && isCaptain && picked && openSeats > 0;
          const homeTeamObj = db.TEAMS.find(t => t.id === m.home);

          return (
            <Card key={m.id} style={{
              padding: 0, overflow: 'hidden',
              borderColor: imHere && !locked ? T.brand : undefined,
              borderWidth: imHere && !locked ? 1 : undefined,
            }}>
              {/* Header — tap to expand match details */}
              <TouchableOpacity onPress={() => setExpanded(expanded === m.id ? null : m.id)} activeOpacity={0.7}
                style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 44, height: 50, borderRadius: 10, backgroundColor: T.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(8), color: T.inkSoft, letterSpacing: 1.2 }}>MATCH</Text>
                  <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: fs(18), color: T.ink }}>{m.table}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(10), letterSpacing: 1.2, textTransform: 'uppercase', color: T.inkSoft }}>
                    {locked ? 'Score logged' : `${homeTeamObj?.shortName} host${m.home === myTeam.id ? ' (you)' : 's'}`}
                  </Text>
                </View>
                {locked && m.result && (
                  <Chip variant={((m.home === myTeam.id ? m.result.home : m.result.away) > (m.home === myTeam.id ? m.result.away : m.result.home)) ? 'success' : 'danger'}>
                    <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(10), letterSpacing: 1.6,
                      color: ((m.home === myTeam.id ? m.result.home : m.result.away) > (m.home === myTeam.id ? m.result.away : m.result.home)) ? '#466357' : '#7B3E38',
                    }}>{m.home === myTeam.id ? m.result.home : m.result.away} – {m.home === myTeam.id ? m.result.away : m.result.home}</Text>
                  </Chip>
                )}
                {imHere && !locked && <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(9), color: T.brand, letterSpacing: 1.2, textTransform: 'uppercase' }}>Your table</Text>}
                <Icon name={expanded === m.id ? 'chevronDown' : 'chevronRight'} size={16} color={T.inkSoft} />
              </TouchableOpacity>

              {/* Seating — always visible */}
              <View style={{ paddingHorizontal: 14, paddingBottom: 12, gap: 8 }}>
                {/* My side */}
                <View>
                  <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(9), letterSpacing: 2, textTransform: 'uppercase', color: T.ink, marginBottom: 4 }}>{myTeam.shortName}</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {mySeats.map((uid, i) => {
                      const p = uid ? db.PEOPLE[uid] : null;
                      const isMe = uid === V.uid;
                      // Only home captain can tap to seat a picked player
                      const canTap = !locked && isHome && isCaptain && picked && !p;
                      return (
                        <TouchableOpacity key={i} activeOpacity={0.7}
                          onPress={() => {
                            if (p) return;
                            if (canTap && picked) seatPlayer(picked, m.id, i);
                          }}
                          style={{
                            flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
                            padding: 8, borderRadius: 10,
                            backgroundColor: isMe ? T.surfaceTint : p ? T.surface : T.surfaceAlt,
                            borderWidth: 1,
                            borderStyle: p ? 'solid' : 'dashed',
                            borderColor: isMe ? T.brand : canTap ? T.brand : p ? T.border : T.borderStrong,
                          }}>
                          {p ? (
                            <>
                              <Avatar initials={p.initials} tile={p.tile} size={28} tint={p.tint} />
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: fs(12.5), color: T.ink }}>{p.name.split(' ')[0]}</Text>
                                {isMe && <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(8), color: T.brand, letterSpacing: 1 }}>YOU</Text>}
                              </View>
                              {!locked && (isCaptain || isMe) && awayCanSeat && (
                                <TouchableOpacity onPress={() => unseatPlayer(m.id, i)}
                                  style={{ width: 20, height: 20, borderRadius: 999, backgroundColor: T.surfaceAlt, borderWidth: 1, borderColor: T.border, alignItems: 'center', justifyContent: 'center' }}>
                                  <Icon name="x" size={10} color={T.inkSoft} />
                                </TouchableOpacity>
                              )}
                            </>
                          ) : (
                            <View style={{ flex: 1, alignItems: 'center', paddingVertical: 6 }}>
                              <Icon name={canTap ? 'plus' : 'clock'} size={14} color={canTap ? T.brand : T.inkMute} />
                              <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(9), letterSpacing: 1.2, textTransform: 'uppercase', color: canTap ? T.brand : T.inkMute, marginTop: 2 }}>
                                {canTap ? 'Seat here' : 'Open'}
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
                {/* Their side */}
                <View>
                  <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(9), letterSpacing: 2, textTransform: 'uppercase', color: T.inkMute, marginBottom: 4 }}>{opp?.shortName}</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {theirSeats.map((uid, i) => {
                      const p = uid ? db.PEOPLE[uid] : null;
                      return (
                        <View key={i} style={{
                          flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
                          padding: 8, borderRadius: 10,
                          backgroundColor: p ? T.surface : T.surfaceAlt,
                          borderWidth: 1, borderStyle: p ? 'solid' : 'dashed',
                          borderColor: p ? T.border : T.borderStrong,
                        }}>
                          {p ? (
                            <>
                              <Avatar initials={p.initials} tile={p.tile} size={28} tint={p.tint} />
                              <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: fs(12.5), color: T.ink }}>{p.name.split(' ')[0]}</Text>
                            </>
                          ) : (
                            <View style={{ flex: 1, alignItems: 'center', paddingVertical: 6 }}>
                              <Icon name="clock" size={14} color={T.inkMute} />
                              <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(9), letterSpacing: 1.2, textTransform: 'uppercase', color: T.inkMute, marginTop: 2 }}>Open</Text>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>
                {/* Self-seat button (away players seat themselves) */}
                {canSelfSeat && (
                  <Button variant="primary" size="sm" onPress={() => joinTable(m)}>
                    <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(12), color: T.inkOnDeep }}>Take a seat</Text>
                  </Button>
                )}
              </View>

              {/* Expanded: match details, proposal, score */}
              {expanded === m.id && (
                <MatchCardExpanded match={m} myTeam={myTeam} opp={opp} viewer={V} db={db} app={app} isHome={isHome} router={router} />
              )}
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

function MatchCardExpanded({ match: m, myTeam, opp, viewer: V, db, app, isHome, router }: any) {
  const T = useTheme();
  const mySide = (m.seats[isHome ? 'home' : 'away'] || []).filter(Boolean);
  const allSeats = [...(m.seats.home || []), ...(m.seats.away || [])].filter(Boolean);
  const seated = allSeats.includes(V.uid);
  const isCaptain = V.isCaptain || V.isAdmin;
  const canManage = seated || isCaptain;
  const yours = mySide.includes(V.uid);
  const final = m.status === 'final' && m.result;

  // Proposal form state
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    if (!m.plan?.when) return null;
    const parsed = new Date(m.plan.when);
    return isNaN(parsed.getTime()) ? null : parsed;
  });
  const [hour, setHour] = useState(() => {
    if (!m.plan?.when) return 10;
    const parsed = new Date(m.plan.when);
    return isNaN(parsed.getTime()) ? 10 : parsed.getHours();
  });
  const [minute, setMinute] = useState(() => {
    if (!m.plan?.when) return 0;
    const parsed = new Date(m.plan.when);
    return isNaN(parsed.getTime()) ? 0 : parsed.getMinutes();
  });
  const [whereVal, setWhereVal] = useState(m.plan?.where || '');
  const [saved, setSaved] = useState(false);

  // Build the display string for the selected date+time
  const formatProposal = (date: Date | null, h: number, min: number) => {
    if (!date) return '';
    const d = new Date(date);
    d.setHours(h, min, 0, 0);
    return d.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  // Build the ISO string for storage
  const buildWhenString = (date: Date | null, h: number, min: number) => {
    if (!date) return '';
    const d = new Date(date);
    d.setHours(h, min, 0, 0);
    return d.toISOString();
  };

  return (
    <View style={{ borderTopWidth: 1, borderTopColor: T.border, paddingHorizontal: 16, paddingVertical: 14, gap: 16 }}>
      {/* Existing plan display — only show once home team has set it */}
          {m.plan?.when && !saved && (
            <View style={{ backgroundColor: T.surfaceTint, borderRadius: 10, padding: 12, gap: 4 }}>
              <Eyebrow>Scheduled</Eyebrow>
              <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: fs(15), color: T.ink }}>
                {(() => {
                  const d = new Date(m.plan.when);
                  return isNaN(d.getTime()) ? m.plan.when : d.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
                })()}
              </Text>
              {m.plan.where ? <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(12), color: T.inkSoft }}>{m.plan.where}</Text> : null}
            </View>
          )}

          {/* Away team: no plan yet — show waiting message */}
          {!final && !isHome && !m.plan?.when && (
            <View style={{ backgroundColor: T.surfaceAlt, borderRadius: 10, padding: 12, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <Icon name="clock" size={16} color={T.inkSoft} />
              <Text style={{ flex: 1, fontFamily: ALMA_FONTS.serifItalic, fontSize: fs(13.5), color: T.inkSoft, lineHeight: 20 }}>
                Waiting for {db.TEAMS.find((t: any) => t.id === m.home)?.shortName || 'the home team'} to propose a date and time.
              </Text>
            </View>
          )}

          {/* Propose / edit match details — home team only */}
          {!final && canManage && isHome && (
            <View style={{ gap: 12 }}>
              <Eyebrow>{m.plan?.when ? 'Update details' : 'Propose match'}</Eyebrow>

              {/* Day picker — shows the 7 days of this match week */}
              {(() => {
                const seasonStart = new Date(db.SEASON.startDate + 'T00:00:00');
                const weekStart = new Date(seasonStart.getTime() + (m.week - 1) * 7 * 86400000);
                const windows = db.SEASON.playWindows || [];
                // Set of day-of-week numbers (0=Sun) that are play window days
                const playDays = new Set(windows.flatMap((w: any) => w.days));

                // Check if selected date+time falls within a play window
                const selectedDow = selectedDate ? selectedDate.getDay() : -1;
                const selectedTimeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                const inWindow = selectedDate && windows.some((w: any) =>
                  w.days.includes(selectedDow) && selectedTimeStr >= w.start && selectedTimeStr <= w.end
                );

                return (
                  <>
                    <View>
                      <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(10), letterSpacing: 1.6, textTransform: 'uppercase', color: T.inkSoft, marginBottom: 8 }}>Day</Text>
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        {Array.from({ length: 7 }, (_, i) => {
                          const d = new Date(weekStart.getTime() + i * 86400000);
                          const isSelected = selectedDate && d.toDateString() === selectedDate.toDateString();
                          const isPlayDay = playDays.has(d.getDay());
                          const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                          const monthName = d.toLocaleDateString('en-US', { month: 'short' });
                          const dayNum = d.getDate();
                          return (
                            <TouchableOpacity key={i} onPress={() => setSelectedDate(d)} activeOpacity={0.7}
                              style={{
                                flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10,
                                backgroundColor: isSelected ? T.brand : isPlayDay ? 'rgba(75,142,122,0.22)' : T.surfaceAlt,
                                borderWidth: isSelected || isPlayDay ? 2 : 1, borderColor: isSelected ? T.brand : isPlayDay ? T.accent : T.border,
                              }}>
                              <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(9), letterSpacing: 1, color: isSelected ? T.inkOnDeep : isPlayDay ? T.accent : T.inkSoft }}>{dayName}</Text>
                              <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: fs(15), color: isSelected ? T.inkOnDeep : T.ink, marginTop: 2 }}>{monthName}</Text>
                              <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: fs(15), color: isSelected ? T.inkOnDeep : T.ink }}>{dayNum}</Text>
                              {isPlayDay && !isSelected && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: T.accent, marginTop: 3 }} />}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>

                    {/* Time picker */}
                    <View>
                      <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(10), letterSpacing: 1.6, textTransform: 'uppercase', color: T.inkSoft, marginBottom: 8 }}>Time</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        {/* Hour */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <TouchableOpacity onPress={() => setHour(h => (h + 23) % 24)}
                            style={{ width: 32, height: 32, borderRadius: 999, backgroundColor: T.surfaceAlt, borderWidth: 1, borderColor: T.border, alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name="chevronLeft" size={14} color={T.inkSoft} />
                          </TouchableOpacity>
                          <View style={{ width: 48, alignItems: 'center', backgroundColor: T.surface, borderRadius: 10, paddingVertical: 10, borderWidth: 1, borderColor: T.border }}>
                            <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: fs(18), color: T.ink }}>
                              {hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}
                            </Text>
                          </View>
                          <TouchableOpacity onPress={() => setHour(h => (h + 1) % 24)}
                            style={{ width: 32, height: 32, borderRadius: 999, backgroundColor: T.surfaceAlt, borderWidth: 1, borderColor: T.border, alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name="chevronRight" size={14} color={T.inkSoft} />
                          </TouchableOpacity>
                        </View>

                        <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: fs(20), color: T.ink }}>:</Text>

                        {/* Minute */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <TouchableOpacity onPress={() => setMinute(min => (min + 45) % 60)}
                            style={{ width: 32, height: 32, borderRadius: 999, backgroundColor: T.surfaceAlt, borderWidth: 1, borderColor: T.border, alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name="chevronLeft" size={14} color={T.inkSoft} />
                          </TouchableOpacity>
                          <View style={{ width: 48, alignItems: 'center', backgroundColor: T.surface, borderRadius: 10, paddingVertical: 10, borderWidth: 1, borderColor: T.border }}>
                            <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: fs(18), color: T.ink }}>
                              {String(minute).padStart(2, '0')}
                            </Text>
                          </View>
                          <TouchableOpacity onPress={() => setMinute(min => (min + 15) % 60)}
                            style={{ width: 32, height: 32, borderRadius: 999, backgroundColor: T.surfaceAlt, borderWidth: 1, borderColor: T.border, alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name="chevronRight" size={14} color={T.inkSoft} />
                          </TouchableOpacity>
                        </View>

                        {/* AM/PM toggle */}
                        <TouchableOpacity onPress={() => setHour(h => (h + 12) % 24)} activeOpacity={0.7}
                          style={{ backgroundColor: T.surfaceAlt, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: T.border }}>
                          <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.ink }}>{hour < 12 ? 'AM' : 'PM'}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Play window status message */}
                    {selectedDate && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 2 }}>
                        <Icon name={inWindow ? 'check' : 'info'} size={14} color={inWindow ? T.accent : '#C4A44E'} />
                        <Text style={{ flex: 1, fontFamily: ALMA_FONTS.serifItalic, fontSize: fs(12.5), color: inWindow ? T.accent : '#C4A44E', lineHeight: 18 }}>
                          {inWindow
                            ? 'This date and time falls within a scheduled play window.'
                            : `This is outside the league's scheduled play windows. You can still propose it, but check with your opponents first.`}
                        </Text>
                      </View>
                    )}
                  </>
                );
              })()}

              {/* Location */}
              <View>
                <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(10), letterSpacing: 1.6, textTransform: 'uppercase', color: T.inkSoft, marginBottom: 8 }}>Location</Text>
                <TextInput
                  style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(14), color: T.ink, backgroundColor: T.surface, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: T.border }}
                  placeholder="e.g. Ansley Club, card room"
                  placeholderTextColor={T.inkMute}
                  value={whereVal}
                  onChangeText={setWhereVal}
                />
              </View>

              {/* Preview + save */}
              {selectedDate && (
                <View style={{ backgroundColor: T.surfaceTint, borderRadius: 10, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Icon name="calendar" size={14} color={T.brand} />
                  <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: fs(13.5), color: T.ink }}>{formatProposal(selectedDate, hour, minute)}</Text>
                </View>
              )}

              {saved ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Icon name="check" size={14} color={T.accent} />
                  <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(12), color: T.accent }}>Saved</Text>
                </View>
              ) : (
                <Button variant="primary" size="sm" disabled={!selectedDate} onPress={() => {
                  app.setMatchPlan(m.id, { when: buildWhenString(selectedDate, hour, minute), where: whereVal });
                  setSaved(true);
                  setTimeout(() => setSaved(false), 2000);
                }}>
                  <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(13), color: T.inkOnDeep }}>
                    {m.plan?.when ? 'Update' : 'Propose'}
                  </Text>
                </Button>
              )}
            </View>
          )}



          {/* Final score display */}
          {final && (
            <View style={{ backgroundColor: T.surfaceTint, borderRadius: 10, padding: 12, gap: 4 }}>
              <Eyebrow>Final score</Eyebrow>
              <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: fs(24), color: T.ink }}>
                {m.result.home} – {m.result.away}
              </Text>
              {m.enteredBy && (
                <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(11), color: T.inkSoft }}>
                  Logged by {db.PEOPLE[m.enteredBy]?.name?.split(' ')[0] || 'Unknown'}
                </Text>
              )}
            </View>
          )}

          {/* Match detail link */}
          <TouchableOpacity onPress={() => router.push({ pathname: '/match/[id]', params: { id: m.id } })}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 4 }}>
            <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(12), color: T.brand }}>Match details</Text>
            <Icon name="chevronRight" size={14} color={T.brand} />
          </TouchableOpacity>
        </View>
  );
}

function AwayRosterInline({ db, myTeam, week, app, matches }: { db: any; myTeam: any; week: number; app: any; matches: any[] }) {
  const T = useTheme();
  const existingRoster = ((db.SEASON.awayRoster || {})[week]) || [];
  const [selected, setSelected] = React.useState<string[]>(existingRoster);
  React.useEffect(() => { setSelected(existingRoster); }, [week, existingRoster?.join(',')]);
  const SUBS = db.SUBSTITUTES || [];
  const roster = myTeam.roster.filter((uid: string) => !SUBS.includes(uid));

  // Players seated in scored matches can't be removed
  const lockedPlayers = new Set<string>();
  for (const m of matches) {
    if (m.status === 'final') {
      const side = m.home === myTeam.id ? 'home' : 'away';
      for (const uid of (m.seats[side] || [])) { if (uid) lockedPlayers.add(uid); }
    }
  }

  const toggle = (uid: string) => {
    if (lockedPlayers.has(uid)) return;
    let next: string[];
    if (selected.includes(uid)) { next = selected.filter(u => u !== uid); }
    else if (selected.length < 6) { next = [...selected, uid]; }
    else return;
    setSelected(next);
    app.setAwayRoster(week, next);
  };

  // Match counts per player
  const matchCounts: Record<string, number> = {};
  for (const m of db.MATCHES) {
    for (const side of ['home', 'away'] as const) {
      for (const uid of (m.seats[side] || [])) {
        if (uid) matchCounts[uid] = (matchCounts[uid] || 0) + 1;
      }
    }
  }

  return (
    <View style={{ paddingHorizontal: 18, paddingTop: 16 }}>
      <Eyebrow>Select players for this week</Eyebrow>
      <Card variant="quiet" style={{ marginTop: 8, padding: 14 }}>
        <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: fs(13.5), color: T.inkSoft, lineHeight: 20, marginBottom: 12 }}>
          Choose up to 6 players. Selected players can then seat themselves at a table. The number on each player shows how many matches they've played so far.
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
                {(matchCounts[uid] || 0) > 0 && (
                  <View style={{ backgroundColor: on ? 'rgba(239,234,217,0.25)' : T.surfaceAlt, borderRadius: 999, paddingHorizontal: 5, paddingVertical: 1 }}>
                    <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(9), color: on ? T.inkOnDeep : T.inkSoft }}>{matchCounts[uid]}</Text>
                  </View>
                )}
                {locked && <Icon name="check" size={12} color={T.inkOnDeep} />}
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(10.5), color: T.inkMute, marginTop: 10, lineHeight: 16 }}>
          {selected.length}/6 selected{lockedPlayers.size > 0 ? ` · ${lockedPlayers.size} locked (score logged)` : ''}
        </Text>
      </Card>
    </View>
  );
}
