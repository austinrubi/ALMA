import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme, ALMA_FONTS } from '../../lib/theme';
import { useApp } from '../../lib/AppContext';
import { Header } from '../../components/Header';
import { WeekStrip } from '../../components/WeekStrip';
import { Card, Eyebrow, DisplayCaps, SerifTitle, Chip, Icon, Button } from '../../components/ui';

export default function ScheduleScreen() {
  const T = useTheme();
  const insets = useSafeAreaInsets();
  const { db, viewer: V, app } = useApp();
  const router = useRouter();
  const [week, setWeek] = useState(db.SEASON.currentWeek);
  const [expanded, setExpanded] = useState<string | null>(null);

  const myTeam = V.team || db.TEAMS[0];

  if (!myTeam) {
    return (
      <View style={{ flex: 1, backgroundColor: T.appBg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={T.brand} />
      </View>
    );
  }

  const matches = db.MATCHES
    .filter(m => m.week === week && (m.home === myTeam.id || m.away === myTeam.id))
    .sort((a, b) => a.table - b.table);
  const opp = matches.length ? db.TEAMS.find(t => t.id === (matches[0].home === myTeam.id ? matches[0].away : matches[0].home)) : null;
  const scored = matches.filter(m => m.status === 'final' && m.result);
  const myPts = scored.reduce((s, m) => s + (m.home === myTeam.id ? m.result!.home : m.result!.away), 0);
  const oppPts = scored.reduce((s, m) => s + (m.home === myTeam.id ? m.result!.away : m.result!.home), 0);
  const unseated = matches.filter(m => (m.seats[m.home === myTeam.id ? 'home' : 'away'] || []).filter(Boolean).length < 2).length;
  const iAmSeated = matches.some(m => (m.seats[m.home === myTeam.id ? 'home' : 'away'] || []).includes(V.uid));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: T.appBg }} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 120 }}>
      <Header title="Schedule" large
        action={
          <TouchableOpacity onPress={() => router.push({ pathname: '/pairings', params: { week: String(week) } })} style={{
            backgroundColor: T.brand, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14,
            flexDirection: 'row', alignItems: 'center', gap: 6,
          }}>
            <Icon name="users" size={14} color={T.inkOnDeep} />
            <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 12, letterSpacing: 0.5, color: T.inkOnDeep }}>Open tables</Text>
          </TouchableOpacity>
        }
      />

      <View style={{ paddingHorizontal: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Eyebrow>{`The Season \u00B7 ${db.SEASON.weekCount} weeks`}</Eyebrow>
          {opp && <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 11, color: T.inkSoft }}>vs. {opp.shortName}</Text>}
        </View>
        <View style={{ paddingTop: 10 }}>
          <WeekStrip db={db} week={week} onChange={setWeek} />
        </View>
      </View>

      {/* Pairing summary */}
      {!!matches.length && (
        <View style={{ paddingHorizontal: 18, paddingTop: 18 }}>
          <Card variant="quiet" style={{ padding: 16 }}>
            <Eyebrow>{`Pairing \u00B7 Week ${week}`}</Eyebrow>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
              <View>
                <DisplayCaps size={18}>{myTeam.shortName}</DisplayCaps>
                <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 11, color: T.inkSoft, marginTop: 2 }}>vs. {opp?.shortName}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: 22, color: T.ink }}>{myPts} – {oppPts}</Text>
                <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 10, color: T.inkSoft, letterSpacing: 1 }}>
                  {scored.length} of {matches.length} tables scored
                </Text>
              </View>
            </View>
          </Card>
        </View>
      )}

      {/* Seats open CTA */}
      {!!unseated && !iAmSeated && (
        <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
          <Card onPress={() => router.push({ pathname: '/pairings', params: { week: String(week) } })}
            style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: T.accent, borderWidth: 1 }}>
            <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(75,142,122,0.15)', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="users" size={17} color={T.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Eyebrow color={T.accent}>Seats open</Eyebrow>
              <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: 15, color: T.ink, marginTop: 2 }}>
                {unseated} of {matches.length} tables still have room.
              </Text>
            </View>
            <Icon name="chevronRight" size={18} color={T.inkSoft} />
          </Card>
        </View>
      )}

      {/* Match cards */}
      <View style={{ paddingHorizontal: 18, paddingTop: 18, gap: 10 }}>
        {!matches.length && (
          <Card variant="quiet" style={{ padding: 24, alignItems: 'center' }}>
            <SerifTitle size={16} italic color={T.inkSoft}>No fixtures posted for Week {week}.</SerifTitle>
          </Card>
        )}
        {matches.map(m => (
          <MatchCard
            key={m.id}
            match={m}
            myTeam={myTeam}
            opp={opp}
            viewer={V}
            db={db}
            app={app}
            expanded={expanded === m.id}
            onToggle={() => setExpanded(expanded === m.id ? null : m.id)}
            router={router}
          />
        ))}
      </View>

      {/* Info note */}
      <View style={{ paddingHorizontal: 18, paddingTop: 20 }}>
        <Card variant="tinted" style={{ padding: 14, flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
          <Icon name="info" size={18} color={T.inkSoft} />
          <Text style={{ flex: 1, fontFamily: ALMA_FONTS.serifItalic, fontSize: 13, color: T.inkSoft, lineHeight: 19 }}>
            Tap a table to propose a date, set a location, or log the score. Coordinate with your pair and opponents before confirming.
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
}

function MatchCard({ match: m, myTeam, opp, viewer: V, db, app, expanded, onToggle, router }: any) {
  const T = useTheme();
  const isHome = m.home === myTeam.id;
  const mySide = (m.seats[isHome ? 'home' : 'away'] || []).filter(Boolean);
  const theirSide = (m.seats[isHome ? 'away' : 'home'] || []).filter(Boolean);
  const mine = m.result ? (isHome ? m.result.home : m.result.away) : null;
  const theirs = m.result ? (isHome ? m.result.away : m.result.home) : null;
  const yours = mySide.includes(V.uid);
  const names = (uids: string[]) => uids.length ? uids.map((u: string) => db.PEOPLE[u]?.name?.split(' ')[0]).join(' & ') : 'Seats open';
  const final = m.status === 'final' && m.result;

  // Proposal form state
  const [whenVal, setWhenVal] = useState(m.plan?.when || '');
  const [whereVal, setWhereVal] = useState(m.plan?.where || '');
  const [notes, setNotes] = useState('');
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [saved, setSaved] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);

  const clamp = (v: string) => v.replace(/[^0-9]/g, '').slice(0, 3);

  return (
    <Card style={{
      padding: 0, overflow: 'hidden',
      borderColor: yours && !final ? T.brand : undefined,
      borderWidth: yours && !final ? 1 : undefined,
    }}>
      {/* Header row — always visible */}
      <TouchableOpacity onPress={onToggle} activeOpacity={0.7}
        style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={{
          width: 48, height: 56, borderRadius: 10, backgroundColor: T.surfaceAlt,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 8.5, color: T.inkSoft, letterSpacing: 1.5 }}>MATCH</Text>
          <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: 20, color: T.ink }}>{m.table}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            {final
              ? <Chip variant={mine > theirs ? 'success' : 'danger'}>
                  <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 10, letterSpacing: 1.6, color: mine > theirs ? '#466357' : '#7B3E38' }}>{mine} – {theirs}</Text>
                </Chip>
              : <Chip variant="info">
                  <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 10, letterSpacing: 1.6, color: '#355367' }}>No score yet</Text>
                </Chip>}
            {yours && <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 10, color: T.brand, letterSpacing: 1.2, textTransform: 'uppercase' }}>Your table</Text>}
          </View>
          <SerifTitle size={15}>{names(mySide)}</SerifTitle>
          <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 11, color: T.inkSoft, marginTop: 3 }}>
            vs. {names(theirSide)} · {opp?.shortName}
          </Text>
        </View>
        <Icon name={expanded ? 'chevronDown' : 'chevronRight'} size={18} color={T.inkSoft} />
      </TouchableOpacity>

      {/* Expanded panel */}
      {expanded && (
        <View style={{ borderTopWidth: 1, borderTopColor: T.border, paddingHorizontal: 16, paddingVertical: 14, gap: 16 }}>

          {/* Existing plan display */}
          {m.plan?.when && !saved && (
            <View style={{ backgroundColor: T.surfaceTint, borderRadius: 10, padding: 12, gap: 4 }}>
              <Eyebrow>Scheduled</Eyebrow>
              <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: 15, color: T.ink }}>{m.plan.when}</Text>
              {m.plan.where ? <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 12, color: T.inkSoft }}>{m.plan.where}</Text> : null}
            </View>
          )}

          {/* Propose / edit match details */}
          {!final && (
            <View style={{ gap: 10 }}>
              <Eyebrow>{m.plan?.when ? 'Update details' : 'Propose match'}</Eyebrow>
              <View style={{ gap: 8 }}>
                <TextInput
                  style={{ fontFamily: ALMA_FONTS.ui, fontSize: 14, color: T.ink, backgroundColor: T.surface, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: T.border }}
                  placeholder="Date & time (e.g. Tues May 19, 10am)"
                  placeholderTextColor={T.inkMute}
                  value={whenVal}
                  onChangeText={setWhenVal}
                />
                <TextInput
                  style={{ fontFamily: ALMA_FONTS.ui, fontSize: 14, color: T.ink, backgroundColor: T.surface, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: T.border }}
                  placeholder="Location (e.g. Ansley Club, card room)"
                  placeholderTextColor={T.inkMute}
                  value={whereVal}
                  onChangeText={setWhereVal}
                />
                <TextInput
                  style={{ fontFamily: ALMA_FONTS.ui, fontSize: 14, color: T.ink, backgroundColor: T.surface, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: T.border, minHeight: 60 }}
                  placeholder="Notes (optional)"
                  placeholderTextColor={T.inkMute}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                />
              </View>
              {saved ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Icon name="check" size={14} color={T.accent} />
                  <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 12, color: T.accent }}>Saved</Text>
                </View>
              ) : (
                <Button variant="primary" size="sm" onPress={() => {
                  app.setMatchPlan(m.id, { when: whenVal, where: whereVal });
                  setSaved(true);
                  setTimeout(() => setSaved(false), 2000);
                }}>
                  <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 13, color: T.inkOnDeep }}>
                    {m.plan?.when ? 'Update' : 'Propose'}
                  </Text>
                </Button>
              )}
            </View>
          )}

          {/* Score entry */}
          {!final && (
            <View style={{ gap: 10 }}>
              <Eyebrow>Log score</Eyebrow>
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 10, color: T.inkSoft, letterSpacing: 1, marginBottom: 4 }}>
                    {db.TEAMS.find((t: any) => t.id === m.home)?.shortName || 'Home'}
                  </Text>
                  <TextInput
                    style={{ fontFamily: ALMA_FONTS.display, fontSize: 22, color: T.ink, backgroundColor: T.surface, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: T.border, textAlign: 'center' }}
                    placeholder="0"
                    placeholderTextColor={T.inkMute}
                    value={homeScore}
                    onChangeText={v => setHomeScore(clamp(v))}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                </View>
                <Text style={{ fontFamily: ALMA_FONTS.serifItalic, fontSize: 18, color: T.inkMute, paddingTop: 14 }}>–</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 10, color: T.inkSoft, letterSpacing: 1, marginBottom: 4 }}>
                    {db.TEAMS.find((t: any) => t.id === m.away)?.shortName || 'Away'}
                  </Text>
                  <TextInput
                    style={{ fontFamily: ALMA_FONTS.display, fontSize: 22, color: T.ink, backgroundColor: T.surface, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: T.border, textAlign: 'center' }}
                    placeholder="0"
                    placeholderTextColor={T.inkMute}
                    value={awayScore}
                    onChangeText={v => setAwayScore(clamp(v))}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                </View>
              </View>
              {scoreSaved ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Icon name="check" size={14} color={T.accent} />
                  <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 12, color: T.accent }}>Score logged</Text>
                </View>
              ) : (
                <Button variant="primary" size="sm" disabled={!homeScore || !awayScore} onPress={() => {
                  const hs = parseInt(homeScore, 10);
                  const as_ = parseInt(awayScore, 10);
                  if (hs >= 1 && hs <= 999 && as_ >= 1 && as_ <= 999) {
                    app.logScore(m.id, { home: hs, away: as_ }, V.uid);
                    setScoreSaved(true);
                  }
                }}>
                  <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 13, color: T.inkOnDeep }}>Submit score</Text>
                </Button>
              )}
            </View>
          )}

          {/* Final score display */}
          {final && (
            <View style={{ backgroundColor: T.surfaceTint, borderRadius: 10, padding: 12, gap: 4 }}>
              <Eyebrow>Final score</Eyebrow>
              <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: 24, color: T.ink }}>
                {m.result.home} – {m.result.away}
              </Text>
              {m.enteredBy && (
                <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 11, color: T.inkSoft }}>
                  Logged by {db.PEOPLE[m.enteredBy]?.name?.split(' ')[0] || 'Unknown'}
                </Text>
              )}
            </View>
          )}

          {/* Full match detail link */}
          <TouchableOpacity onPress={() => router.push({ pathname: '/match/[id]', params: { id: m.id } })}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 4 }}>
            <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 12, color: T.brand }}>View full match details</Text>
            <Icon name="chevronRight" size={14} color={T.brand} />
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
}
