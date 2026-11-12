import React from 'react';
import { View, ScrollView, Text, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme, ALMA_FONTS , fs } from '../../lib/theme';
import { useApp } from '../../lib/AppContext';
import { isCaptainOf, captainIdsOf } from '../../lib/roles';
import { slotAvailabilityOf, weeklySlots, weekSlotId, slotLabel, fmtTime12 } from '../../lib/availability';
import { SectionLabel } from '../../components/SectionLabel';
import { Card, Eyebrow, DisplayCaps, SerifTitle, Chip, Avatar, Watercolor, Icon, Button } from '../../components/ui';
import { ContactRow } from '../../components/ContactRow';

export default function MatchDetailScreen() {
  const T = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { db, viewer: V, app } = useApp();

  const match = db.MATCHES.find(m => m.id === id);
  if (!match) return <View style={{ flex: 1, padding: 24, backgroundColor: T.appBg }}><Text>Match not found.</Text></View>;

  const home = db.TEAMS.find(t => t.id === match.home)!;
  const away = db.TEAMS.find(t => t.id === match.away)!;
  const myTeamIsHome = (V.team ? V.team.id : home.id) === home.id;
  const myTeam = myTeamIsHome ? home : away;
  const opp = myTeamIsHome ? away : home;
  const mySeats = (match.seats[myTeamIsHome ? 'home' : 'away'] || []).filter(Boolean);
  const oppSeats = (match.seats[myTeamIsHome ? 'away' : 'home'] || []).filter(Boolean);
  const myScore = match.result ? (myTeamIsHome ? match.result.home : match.result.away) : null;
  const oppScore = match.result ? (myTeamIsHome ? match.result.away : match.result.home) : null;
  const final = match.status === 'final';
  const iAmHostPair = (match.seats.home || []).includes(V.uid);
  const iAmHostCaptain = isCaptainOf(home, V.uid);
  const canLog = !final && (iAmHostPair || iAmHostCaptain);
  const canOverride = final && iAmHostCaptain;
  const hostCaptainNames = captainIdsOf(home).map(cid => db.PEOPLE[cid]?.name?.split(' ')[0]).join(' or ');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: T.appBg }} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 100 }}>
      {/* Poster header */}
      <View style={{ backgroundColor: T.surfaceDeep, paddingHorizontal: 22, paddingTop: 8, paddingBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <Watercolor corner="tr" size={300} intensity={1.0} />
        <Watercolor corner="bl" size={220} intensity={0.6} accent="terracotta" />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', position: 'relative', paddingTop: 8 }}>
          <Button variant="ghost" size="sm" onPress={() => router.back()}>
            <Icon name="chevronLeft" size={18} color={T.inkOnDeep} />
            <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(13), color: T.inkOnDeep }}>Schedule</Text>
          </Button>
          {final && <Chip variant="success"><Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(10), letterSpacing: 1.6, color: '#466357' }}>Scored</Text></Chip>}
        </View>

        <View style={{ marginTop: 18, position: 'relative' }}>
          <Eyebrow color={T.heroEyebrow}>{`Week ${match.week} \u00B7 Match ${match.table}`}</Eyebrow>
        </View>

        <View style={{ marginTop: 14, position: 'relative', gap: 4 }}>
          <DisplayCaps size={30} color={T.inkOnDeep}>{home.shortName}</DisplayCaps>
          <Text style={{ fontFamily: ALMA_FONTS.serifItalic, fontSize: fs(18), color: 'rgba(239,234,217,0.7)', paddingVertical: 2 }}>vs.</Text>
          <DisplayCaps size={30} color={T.inkOnDeep}>{away.shortName}</DisplayCaps>
        </View>

        {/* Match plan */}
        <View style={{ marginTop: 16, position: 'relative', gap: 8 }}>
          <PlanLine icon="star" color={T.inkOnDeep}>
            {home.shortName} is the home team — they set the time and place, and log the score
          </PlanLine>
          {match.plan?.when ? (
            <>
              <PlanLine icon="clock" color={T.inkOnDeep}>{match.plan.when}</PlanLine>
              <PlanLine icon="pin" color={match.plan?.where ? T.inkOnDeep : 'rgba(239,234,217,0.7)'}>
                {match.plan?.where || 'Location not yet set'}
              </PlanLine>
            </>
          ) : myTeamIsHome ? (
            <>
              <PlanLine icon="clock" color={'rgba(239,234,217,0.7)'}>Time not yet set</PlanLine>
              <PlanLine icon="pin" color={'rgba(239,234,217,0.7)'}>Location not yet set</PlanLine>
            </>
          ) : (
            <PlanLine icon="clock" color={'rgba(239,234,217,0.7)'}>
              Waiting for {home.shortName} to propose a date and time
            </PlanLine>
          )}
        </View>
      </View>

      {/* The table — both pairs */}
      <View style={{ paddingHorizontal: 18, paddingTop: 22 }}>
        <SectionLabel>The table</SectionLabel>
        <View style={{ marginTop: 12, gap: 10 }}>
          <PairBlock db={db} team={myTeam} uids={mySeats} label={`${myTeam.shortName} \u00B7 your team's pair`} mine />
          <PairBlock db={db} team={opp} uids={oppSeats} label={`${opp.shortName} \u00B7 opposing pair`} />
        </View>
      </View>

      {/* Contact the opposing pair */}
      <View style={{ paddingHorizontal: 18, paddingTop: 24 }}>
        <SectionLabel>Reach out</SectionLabel>
        {oppSeats.length ? (
          <View style={{ marginTop: 12, gap: 10 }}>
            {oppSeats.map(uid => {
              const p = db.PEOPLE[uid];
              if (!p) return null;
              return (
                <Card key={uid} style={{ padding: 0, overflow: 'hidden' }}>
                  <View style={{ padding: 13, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Avatar initials={p.initials} tile={p.tile} size={38} tint={p.tint} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: fs(15.5), color: T.ink }}>{p.name}</Text>
                      <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(10.5), letterSpacing: 1, textTransform: 'uppercase', color: T.inkSoft, marginTop: 2 }}>
                        {opp.shortName}{isCaptainOf(opp, uid) ? ' · Captain' : ''}
                      </Text>
                    </View>
                  </View>
                  {p.phone ? <ContactRow icon="phone" label="Mobile" value={p.phone} href={`tel:${p.phone.replace(/\D/g, '')}`} divider /> : null}
                  {p.email ? <ContactRow icon="mail" label="Email" value={p.email} href={`mailto:${p.email}`} divider /> : null}
                </Card>
              );
            })}
          </View>
        ) : (
          <Card variant="quiet" style={{ marginTop: 12, padding: 16 }}>
            <Text style={{ fontFamily: ALMA_FONTS.serifItalic, fontSize: fs(14), color: T.inkSoft, lineHeight: 21 }}>
              {opp.shortName} hasn't set this pairing yet. Contacts appear the moment their captain seats the table.
            </Text>
          </Card>
        )}
      </View>

      {/* Score */}
      <View style={{ paddingHorizontal: 18, paddingTop: 24 }}>
        <SectionLabel>Result</SectionLabel>
        <Card style={{ marginTop: 12, padding: 18 }}>
          {!final && (
            <View>
              <Text style={{ fontFamily: ALMA_FONTS.serifItalic, fontSize: fs(15), color: T.inkSoft, lineHeight: 22 }}>
                {canLog
                  ? `Once you've played, log both scores (1\u2013999). They lock the moment you submit \u2014 only ${hostCaptainNames} can change them after that.`
                  : `The ${home.shortName} pair logs this table's score after play. It locks on submission.`}
              </Text>
              {canLog && (
                <View style={{ marginTop: 14 }}>
                  <Button variant="primary" fullWidth onPress={() => router.push({ pathname: '/score/[id]', params: { id: match.id } })}>
                    <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.inkOnDeep }}>Log the score</Text>
                  </Button>
                </View>
              )}
            </View>
          )}
          {final && (
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
                <ScoreCol team={myTeam.shortName} score={myScore!} label="You" />
                <Text style={{ fontFamily: ALMA_FONTS.serifItalic, fontSize: fs(22), color: T.inkSoft }}>–</Text>
                <ScoreCol team={opp.shortName} score={oppScore!} />
              </View>
              <View style={{ marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: T.border }}>
                <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: fs(13.5), color: T.inkSoft, lineHeight: 20 }}>
                  Reach out to your team captain(s) if you believe a scoring mistake has been made.
                </Text>
              </View>
              {canOverride && (
                <View style={{ marginTop: 14 }}>
                  <Button variant="secondary" fullWidth onPress={() => router.push({ pathname: '/score/[id]', params: { id: match.id, mode: 'edit' } })}>
                    <Icon name="edit" size={15} color={T.ink} />
                    <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.ink }}>Override score</Text>
                  </Button>
                </View>
              )}
            </View>
          )}
        </Card>
      </View>
    </ScrollView>
  );
}

