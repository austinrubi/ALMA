import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme, ALMA_FONTS } from '../../lib/theme';
import { useApp } from '../../lib/AppContext';
import { captainIdsOf, isCaptainOf, MAX_CAPTAINS } from '../../lib/roles';
import { playWindowsOf, describeWindow, fmtTime12, toMin, DOW_SHORT, DOW_ABBR } from '../../lib/availability';
import { Segmented } from '../../components/Segmented';
import { SectionLabel } from '../../components/SectionLabel';
import { Header } from '../../components/Header';
import { Field } from '../../components/Field';
import { Card, Eyebrow, DisplayCaps, SerifTitle, Chip, Avatar, RuleDivider, Watercolor, Icon, Button } from '../../components/ui';

export default function AdminConsole() {
  const T = useTheme();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState('season');

  return (
    <View style={{ flex: 1, backgroundColor: T.appBg, paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: 18, paddingTop: 12, paddingBottom: 4 }}>
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

// ─── Season Setup ────────────────────────────────────────────────────────────

function SeasonSetup() {
  const T = useTheme();
  const { db, app } = useApp();
  const S = db.SEASON;
  const [phase, setPhase] = useState<'idle' | 'wizard' | 'live'>(S.published ? 'live' : 'idle');
  const [step, setStep] = useState(1);
  const [seasonName, setSeasonName] = useState(S.name || '');
  const [windows, setWindows] = useState(() =>
    (playWindowsOf(db).length ? playWindowsOf(db) : [{ id: 'pw1', days: [2, 3], start: '09:00', end: '15:00' }])
      .map(w => ({ ...w, days: [...w.days] }))
  );

  const nameValid = seasonName.trim().length > 0;
  const windowsValid = windows.length > 0 && windows.every(w => w.days.length > 0 && toMin(w.start) < toMin(w.end));
  const teamCount = db.TEAMS.length;

  const generate = () => {
    app.publishSeason({ windows, name: seasonName.trim(), startDate: S.startDate || '2026-04-28', weekCount: 8 });
    setPhase('live');
  };

  if (phase === 'idle') {
    return (
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 120 }}>
        <Eyebrow>Calendar</Eyebrow>
        <SerifTitle size={24} italic style={{ marginTop: 6 }}>No season on the calendar.</SerifTitle>
        <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: 14, color: T.inkSoft, marginTop: 6, lineHeight: 21 }}>
          A season runs eight weeks. Setting one up takes two steps: name it and pick the opening week, then set the play windows.
        </Text>
        <Card variant="tinted" style={{ marginTop: 18, padding: 22, alignItems: 'center' }}>
          <View style={{ width: 46, height: 46, borderRadius: 999, backgroundColor: T.surface, borderWidth: 1, borderColor: T.borderStrong, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="calendar" size={20} color={T.inkSoft} />
          </View>
          <Text style={{ fontFamily: ALMA_FONTS.serifItalic, fontSize: 15, color: T.inkSoft, marginTop: 12, textAlign: 'center', lineHeight: 22 }}>
            Eight weeks · four tables a week · eight teams
          </Text>
          <View style={{ marginTop: 16, width: '100%' }}>
            <Button variant="primary" fullWidth onPress={() => { setStep(1); setPhase('wizard'); }}>
              <Icon name="plus" size={16} color={T.inkOnDeep} />
              <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 14, color: T.inkOnDeep }}>Create new season</Text>
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
          <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: T.accent }}>
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
            <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: 14, color: T.inkSoft, marginTop: 6, lineHeight: 21 }}>
              The remaining seven weeks roll out from there on a seven-day cadence.
            </Text>
            <Card style={{ marginTop: 16, padding: 16 }}>
              <Field label="Season name" value={seasonName} onChange={setSeasonName} placeholder="Winter 2027" />
            </Card>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
              <Button variant="secondary" fullWidth style={{ flex: 1 }} onPress={() => setPhase('idle')}>
                <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 14, color: T.ink }}>Cancel</Text>
              </Button>
              <Button variant="primary" fullWidth style={{ flex: 1 }} disabled={!nameValid} onPress={() => setStep(2)}>
                <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 14, color: T.inkOnDeep }}>Continue</Text>
                <Icon name="chevronRight" size={15} color={T.inkOnDeep} />
              </Button>
            </View>
          </View>
        ) : (
          <View style={{ marginTop: 14 }}>
            <SerifTitle size={23} italic>When may tables be played?</SerifTitle>
            <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: 14, color: T.inkSoft, marginTop: 6, lineHeight: 21 }}>
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
                  <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 14, color: T.ink }}>Add another window</Text>
                </Button>
              </View>
            )}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
              <Button variant="secondary" fullWidth style={{ flex: 1 }} onPress={() => setStep(1)}>
                <Icon name="chevronLeft" size={15} color={T.ink} />
                <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 14, color: T.ink }}>Back</Text>
              </Button>
              <Button variant="primary" fullWidth style={{ flex: 1 }} disabled={!windowsValid} onPress={generate}>
                <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 14, color: T.inkOnDeep }}>Generate season</Text>
              </Button>
            </View>
          </View>
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
        <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 12, color: T.inkSoft }}>
          Season published · {S.weekCount || 8} weeks
        </Text>
      </Card>

      {/* Play windows */}
      <Card variant="quiet" style={{ marginTop: 12, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
        <Icon name="clock" size={18} color={T.inkSoft} />
        <View>
          <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: T.inkSoft }}>
            League play windows
          </Text>
          <View style={{ gap: 3, marginTop: 5 }}>
            {playWindowsOf(db).map(w => (
              <Text key={w.id} style={{ fontFamily: ALMA_FONTS.serif, fontSize: 13.5, color: T.ink, lineHeight: 19 }}>{describeWindow(w)}</Text>
            ))}
          </View>
        </View>
      </Card>

      {/* Registration */}
      <View style={{ marginTop: 22 }}>
        <SectionLabel action={<Chip variant={teamCount >= 8 ? 'success' : 'warn'}>
          <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 10, letterSpacing: 1.6, color: teamCount >= 8 ? '#466357' : '#7E6537' }}>{teamCount}/8 teams</Text>
        </Chip>}>Registration</SectionLabel>
        <Card style={{ marginTop: 12, padding: 16 }}>
          <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: 14.5, color: T.inkSoft, lineHeight: 22 }}>
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

      {/* Payments */}
      <View style={{ marginTop: 22 }}>
        <SectionLabel>Payments</SectionLabel>
        <Card style={{ marginTop: 12, padding: 0, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: T.surfaceTint, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="creditCard" size={17} color={T.ink} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: 15, color: T.ink }}>Open the Square dashboard</Text>
              <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 11, color: T.inkSoft, marginTop: 2, lineHeight: 17 }}>
                Dues, receipts, refunds, and payout reports live in Square.
              </Text>
            </View>
            <Icon name="arrowRight" size={16} color={T.inkSoft} />
          </View>
        </Card>
      </View>

      <TouchableOpacity onPress={() => { setStep(1); setPhase('wizard'); }} style={{ alignItems: 'center', marginTop: 26, padding: 6 }}>
        <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 10.5, letterSpacing: 1.4, textTransform: 'uppercase', color: T.inkSoft }}>
          Set up a different season
        </Text>
      </TouchableOpacity>
    </ScrollView>
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
        <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: T.inkSoft }}>
          Window {i + 1}
        </Text>
        {windows.length > 1 && (
          <TouchableOpacity onPress={onRemove}>
            <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 10.5, letterSpacing: 1.2, textTransform: 'uppercase', color: '#A0524A' }}>Remove</Text>
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
              <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: 13, color: on ? T.inkOnDeep : T.inkSoft }}>{d}</Text>
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
        <Text style={{ flex: 1, fontFamily: ALMA_FONTS.serifItalic, fontSize: 13.5, color: badTime || !w.days.length ? '#A0524A' : T.inkSoft }}>
          {!w.days.length ? 'Choose at least one day.' : badTime ? 'Closing time must come after opening.' : describeWindow(w)}
        </Text>
      </View>
    </Card>
  );
}

