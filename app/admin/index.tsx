import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Pressable, TextInput, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme, ALMA_FONTS , fs } from '../../lib/theme';
import { useApp } from '../../lib/AppContext';
import { captainIdsOf, isCaptainOf, MAX_CAPTAINS } from '../../lib/roles';
import { playWindowsOf, describeWindow, fmtTime12, toMin, DOW_SHORT, DOW_ABBR } from '../../lib/availability';
import { Segmented } from '../../components/Segmented';
import { SectionLabel } from '../../components/SectionLabel';
import { Header } from '../../components/Header';
import { Field } from '../../components/Field';
import { Card, Eyebrow, DisplayCaps, SerifTitle, Chip, Avatar, RuleDivider, Watercolor, Icon, Button } from '../../components/ui';
import { flipHomeAway, type GeneratedSchedule } from '../../lib/scheduler';

export default function AdminConsole() {
  const T = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { app } = useApp();
  const [tab, setTab] = useState('season');

  return (
    <View style={{ flex: 1, backgroundColor: T.appBg, paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: 18, paddingTop: 12, paddingBottom: 4 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 }}>
          <TouchableOpacity onPress={async () => { await app.signOut(); router.replace('/(auth)/sign-in'); }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 10 }}>
            <Icon name="arrowRight" size={15} color={T.inkSoft} />
            <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(13), color: T.inkSoft }}>Sign out</Text>
          </TouchableOpacity>
        </View>
        <Segmented fullWidth value={tab} onChange={setTab} options={[
          { value: 'season', label: 'Season' },
          { value: 'codes', label: 'Team codes' },
          { value: 'users', label: 'Users' },
        ]} />
      </View>
      {tab === 'season' && <SeasonSetup />}
      {tab === 'codes' && <TeamCodes />}
      {tab === 'users' && <UsersByTeam />}
    </View>
  );
}

// ─── Weekly Push Button ───────────────────────────────────────────────────────