function PlanLine({ icon, color, children }: { icon: string; color: string; children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, opacity: 0.85 }}>
      <Icon name={icon} size={14} color={color} />
      <Text style={{ fontFamily: 'Jost_400Regular', fontSize: fs(13), color, flex: 1 }}>{children}</Text>
    </View>
  );
}

function PairBlock({ db, team, uids, label, mine }: { db: any; team: any; uids: string[]; label: string; mine?: boolean }) {
  const T = useTheme();
  return (
    <Card variant={mine ? 'default' : 'quiet'} style={{ padding: 14 }}>
      <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(9.5), letterSpacing: 2, textTransform: 'uppercase', color: T.inkSoft }}>{label}</Text>
      {uids.length ? (
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          {uids.map(uid => {
            const p = db.PEOPLE[uid];
            if (!p) return null;
            return (
              <View key={uid} style={{
                flex: 1, backgroundColor: T.surfaceAlt, borderWidth: 1, borderColor: T.border,
                borderRadius: 14, padding: 12, alignItems: 'center', gap: 6,
              }}>
                <Avatar initials={p.initials} tile={p.tile} size={40} tint={p.tint} />
                <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: fs(13), color: T.ink, textAlign: 'center', lineHeight: 16 }}>
                  {p.name.split(' ')[0]}{'\n'}{p.name.split(' ').slice(1).join(' ')}
                </Text>
                {isCaptainOf(team, uid) && <Chip variant="default"><Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(8), letterSpacing: 1.2, color: T.ink }}>Captain</Text></Chip>}
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={{ fontFamily: ALMA_FONTS.serifItalic, fontSize: fs(14), color: T.inkSoft, marginTop: 8 }}>Not seated yet.</Text>
      )}
    </Card>
  );
}

function ScoreCol({ team, score, label }: { team: string; score: number; label?: string }) {
  const T = useTheme();
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(9), letterSpacing: 1.6, textTransform: 'uppercase', color: T.inkSoft, marginBottom: 4 }}>
        {team}{label ? ` \u00B7 ${label}` : ''}
      </Text>
      <DisplayCaps size={44} color={T.ink}>{score}</DisplayCaps>
    </View>
  );
}