// ─── Team Codes ──────────────────────────────────────────────────────────────

const TEAM_MAX = 12;
const TEAM_MIN = 8;

function TeamCodes() {
  const T = useTheme();
  const { db } = useApp();
  const codes = db.TEAM_CODES || {};

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 120 }}>
      <Eyebrow>Invitations</Eyebrow>
      <SerifTitle size={24} italic style={{ marginTop: 6 }}>One code per team.</SerifTitle>
      <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: 14, color: T.inkSoft, marginTop: 6, lineHeight: 21 }}>
        Send a member her team's code once her dues are paid. A team holds {TEAM_MIN} to {TEAM_MAX} players.
      </Text>

      <View style={{ gap: 10, marginTop: 18 }}>
        {db.TEAMS.map(t => {
          const n = t.roster.length;
          const full = n >= TEAM_MAX;
          const short = n < TEAM_MIN;
          return (
            <Card key={t.id} style={{ padding: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', color: T.inkSoft }}>{t.name}</Text>
                  <Text style={{
                    fontFamily: ALMA_FONTS.display, fontSize: 19, letterSpacing: 2, color: full ? T.inkMute : T.ink, marginTop: 3,
                    textDecorationLine: full ? 'line-through' : 'none',
                  }}>{codes[t.id]}</Text>
                </View>
                <Chip variant={full ? 'default' : short ? 'warn' : 'success'}>
                  <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 10, letterSpacing: 1.6, color: full ? T.ink : short ? '#7E6537' : '#466357' }}>
                    {full ? 'Full' : `${n} / ${TEAM_MAX}`}
                  </Text>
                </Chip>
              </View>
              <View style={{ flexDirection: 'row', gap: 5, marginTop: 12 }}>
                {Array.from({ length: TEAM_MAX }, (_, i) => (
                  <View key={i} style={{ flex: 1, height: 6, borderRadius: 999, backgroundColor: i < n ? (i < TEAM_MIN ? T.brand : T.accent) : T.borderStrong }} />
                ))}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
                <Text style={{ flex: 1, fontFamily: ALMA_FONTS.ui, fontSize: 11, color: full ? T.accent : T.inkSoft }}>
                  {full ? 'Roster full \u2014 code closed' : short ? `${TEAM_MIN - n} more to reach full lineup` : `Room for ${TEAM_MAX - n} more`}
                </Text>
                <Button variant="secondary" size="sm" disabled={full}>
                  <Icon name="copy" size={13} color={T.ink} />
                  <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 12, color: T.ink }}>Copy code</Text>
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
  const { db } = useApp();
  const [teams, setTeams] = useState(() =>
    db.TEAMS.map(t => ({ id: t.id, name: t.name, shortName: t.shortName, captains: captainIdsOf(t), roster: [...t.roster] }))
  );
  const [confirm, setConfirm] = useState<any>(null);

  const assigned = new Set(teams.flatMap(t => t.roster));
  const unassigned = Object.values(db.PEOPLE)
    .filter(p => !assigned.has(p.id) && !p.title && !p.sub);

  const totalUsers = teams.reduce((n, t) => n + t.roster.length, 0);

  const doDelete = (teamId: string, uid: string) => {
    setTeams(prev => prev.map(t => t.id === teamId
      ? { ...t, roster: t.roster.filter(x => x !== uid), captains: t.captains.filter(x => x !== uid) } : t));
  };
  const doPromote = (teamId: string, uid: string) => {
    setTeams(prev => prev.map(t => t.id === teamId && t.captains.length < MAX_CAPTAINS
      ? { ...t, captains: [...t.captains, uid] } : t));
  };
  const doDemote = (teamId: string, uid: string) => {
    setTeams(prev => prev.map(t => t.id === teamId && t.captains.length > 1
      ? { ...t, captains: t.captains.filter(x => x !== uid) } : t));
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
          <MiniStat label="No team" value={unassigned.length} />
        </View>

        <View style={{ gap: 16, marginTop: 20 }}>
          {teams.map(team => {
            const ordered = [...team.captains, ...team.roster.filter(u => !team.captains.includes(u))]
              .map(uid => db.PEOPLE[uid]).filter(Boolean);
            const capsFull = team.captains.length >= MAX_CAPTAINS;

            return (
              <View key={team.id}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, paddingHorizontal: 2 }}>
                  <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: 13, letterSpacing: 1.6, textTransform: 'uppercase', color: T.ink }}>{team.name}</Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: T.border }} />
                  <Chip variant="default"><Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 10, letterSpacing: 1.6, color: T.ink }}>{ordered.length}</Text></Chip>
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
                            <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: 15, color: T.ink }} numberOfLines={1}>{p.name}</Text>
                            {isCap && <Chip variant="accent"><Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 8, letterSpacing: 1.2, color: '#6E4234' }}>Captain</Text></Chip>}
                          </View>
                          <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 11, color: T.inkSoft, marginTop: 2 }}>
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
              <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: 14, color: T.inkSoft, marginTop: 8, lineHeight: 21 }}>
                {confirm.type === 'delete' ? 'Her account stays in the league, unassigned.'
                  : confirm.type === 'demote' ? `She keeps her seat on ${confirm.team.name} as a player.`
                  : `She'll share every captain power on ${confirm.team.name}. A team may carry two captains at most.`}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
                <Button variant="secondary" fullWidth style={{ flex: 1 }} onPress={() => setConfirm(null)}>
                  <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 14, color: T.ink }}>Cancel</Text>
                </Button>
                <Button variant={confirm.type === 'promote' ? 'primary' : 'danger'} fullWidth style={{ flex: 1 }} onPress={execConfirm}>
                  <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: 14, color: confirm.type === 'promote' ? T.inkOnDeep : '#A0524A' }}>
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
      <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: 22, color: T.ink }}>{value}</Text>
      <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: 9, letterSpacing: 1.6, textTransform: 'uppercase', color: T.inkSoft, marginTop: 3 }}>{label}</Text>
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