function WeeklyPushButton() {
  const T = useTheme();
  const { session } = useApp();
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent?: number; error?: string } | null>(null);

  const send = async () => {
    setSending(true);
    setResult(null);
    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/send-weekly-push`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
            'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
          },
          body: '{}',
        }
      );
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({ error: err.message });
    }
    setSending(false);
  };

  return (
    <View style={{ marginTop: 22 }}>
      <SectionLabel>Notifications</SectionLabel>
      <Card style={{ marginTop: 12, padding: 16 }}>
        <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: fs(14), color: T.inkSoft, lineHeight: 21 }}>
          Send a push notification to all players and captains with their weekly match details and outstanding items.
        </Text>
        {result && (
          <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name={result.error ? 'warn' : 'check'} size={14} color={result.error ? '#A0524A' : T.brand} />
            <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(12), color: result.error ? '#A0524A' : T.accent }}>
              {result.error || `Sent ${result.sent} notification${result.sent === 1 ? '' : 's'}`}
            </Text>
          </View>
        )}
        <View style={{ marginTop: 12 }}>
          <Button variant="primary" fullWidth disabled={sending} onPress={send}>
            <Icon name="sparkle" size={16} color={T.inkOnDeep} />
            <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.inkOnDeep }}>
              {sending ? 'Sending\u2026' : 'Send weekly notifications'}
            </Text>
          </Button>
        </View>
      </Card>
    </View>
  );
}

// ─── Schedule Builder ─────────────────────────────────────────────────────────

function ScheduleBuilder({ app, db }: { app: any; db: any }) {
  const T = useTheme();
  const [schedule, setSchedule] = useState<GeneratedSchedule | null>(null);
  // Selected team: { week, matchIdx, side: 'home'|'away' }
  const [selected, setSelected] = useState<{ week: number; idx: number; side: 'home' | 'away' } | null>(null);

  const teamName = (id: string) => db.TEAMS.find((t: any) => t.id === id)?.shortName || id;

  const generate = () => {
    const s = app.generateSchedule();
    setSchedule(s);
    setSelected(null);
  };

  const finalize = () => {
    if (schedule) {
      app.finalizeSchedule(schedule);
    }
  };

  const handleTeamPress = (weekIdx: number, matchIdx: number, side: 'home' | 'away') => {
    if (!selected) {
      setSelected({ week: weekIdx, idx: matchIdx, side });
      return;
    }
    // Tapped the same team — deselect
    if (selected.week === weekIdx && selected.idx === matchIdx && selected.side === side) {
      setSelected(null);
      return;
    }
    // Swap the two teams across the entire schedule
    if (schedule) {
      const teamA = schedule.weeks[selected.week][selected.idx][selected.side];
      const teamB = schedule.weeks[weekIdx][matchIdx][side];
      if (teamA === teamB) { setSelected(null); return; }

      const weeks = schedule.weeks.map(w => w.map(m => {
        const copy = { ...m };
        // Swap every occurrence of teamA and teamB
        if (copy.home === teamA) copy.home = teamB;
        else if (copy.home === teamB) copy.home = teamA;
        if (copy.away === teamA) copy.away = teamB;
        else if (copy.away === teamB) copy.away = teamA;
        return copy;
      }));
      setSchedule({ weeks });
    }
    setSelected(null);
  };

  const isTeamSelected = (weekIdx: number, matchIdx: number, side: 'home' | 'away') => {
    return selected?.week === weekIdx && selected?.idx === matchIdx && selected?.side === side;
  };

  if (!schedule) {
    return (
      <View style={{ marginTop: 22 }}>
        <SectionLabel>Schedule</SectionLabel>
        <Card style={{ marginTop: 12, padding: 18, alignItems: 'center' }}>
          <View style={{ width: 46, height: 46, borderRadius: 999, backgroundColor: T.surfaceAlt, borderWidth: 1, borderColor: T.borderStrong, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="calendar" size={20} color={T.inkSoft} />
          </View>
          <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: fs(14.5), color: T.inkSoft, textAlign: 'center', marginTop: 12, lineHeight: 22 }}>
            All eight teams are registered. Generate the season schedule to assign matchups for each week.
          </Text>
          <View style={{ marginTop: 16, width: '100%' }}>
            <Button variant="primary" fullWidth onPress={generate}>
              <Icon name="calendar" size={16} color={T.inkOnDeep} />
              <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.inkOnDeep }}>Generate schedule</Text>
            </Button>
          </View>
        </Card>
      </View>
    );
  }

  // Highlight the selected team id across the whole schedule
  const selectedTeamId = selected
    ? schedule.weeks[selected.week][selected.idx][selected.side]
    : null;

  return (
    <View style={{ marginTop: 22 }}>
      <SectionLabel action={
        <TouchableOpacity onPress={generate}>
          <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(10), letterSpacing: 1.2, textTransform: 'uppercase', color: T.brand }}>Regenerate</Text>
        </TouchableOpacity>
      }>Schedule preview</SectionLabel>

      <Card variant="quiet" style={{ marginTop: 12, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
        <Icon name="info" size={18} color={T.inkSoft} />
        <Text style={{ flex: 1, fontFamily: ALMA_FONTS.serif, fontSize: fs(13), color: T.inkSoft, lineHeight: 19 }}>
          Tap a team name to select it, then tap any other team to swap them throughout the schedule.
        </Text>
      </Card>

      {schedule.weeks.map((week, wi) => (
        <View key={wi} style={{ marginTop: 14 }}>
          <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: fs(12), letterSpacing: 2, textTransform: 'uppercase', color: T.ink, marginBottom: 8 }}>
            Week {wi + 1}
          </Text>
          <View style={{ gap: 6 }}>
            {week.map((m, mi) => (
              <View key={mi} style={{
                flexDirection: 'row', alignItems: 'center',
                borderRadius: 10, backgroundColor: T.surface,
                borderWidth: 1, borderColor: T.border,
                overflow: 'hidden',
              }}>
                <TeamButton
                  label={teamName(m.home)} sub="Home"
                  isSelected={isTeamSelected(wi, mi, 'home')}
                  isHighlighted={selectedTeamId === m.home && !isTeamSelected(wi, mi, 'home')}
                  onPress={() => handleTeamPress(wi, mi, 'home')}
                  align="left" T={T}
                />
                <Text style={{
                  fontFamily: ALMA_FONTS.serifItalic, fontSize: fs(12),
                  color: T.inkMute, paddingHorizontal: 2,
                }}>vs.</Text>
                <TeamButton
                  label={teamName(m.away)} sub="Away"
                  isSelected={isTeamSelected(wi, mi, 'away')}
                  isHighlighted={selectedTeamId === m.away && !isTeamSelected(wi, mi, 'away')}
                  onPress={() => handleTeamPress(wi, mi, 'away')}
                  align="right" T={T}
                />
              </View>
            ))}
          </View>
        </View>
      ))}

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 22 }}>
        <Button variant="secondary" fullWidth style={{ flex: 1 }} onPress={() => { setSchedule(null); setSelected(null); }}>
          <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.ink }}>Cancel</Text>
        </Button>
        <Button variant="primary" fullWidth style={{ flex: 1 }} onPress={finalize}>
          <Icon name="check" size={16} color={T.inkOnDeep} />
          <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.inkOnDeep }}>Finalize schedule</Text>
        </Button>
      </View>
    </View>
  );
}

function TeamButton({ label, sub, isSelected, isHighlighted, onPress, align, T }: {
  label: string; sub: string; isSelected: boolean; isHighlighted: boolean;
  onPress: () => void; align: 'left' | 'right'; T: any;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flex: 1, padding: 10,
        backgroundColor: isSelected ? T.brand : isHighlighted ? 'rgba(75,142,122,0.12)' : 'transparent',
        alignItems: align === 'right' ? 'flex-end' : 'flex-start',
      }}>
      <Text style={{
        fontFamily: ALMA_FONTS.serifSemiBold, fontSize: fs(13.5),
        color: isSelected ? T.inkOnDeep : T.ink,
      }}>
        {label}
      </Text>
      <Text style={{
        fontFamily: ALMA_FONTS.ui, fontSize: fs(9), letterSpacing: 1.2, textTransform: 'uppercase',
        color: isSelected ? 'rgba(239,234,217,0.7)' : T.inkMute, marginTop: 1,
      }}>{sub}</Text>
    </TouchableOpacity>
  );
}

// ─── Schedule Overview (post-finalization) ────────────────────────────────────

function ScheduleOverview({ db }: { db: any }) {
  const T = useTheme();
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);

  const teamName = (id: string) => db.TEAMS.find((t: any) => t.id === id)?.shortName || id;

  // Group matches by week, then by matchup (home+away pair)
  const weeks: Record<number, { home: string; away: string; tables: any[] }[]> = {};
  for (const m of db.MATCHES) {
    if (!weeks[m.week]) weeks[m.week] = [];
    const key = `${m.home}-${m.away}`;
    let matchup = weeks[m.week].find((mu: any) => `${mu.home}-${mu.away}` === key);
    if (!matchup) {
      matchup = { home: m.home, away: m.away, tables: [] };
      weeks[m.week].push(matchup);
    }
    matchup.tables.push(m);
  }

  const weekNums = Object.keys(weeks).map(Number).sort((a, b) => a - b);

  return (
    <View style={{ marginTop: 22 }}>
      <SectionLabel action={<Chip variant="success">
        <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(10), letterSpacing: 1.6, color: '#466357' }}>Live</Text>
      </Chip>}>Schedule</SectionLabel>

      {weekNums.map(w => {
        const matchups = weeks[w];
        const expanded = expandedWeek === w;
        const scored = matchups.every(mu => mu.tables.every((t: any) => t.status === 'final'));
        const partial = matchups.some(mu => mu.tables.some((t: any) => t.status === 'final'));

        return (
          <View key={w} style={{ marginTop: 10 }}>
            <TouchableOpacity
              onPress={() => setExpandedWeek(expanded ? null : w)}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                padding: 12, backgroundColor: T.surface,
                borderWidth: 1, borderColor: T.border,
                borderRadius: expanded ? 0 : 10,
                borderTopLeftRadius: 10, borderTopRightRadius: 10,
              }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: fs(13), letterSpacing: 2, color: T.ink }}>
                  Week {w}
                </Text>
                {scored && <Icon name="check" size={14} color={T.brand} />}
                {!scored && partial && <Chip variant="warn"><Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(8), letterSpacing: 1, color: '#7E6537' }}>In progress</Text></Chip>}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(11), color: T.inkSoft }}>
                  {matchups.length} matchups
                </Text>
                <Icon name={expanded ? 'chevronDown' : 'chevronRight'} size={16} color={T.inkSoft} />
              </View>
            </TouchableOpacity>

            {expanded && (
              <View style={{
                backgroundColor: T.surface, borderWidth: 1, borderTopWidth: 0, borderColor: T.border,
                borderBottomLeftRadius: 10, borderBottomRightRadius: 10,
                padding: 12, gap: 8,
              }}>
                {matchups.map((mu, mi) => {
                  const allFinal = mu.tables.every((t: any) => t.status === 'final');
                  const homeTotal = mu.tables.reduce((s: number, t: any) => s + (t.result?.home || 0), 0);
                  const awayTotal = mu.tables.reduce((s: number, t: any) => s + (t.result?.away || 0), 0);

                  return (
                    <View key={mi} style={{
                      padding: 10, backgroundColor: T.surfaceAlt, borderRadius: 8, gap: 4,
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: fs(14), color: T.ink }}>
                            {teamName(mu.home)}
                          </Text>
                          <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(9), letterSpacing: 1, color: T.inkMute, textTransform: 'uppercase' }}>Home</Text>
                        </View>
                        <View style={{ alignItems: 'center', paddingHorizontal: 10 }}>
                          {allFinal ? (
                            <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: fs(16), color: T.ink }}>
                              {homeTotal} – {awayTotal}
                            </Text>
                          ) : (
                            <Text style={{ fontFamily: ALMA_FONTS.serifItalic, fontSize: fs(12), color: T.inkMute }}>vs.</Text>
                          )}
                        </View>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                          <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: fs(14), color: T.ink }}>
                            {teamName(mu.away)}
                          </Text>
                          <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(9), letterSpacing: 1, color: T.inkMute, textTransform: 'uppercase' }}>Away</Text>
                        </View>
                      </View>
                      {/* Individual table scores */}
                      {allFinal && (
                        <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                          {mu.tables.sort((a: any, b: any) => a.table - b.table).map((t: any) => (
                            <View key={t.id} style={{
                              flex: 1, paddingVertical: 4, backgroundColor: T.surface,
                              borderRadius: 4, alignItems: 'center',
                            }}>
                              <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(8), letterSpacing: 1, color: T.inkMute }}>TBL {t.table}</Text>
                              <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(11), color: T.ink }}>{t.result?.home}–{t.result?.away}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

// ─── Season Setup ────────────────────────────────────────────────────────────

function SeasonSetup() {
  const T = useTheme();
  const { db, app } = useApp();
  const S = db.SEASON;
  const [phase, setPhase] = useState<'idle' | 'wizard' | 'live'>(S.published ? 'live' : 'idle');
  const [step, setStep] = useState(1);
  const [seasonName, setSeasonName] = useState(S.name || '');
  const [startDate, setStartDate] = useState(S.startDate || '');
  const [showConfirm, setShowConfirm] = useState(false);
  const [windows, setWindows] = useState(() =>
    (playWindowsOf(db).length ? playWindowsOf(db) : [{ id: 'pw1', days: [2, 3], start: '09:00', end: '15:00' }])
      .map(w => ({ ...w, days: [...w.days] }))
  );

  const nameValid = seasonName.trim().length > 0 && startDate.length > 0;
  const windowsValid = windows.length > 0 && windows.every(w => w.days.length > 0 && toMin(w.start) < toMin(w.end));
  const teamCount = db.TEAMS.length;

  const generate = () => {
    app.publishSeason({ windows, name: seasonName.trim(), startDate, weekCount: 8 });
    setPhase('live');
  };

  if (phase === 'idle') {
    return (
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 120 }}>
        <Eyebrow>Calendar</Eyebrow>
        <SerifTitle size={24} italic style={{ marginTop: 6 }}>No season on the calendar.</SerifTitle>
        <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: fs(14), color: T.inkSoft, marginTop: 6, lineHeight: 21 }}>
          A season runs eight weeks. Setting one up takes two steps: name it and pick the opening week, then set the play windows.
        </Text>
        <Card variant="tinted" style={{ marginTop: 18, padding: 22, alignItems: 'center' }}>
          <View style={{ width: 46, height: 46, borderRadius: 999, backgroundColor: T.surface, borderWidth: 1, borderColor: T.borderStrong, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="calendar" size={20} color={T.inkSoft} />
          </View>
          <Text style={{ fontFamily: ALMA_FONTS.serifItalic, fontSize: fs(15), color: T.inkSoft, marginTop: 12, textAlign: 'center', lineHeight: 22 }}>
            Eight weeks · three tables a week · eight teams
          </Text>
          <View style={{ marginTop: 16, width: '100%' }}>
            <Button variant="primary" fullWidth onPress={() => { setStep(1); setPhase('wizard'); }}>
              <Icon name="plus" size={16} color={T.inkOnDeep} />
              <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.inkOnDeep }}>Create new season</Text>
            </Button>
          </View>
        </Card>
      </ScrollView>
    );
  }

  if (phase === 'wizard') {
    return (
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 120 }}>
        {/* Progress */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(10), letterSpacing: 2, textTransform: 'uppercase', color: T.accent }}>
            New season · Step {step} of 2
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: T.border }} />
        </View>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
          {[1, 2].map(n => (
            <View key={n} style={{ flex: 1, height: 4, borderRadius: 999, backgroundColor: n <= step ? T.brand : T.borderStrong }} />
          ))}
        </View>

        {step === 1 ? (
          <View style={{ marginTop: 14 }}>
            <SerifTitle size={23} italic>Name it and pick the opening week.</SerifTitle>
            <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: fs(14), color: T.inkSoft, marginTop: 6, lineHeight: 21 }}>
              The remaining seven weeks roll out from there on a seven-day cadence.
            </Text>
            <Card style={{ marginTop: 16, padding: 16, gap: 16 }}>
              <Field label="Season name" value={seasonName} onChange={setSeasonName} placeholder="Winter 2027" />
              <StartDatePicker value={startDate} onChange={setStartDate} />
            </Card>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
              <Button variant="secondary" fullWidth style={{ flex: 1 }} onPress={() => setPhase('idle')}>
                <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.ink }}>Cancel</Text>
              </Button>
              <Button variant="primary" fullWidth style={{ flex: 1 }} disabled={!nameValid} onPress={() => setStep(2)}>
                <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.inkOnDeep }}>Continue</Text>
                <Icon name="chevronRight" size={15} color={T.inkOnDeep} />
              </Button>
            </View>
          </View>
        ) : (
          <View style={{ marginTop: 14 }}>
            <SerifTitle size={23} italic>When may tables be played?</SerifTitle>
            <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: fs(14), color: T.inkSoft, marginTop: 6, lineHeight: 21 }}>
              Set the weekly days and hours open for play. Every member answers these yes or no for each of the eight weeks.
            </Text>
            <View style={{ gap: 12, marginTop: 14 }}>
              {windows.map((w, i) => (
                <PlayWindowCard key={w.id} w={w} i={i} windows={windows}
                  onPatch={(next) => setWindows(windows.map((ww, k) => k === i ? { ...ww, ...next } : ww))}
                  onRemove={() => setWindows(windows.filter((_, k) => k !== i))} />
              ))}
            </View>
            {windows.length < 3 && (
              <View style={{ marginTop: 12 }}>
                <Button variant="secondary" fullWidth onPress={() => setWindows([...windows, { id: `w${Date.now()}`, days: [4], start: '18:00', end: '21:00' }])}>
                  <Icon name="plus" size={15} color={T.ink} />
                  <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.ink }}>Add another window</Text>
                </Button>
              </View>
            )}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
              <Button variant="secondary" fullWidth style={{ flex: 1 }} onPress={() => setStep(1)}>
                <Icon name="chevronLeft" size={15} color={T.ink} />
                <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.ink }}>Back</Text>
              </Button>
              <Button variant="primary" fullWidth style={{ flex: 1 }} disabled={!windowsValid} onPress={() => setShowConfirm(true)}>
                <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.inkOnDeep }}>Publish season</Text>
              </Button>
            </View>
          </View>
        )}

        {/* Confirmation modal */}
        {showConfirm && (
          <Modal visible transparent animationType="slide" onRequestClose={() => setShowConfirm(false)}>
            <TouchableOpacity activeOpacity={1} onPress={() => setShowConfirm(false)}
              style={{ flex: 1, backgroundColor: 'rgba(15,34,48,0.55)', justifyContent: 'flex-end' }}>
              <TouchableOpacity activeOpacity={1} onPress={() => {}} style={{
                backgroundColor: T.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
                paddingHorizontal: 22, paddingTop: 20, paddingBottom: 40,
              }}>
                <View style={{ width: 36, height: 4, borderRadius: 999, backgroundColor: T.borderStrong, alignSelf: 'center', marginBottom: 18 }} />
                <SerifTitle size={22} italic>Publish this season?</SerifTitle>
                <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: fs(14), color: T.inkSoft, marginTop: 8, lineHeight: 21 }}>
                  Once a season is published it cannot be reset or changed until it finishes. Play windows, start date, and season name will be locked in.
                </Text>
                <Card variant="tinted" style={{ marginTop: 14, padding: 12, flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                  <Icon name="warn" size={16} color="#A0524A" />
                  <Text style={{ flex: 1, fontFamily: ALMA_FONTS.ui, fontSize: fs(12), color: '#A0524A', lineHeight: 18 }}>
                    This action cannot be undone from the app. Make sure all details are correct before proceeding.
                  </Text>
                </Card>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
                  <Button variant="secondary" fullWidth style={{ flex: 1 }} onPress={() => setShowConfirm(false)}>
                    <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.ink }}>Go back</Text>
                  </Button>
                  <Button variant="primary" fullWidth style={{ flex: 1 }} onPress={() => { setShowConfirm(false); generate(); }}>
                    <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.inkOnDeep }}>Publish season</Text>
                  </Button>
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
        )}
      </ScrollView>
    );
  }

  // Live season
  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 120 }}>
      <Eyebrow>Season</Eyebrow>
      <SerifTitle size={24} italic style={{ marginTop: 6 }}>{S.name || seasonName}</SerifTitle>

      <Card variant="tinted" style={{ marginTop: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Icon name="check" size={16} color={T.brand} />
        <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(12), color: T.inkSoft }}>
          Season published · {S.weekCount || 8} weeks
        </Text>
      </Card>

      {/* Play windows */}
      <Card variant="quiet" style={{ marginTop: 12, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
        <Icon name="clock" size={18} color={T.inkSoft} />
        <View>
          <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(10), letterSpacing: 2, textTransform: 'uppercase', color: T.inkSoft }}>
            League play windows
          </Text>
          <View style={{ gap: 3, marginTop: 5 }}>
            {playWindowsOf(db).map(w => (
              <Text key={w.id} style={{ fontFamily: ALMA_FONTS.serif, fontSize: fs(13.5), color: T.ink, lineHeight: 19 }}>{describeWindow(w)}</Text>
            ))}
          </View>
        </View>
      </Card>

      {/* Registration */}
      <View style={{ marginTop: 22 }}>
        <SectionLabel action={<Chip variant={teamCount >= 8 ? 'success' : 'warn'}>
          <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(10), letterSpacing: 1.6, color: teamCount >= 8 ? '#466357' : '#7E6537' }}>{teamCount}/8 teams</Text>
        </Chip>}>Registration</SectionLabel>
        <Card style={{ marginTop: 12, padding: 16 }}>
          <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: fs(14.5), color: T.inkSoft, lineHeight: 22 }}>
            {teamCount >= 8
              ? 'All eight teams have registered.'
              : 'Send each team its code so paid members can join a roster.'}
          </Text>
          <View style={{ flexDirection: 'row', gap: 5, marginTop: 12 }}>
            {Array.from({ length: 8 }, (_, i) => (
              <View key={i} style={{ flex: 1, height: 6, borderRadius: 999, backgroundColor: i < teamCount ? T.brand : T.borderStrong }} />
            ))}
          </View>
        </Card>
      </View>

      {/* Schedule */}
      {teamCount >= 8 && !S.scheduleFinalized && (
        <ScheduleBuilder app={app} db={db} />
      )}
      {S.scheduleFinalized && (
        <ScheduleOverview db={db} />
      )}

      {/* Payments */}
      <View style={{ marginTop: 22 }}>
        <SectionLabel>Payments</SectionLabel>
        <Card style={{ marginTop: 12, padding: 0, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: T.surfaceTint, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="creditCard" size={17} color={T.ink} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: fs(15), color: T.ink }}>Open the Square dashboard</Text>
              <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(11), color: T.inkSoft, marginTop: 2, lineHeight: 17 }}>
                Dues, receipts, refunds, and payout reports live in Square.
              </Text>
            </View>
            <Icon name="arrowRight" size={16} color={T.inkSoft} />
          </View>
        </Card>
      </View>

    </ScrollView>
  );
}

function StartDatePicker({ value, onChange }: { value: string; onChange: (d: string) => void }) {
  const T = useTheme();
  const today = new Date();

  // Start calendar from the 1st of the current month, show 3 months
  const [monthOffset, setMonthOffset] = useState(0);
  const baseMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = baseMonth.getFullYear();
  const month = baseMonth.getMonth();
  const monthName = baseMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Days of week header
  const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Build calendar grid
  const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  // Determine which week row is selected (the row containing the selected Monday)
  const selectedDate = value ? new Date(value + 'T00:00:00') : null;
  const selectedWeekEnd = selectedDate ? new Date(selectedDate.getTime() + 6 * 86400000) : null;

  const toIso = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  // Find the Monday of the week containing a given day
  const mondayOf = (day: number) => {
    const d = new Date(year, month, day);
    const dow = d.getDay();
    const mon = new Date(d);
    mon.setDate(mon.getDate() - ((dow + 6) % 7)); // shift so Mon=0
    return mon;
  };

  const selectWeek = (day: number) => {
    const mon = mondayOf(day);
    // Don't allow past weeks
    if (mon.getTime() < today.getTime() - 86400000) return;
    const iso = `${mon.getFullYear()}-${String(mon.getMonth() + 1).padStart(2, '0')}-${String(mon.getDate()).padStart(2, '0')}`;
    onChange(iso);
  };

  const isInSelectedWeek = (day: number | null) => {
    if (!day || !selectedDate || !selectedWeekEnd) return false;
    const d = new Date(year, month, day);
    return d >= selectedDate && d <= selectedWeekEnd;
  };

  const isMonday = (day: number) => new Date(year, month, day).getDay() === 1;
  const isSunday = (day: number) => new Date(year, month, day).getDay() === 0;
  const isPast = (day: number) => {
    const mon = mondayOf(day);
    return mon.getTime() < today.getTime() - 86400000;
  };

  return (
    <View>
      <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(10), letterSpacing: 2, textTransform: 'uppercase', color: T.inkSoft, marginBottom: 10 }}>
        Opening week
      </Text>

      {/* Month navigation */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <TouchableOpacity onPress={() => setMonthOffset(monthOffset - 1)} style={{ padding: 6 }}>
          <Icon name="chevronLeft" size={18} color={T.inkSoft} />
        </TouchableOpacity>
        <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: fs(16), color: T.ink }}>{monthName}</Text>
        <TouchableOpacity onPress={() => setMonthOffset(monthOffset + 1)} style={{ padding: 6 }}>
          <Icon name="chevronRight" size={18} color={T.inkSoft} />
        </TouchableOpacity>
      </View>

      {/* Day headers */}
      <View style={{ flexDirection: 'row' }}>
        {dayHeaders.map((d, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center', paddingBottom: 6 }}>
            <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(10), letterSpacing: 1, color: T.inkMute }}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      {Array.from({ length: cells.length / 7 }, (_, row) => {
        const weekCells = cells.slice(row * 7, row * 7 + 7);
        const hasSelected = weekCells.some(d => d && isInSelectedWeek(d));
        return (
          <View key={row} style={{
            flexDirection: 'row',
            backgroundColor: hasSelected ? 'rgba(27,94,107,0.10)' : 'transparent',
            borderRadius: 8,
            marginVertical: 1,
          }}>
            {weekCells.map((day, col) => {
              const selected = day ? isInSelectedWeek(day) : false;
              const past = day ? isPast(day) : false;
              const isStart = day ? isMonday(day) && selected : false;
              const isEnd = day ? isSunday(day) && selected : false;
              return (
                <TouchableOpacity
                  key={col}
                  activeOpacity={0.7}
                  disabled={!day || past}
                  onPress={() => day && selectWeek(day)}
                  style={{
                    flex: 1, alignItems: 'center', justifyContent: 'center',
                    paddingVertical: 8,
                    backgroundColor: isStart ? T.brand : 'transparent',
                    borderTopLeftRadius: isStart ? 8 : 0,
                    borderBottomLeftRadius: isStart ? 8 : 0,
                    borderTopRightRadius: isEnd ? 8 : 0,
                    borderBottomRightRadius: isEnd ? 8 : 0,
                  }}>
                  <Text style={{
                    fontFamily: ALMA_FONTS.ui, fontSize: fs(14),
                    color: !day ? 'transparent'
                      : isStart ? T.inkOnDeep
                      : selected ? T.brand
                      : past ? T.inkMute
                      : T.ink,
                  }}>{day || ''}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      })}

      {/* Selected label */}
      {selectedDate && (
        <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon name="calendar" size={14} color={T.brand} />
          <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(12), color: T.inkSoft }}>
            Starts {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </Text>
        </View>
      )}
    </View>
  );
}

function PlayWindowCard({ w, i, windows, onPatch, onRemove }: { w: any; i: number; windows: any[]; onPatch: (next: any) => void; onRemove: () => void }) {
  const T = useTheme();
  const badTime = toMin(w.start) >= toMin(w.end);
  const toggleDay = (d: number) => {
    const days = w.days.includes(d) ? w.days.filter((x: number) => x !== d) : [...w.days, d].sort((a: number, b: number) => a - b);
    onPatch({ days });
  };

  return (
    <Card style={{ padding: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(10), letterSpacing: 2, textTransform: 'uppercase', color: T.inkSoft }}>
          Window {i + 1}
        </Text>
        {windows.length > 1 && (
          <TouchableOpacity onPress={onRemove}>
            <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(10.5), letterSpacing: 1.2, textTransform: 'uppercase', color: '#A0524A' }}>Remove</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
        {DOW_SHORT.map((d, di) => {
          const on = w.days.includes(di);
          return (
            <TouchableOpacity key={di} onPress={() => toggleDay(di)} activeOpacity={0.7} style={{
              flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
              backgroundColor: on ? T.brand : T.surfaceAlt,
              borderWidth: 1, borderColor: on ? T.brand : T.border,
            }}>
              <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: fs(13), color: on ? T.inkOnDeep : T.inkSoft }}>{d}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
        <Field label="Opens" value={w.start} onChange={v => onPatch({ start: v })} style={{ flex: 1 }} />
        <Field label="Closes" value={w.end} onChange={v => onPatch({ end: v })} style={{ flex: 1 }} />
      </View>
      <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: T.border, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Icon name="clock" size={14} color={badTime || !w.days.length ? '#A0524A' : T.inkSoft} />
        <Text style={{ flex: 1, fontFamily: ALMA_FONTS.serifItalic, fontSize: fs(13.5), color: badTime || !w.days.length ? '#A0524A' : T.inkSoft }}>
          {!w.days.length ? 'Choose at least one day.' : badTime ? 'Closing time must come after opening.' : describeWindow(w)}
        </Text>
      </View>
    </Card>
  );
}

// ─── Team Codes ──────────────────────────────────────────────────────────────


function TeamCodes() {
  const T = useTheme();
  const { db, app } = useApp();
  const codes = db.TEAM_CODES || {};
  const [adding, setAdding] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [shortName, setShortName] = useState('');
  const [homeVenue, setHomeVenue] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const canCreate = teamName.trim().length > 0 && shortName.trim().length > 0;

  const handleCreate = async () => {
    setCreating(true);
    setCreateError('');
    const { error } = await app.createTeam(teamName.trim(), shortName.trim(), homeVenue.trim());
    setCreating(false);
    if (error) { setCreateError(error); return; }
    setTeamName('');
    setShortName('');
    setHomeVenue('');
    setAdding(false);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 120 }}>
      <Eyebrow>Invitations</Eyebrow>
      <SerifTitle size={24} italic style={{ marginTop: 6 }}>One code per team.</SerifTitle>
      <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: fs(14), color: T.inkSoft, marginTop: 6, lineHeight: 21 }}>
        Send a member her team's code once her dues are paid.
      </Text>

      {/* Add team form — only before schedule is finalized */}
      {!db.SEASON.scheduleFinalized && adding ? (
        <Card style={{ marginTop: 18, padding: 16, gap: 12 }}>
          <Eyebrow>New team</Eyebrow>
          <Field label="Team name" value={teamName} onChange={setTeamName} placeholder="e.g. Jade Sparrows" />
          <Field label="Short name" value={shortName} onChange={setShortName} placeholder="e.g. Sparrows" />
          <Field label="Home venue" value={homeVenue} onChange={setHomeVenue} placeholder="e.g. Cherokee Town Club" />
          {createError ? <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(12), color: '#A0524A' }}>{createError}</Text> : null}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
            <Button variant="secondary" fullWidth style={{ flex: 1 }} onPress={() => { setAdding(false); setCreateError(''); }}>
              <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.ink }}>Cancel</Text>
            </Button>
            <Button variant="primary" fullWidth style={{ flex: 1 }} disabled={!canCreate || creating} onPress={handleCreate}>
              <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.inkOnDeep }}>
                {creating ? 'Creating\u2026' : 'Create team'}
              </Text>
            </Button>
          </View>
        </Card>
      ) : !db.SEASON.scheduleFinalized ? (
        <View style={{ marginTop: 18 }}>
          <Button variant="secondary" fullWidth onPress={() => setAdding(true)}>
            <Icon name="plus" size={16} color={T.ink} />
            <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.ink }}>Add team</Text>
          </Button>
        </View>
      ) : null}

      <View style={{ gap: 10, marginTop: 18 }}>
        {db.TEAMS.map(t => {
          const n = t.roster.length;
          return (
            <Card key={t.id} style={{ padding: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(10), letterSpacing: 1.6, textTransform: 'uppercase', color: T.inkSoft }}>{t.name}</Text>
                  <Text style={{
                    fontFamily: ALMA_FONTS.display, fontSize: fs(19), letterSpacing: 2, color: T.ink, marginTop: 3,
                  }}>{codes[t.id]}</Text>
                </View>
                <Chip variant="success">
                  <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(10), letterSpacing: 1.6, color: '#466357' }}>
                    {n} {n === 1 ? 'player' : 'players'}
                  </Text>
                </Chip>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
                <Text style={{ flex: 1, fontFamily: ALMA_FONTS.ui, fontSize: fs(11), color: T.inkSoft }}>
                  {n === 0 ? 'No players yet' : `${n} on the roster`}
                </Text>
                <Button variant="secondary" size="sm">
                  <Icon name="copy" size={13} color={T.ink} />
                  <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(12), color: T.ink }}>Copy code</Text>
                </Button>
              </View>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

// ─── Users by Team ───────────────────────────────────────────────────────────

function UsersByTeam() {
  const T = useTheme();
  const { db, app } = useApp();
  const teams = db.TEAMS.map(t => ({ id: t.id, name: t.name, shortName: t.shortName, captains: captainIdsOf(t), roster: [...t.roster] }));
  const [confirm, setConfirm] = useState<any>(null);

  const assigned = new Set(teams.flatMap(t => t.roster));
  const unassigned = Object.values(db.PEOPLE)
    .filter(p => !assigned.has(p.id) && !p.title && !p.sub);

  const totalUsers = teams.reduce((n, t) => n + t.roster.length, 0);

  const doDelete = (teamId: string, uid: string) => {
    app.removeFromTeam(teamId, uid);
  };
  const doPromote = (teamId: string, uid: string) => {
    app.promoteToCapt(teamId, uid);
  };
  const doDemote = (teamId: string, uid: string) => {
    app.demoteFromCapt(teamId, uid);
  };

  const execConfirm = () => {
    if (!confirm) return;
    if (confirm.type === 'delete') doDelete(confirm.team.id, confirm.user.id);
    else if (confirm.type === 'promote') doPromote(confirm.team.id, confirm.user.id);
    else if (confirm.type === 'demote') doDemote(confirm.team.id, confirm.user.id);
    setConfirm(null);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 120 }}>
        <Eyebrow>Accounts</Eyebrow>
        <SerifTitle size={24} italic style={{ marginTop: 6 }}>Members by team.</SerifTitle>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <MiniStat label="Teams" value={teams.length} />
          <MiniStat label="Members" value={totalUsers} />
        </View>

        <View style={{ gap: 16, marginTop: 20 }}>
          {teams.map(team => {
            const ordered = [...team.captains, ...team.roster.filter(u => !team.captains.includes(u))]
              .map(uid => db.PEOPLE[uid]).filter(Boolean);
            const capsFull = team.captains.length >= MAX_CAPTAINS;

            return (
              <View key={team.id}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, paddingHorizontal: 2 }}>
                  <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: fs(13), letterSpacing: 1.6, textTransform: 'uppercase', color: T.ink }}>{team.name}</Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: T.border }} />
                  <Chip variant="default"><Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(10), letterSpacing: 1.6, color: T.ink }}>{ordered.length}</Text></Chip>
                </View>
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                  {ordered.map((p, pi) => {
                    const isCap = team.captains.includes(p.id);
                    return (
                      <View key={p.id} style={{
                        flexDirection: 'row', alignItems: 'center', gap: 12,
                        paddingVertical: 11, paddingHorizontal: 14,
                        borderTopWidth: pi ? 1 : 0, borderTopColor: T.border,
                      }}>
                        <Avatar initials={p.initials} tile={p.tile} size={38} tint={p.tint} />
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: fs(15), color: T.ink }} numberOfLines={1}>{p.name}</Text>
                            {isCap && <Chip variant="accent"><Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(8), letterSpacing: 1.2, color: '#6E4234' }}>Captain</Text></Chip>}
                          </View>
                          <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(11), color: T.inkSoft, marginTop: 2 }}>
                            {isCap ? 'Team captain' : 'Player'}
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 4 }}>
                          {!isCap && !capsFull && (
                            <IconBtn name="star" onPress={() => setConfirm({ type: 'promote', team, user: p })} />
                          )}
                          {isCap && team.captains.length > 1 && (
                            <IconBtn name="minus" onPress={() => setConfirm({ type: 'demote', team, user: p })} />
                          )}
                          <IconBtn name="x" danger onPress={() => setConfirm({ type: 'delete', team, user: p })} />
                        </View>
                      </View>
                    );
                  })}
                </Card>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Confirm sheet */}
      {confirm && (
        <Modal visible transparent animationType="slide" onRequestClose={() => setConfirm(null)}>
          <TouchableOpacity activeOpacity={1} onPress={() => setConfirm(null)}
            style={{ flex: 1, backgroundColor: 'rgba(15,34,48,0.55)', justifyContent: 'flex-end' }}>
            <TouchableOpacity activeOpacity={1} onPress={() => {}} style={{
              backgroundColor: T.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
              paddingHorizontal: 22, paddingTop: 20, paddingBottom: 40,
            }}>
              <View style={{ width: 36, height: 4, borderRadius: 999, backgroundColor: T.borderStrong, alignSelf: 'center', marginBottom: 18 }} />
              <SerifTitle size={22} italic>
                {confirm.type === 'delete' ? `Remove ${confirm.user.name}?`
                  : confirm.type === 'demote' ? `${confirm.user.name} steps down?`
                  : `Make ${confirm.user.name} a captain?`}
              </SerifTitle>
              <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: fs(14), color: T.inkSoft, marginTop: 8, lineHeight: 21 }}>
                {confirm.type === 'delete' ? 'Her account will be removed. She would need to sign up again to rejoin.'
                  : confirm.type === 'demote' ? `She keeps her seat on ${confirm.team.name} as a player.`
                  : `She'll share every captain power on ${confirm.team.name}. A team may carry two captains at most.`}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
                <Button variant="secondary" fullWidth style={{ flex: 1 }} onPress={() => setConfirm(null)}>
                  <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.ink }}>Cancel</Text>
                </Button>
                <Button variant={confirm.type === 'promote' ? 'primary' : 'danger'} fullWidth style={{ flex: 1 }} onPress={execConfirm}>
                  <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: confirm.type === 'promote' ? T.inkOnDeep : '#A0524A' }}>
                    {confirm.type === 'delete' ? 'Remove' : confirm.type === 'demote' ? 'Step down' : 'Add captain'}
                  </Text>
                </Button>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  const T = useTheme();
  return (
    <View style={{
      flex: 1, paddingVertical: 12, paddingHorizontal: 8, backgroundColor: T.surface,
      borderWidth: 1, borderColor: T.border, borderRadius: T.radius, alignItems: 'center',
      ...(T.shadowSm as any),
    }}>
      <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: fs(22), color: T.ink }}>{value}</Text>
      <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(9), letterSpacing: 1.6, textTransform: 'uppercase', color: T.inkSoft, marginTop: 3 }}>{label}</Text>
    </View>
  );
}

function IconBtn({ name, onPress, danger }: { name: string; onPress: () => void; danger?: boolean }) {
  const T = useTheme();
  return (
    <TouchableOpacity onPress={onPress} style={{
      width: 32, height: 32, borderRadius: 999,
      borderWidth: 1, borderColor: danger ? 'rgba(160,82,74,0.35)' : T.border,
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon name={name} size={15} color={danger ? '#A0524A' : T.inkSoft} />
    </TouchableOpacity>
  );
}
