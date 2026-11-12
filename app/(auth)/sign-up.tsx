import React, { useState } from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, Image, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme, ALMA_FONTS , fs } from '../../lib/theme';
import { useApp } from '../../lib/AppContext';
import { Field } from '../../components/Field';
import { Card, Eyebrow, DisplayCaps, SerifTitle, Chip, Watercolor, Icon, Button } from '../../components/ui';
import type { Team } from '../../types';

function normalizeCode(s: string): string {
  const raw = s.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return raw.length > 4 ? `${raw.slice(0, 4)}-${raw.slice(4, 8)}` : raw;
}

export default function SignUpScreen() {
  const T = useTheme();
  const insets = useSafeAreaInsets();
  const { db, app } = useApp();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', terms: true,
  });
  const [team, setTeam] = useState<Team | null>(null);
  const [teamCode, setTeamCode] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const router = useRouter();
  const set = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <View style={{ flex: 1, backgroundColor: T.appBg }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top }} keyboardShouldPersistTaps="handled">
        {/* Badge */}
        <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 12, position: 'relative', overflow: 'hidden' }}>
          <Watercolor corner="tr" size={260} intensity={0.6} />
          <Image source={require('../../assets/images/alma-logo-transparent.png')} style={{ width: 96, height: 96 }} resizeMode="contain" />
        </View>

        {/* Progress bar */}
        <View style={{ paddingHorizontal: 24, paddingTop: 8, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(10), letterSpacing: 2, textTransform: 'uppercase', color: T.inkSoft }}>
            Step {step} of 2
          </Text>
          <View style={{ flex: 1, flexDirection: 'row', gap: 4 }}>
            {[1, 2].map(i => (
              <View key={i} style={{ flex: 1, height: 3, backgroundColor: i <= step ? T.brand : T.borderStrong, borderRadius: 999 }} />
            ))}
          </View>
        </View>

        {/* Step content */}
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 18 }}>
          {step === 1 && <StepCode db={db} onTeam={(tm, code) => { setTeam(tm); setTeamCode(code); setStep(2); }} />}
          {step === 2 && <StepAccount form={form} set={set} />}
        </View>

        {/* Buttons */}
        <View style={{ paddingHorizontal: 24, paddingTop: 14, paddingBottom: insets.bottom + 24, gap: 8 }}>
          {step === 1 && (
            <>
              <Button variant="ghost" fullWidth onPress={() => router.replace('/(auth)/sign-in')}>
                <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.ink }}>Back</Text>
              </Button>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(12), color: T.inkSoft }}>
                  Already have an account?{' '}
                  <Text onPress={() => router.replace({ pathname: '/(auth)/sign-in', params: { mode: 'in' } })} style={{ color: T.brand, borderBottomWidth: 1, borderBottomColor: T.brand }}>Log in</Text>
                </Text>
              </View>
            </>
          )}
          {step === 2 && (
            <>
              {signupError ? <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(12), color: '#A0524A', textAlign: 'center' }}>{signupError}</Text> : null}
              <Button variant="primary" fullWidth disabled={signupLoading} onPress={async () => {
                setSignupLoading(true); setSignupError('');
                const name = `${form.firstName} ${form.lastName}`.trim();
                const { error } = await app.signUpWithEmail(form.email, form.password, name);
                if (error) { setSignupLoading(false); setSignupError(error); return; }
                const signInResult = await app.signInWithEmail(form.email, form.password, teamCode || undefined);
                setSignupLoading(false);
                if (signInResult.error) { setSignupError(signInResult.error); return; }
                if (form.phone) app.updateProfile({ phone: form.phone });
                // Account created — completeSignUp clears signingUp flag
                // AuthGate will redirect to payment-required since dues_paid is false
                app.completeSignUp();
                router.replace('/payment-required');
              }}>
                <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.inkOnDeep }}>
                  {signupLoading ? 'Creating account\u2026' : 'Create account'}
                </Text>
              </Button>
              <Button variant="ghost" fullWidth onPress={() => setStep(1)}>
                <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.ink }}>Back</Text>
              </Button>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function StepCode({ db, onTeam }: { db: any; onTeam: (tm: Team, code: string) => void }) {
  const T = useTheme();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const codes = db.TEAM_CODES || {};

  const submit = () => {
    const c = normalizeCode(code);
    const teamId = Object.keys(codes).find(id => codes[id] === c);
    if (!teamId) { setError(c.length < 9 ? 'Codes are eight characters, like SPAR-4471.' : "No team matches that code."); return; }
    const team = db.TEAMS.find((t: Team) => t.id === teamId);
    if (!team) { setError('Team not found.'); return; }
    setError('');
    onTeam(team, c);
  };

  return (
    <View style={{ gap: 16 }}>
      <Eyebrow>Team code</Eyebrow>
      <SerifTitle size={22} italic>Which team is yours?</SerifTitle>
      <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: fs(14), color: T.inkSoft, lineHeight: 22, marginTop: -6 }}>
        You should have received a code from your captain. Enter it below to join the roster.
      </Text>
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: T.surface, borderWidth: 1, borderColor: error ? T.accent : T.borderStrong,
        borderRadius: 14, paddingLeft: 16, paddingRight: 6, paddingVertical: 6,
      }}>
        <TextInput value={code} onChangeText={v => { setCode(normalizeCode(v)); setError(''); }}
          onSubmitEditing={submit} placeholder="ABCD-0000" placeholderTextColor={T.inkMute}
          maxLength={9} autoCapitalize="characters" spellCheck={false}
          style={{ flex: 1, fontFamily: ALMA_FONTS.display, fontSize: fs(22), letterSpacing: 2, color: T.ink, paddingVertical: 10 }} />
        <Button variant="primary" size="sm" onPress={submit}>
          <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(12), color: T.inkOnDeep }}>Join</Text>
        </Button>
      </View>
      {error ? <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(11), color: T.accent, lineHeight: 17 }}>{error}</Text> : null}
    </View>
  );
}

function StepAccount({ form, set }: { form: any; set: (k: string, v: any) => void }) {
  const T = useTheme();
  const [showAgreement, setShowAgreement] = useState(false);
  return (
    <View style={{ gap: 14 }}>
      <Eyebrow>Account</Eyebrow>
      <SerifTitle size={22} italic style={{ marginBottom: 4 }}>Let's set you up.</SerifTitle>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Field label="First name" required value={form.firstName} onChange={v => set('firstName', v)} style={{ flex: 1 }} />
        <Field label="Last name" required value={form.lastName} onChange={v => set('lastName', v)} style={{ flex: 1 }} />
      </View>
      <Field label="Email" type="email" required value={form.email} onChange={v => set('email', v)} hint="Your team code and weekly reminders come here." />
      <Field label="Mobile phone" required value={form.phone} onChange={v => set('phone', v)} />
      <Field label="Password" type="password" required value={form.password} onChange={v => set('password', v)} placeholder="At least 8 characters" />
      <TouchableOpacity onPress={() => set('terms', !form.terms)} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
        <View style={{
          width: 18, height: 18, borderRadius: 4, marginTop: 2,
          backgroundColor: form.terms ? T.brand : 'transparent',
          borderWidth: 1, borderColor: form.terms ? T.brand : T.border,
          alignItems: 'center', justifyContent: 'center',
        }}>
          {form.terms && <Icon name="check" size={12} color="#EAF2EE" strokeWidth={2.5} />}
        </View>
        <Text style={{ flex: 1, fontFamily: ALMA_FONTS.serif, fontSize: fs(13), color: T.inkSoft, lineHeight: 19 }}>
          I've read the{' '}
          <Text onPress={(e) => { e.stopPropagation?.(); setShowAgreement(true); }} style={{ color: T.brand, textDecorationLine: 'underline' }}>
            Player Agreement &amp; Privacy Notice
          </Text>.
        </Text>
      </TouchableOpacity>

      {showAgreement && <AgreementModal onClose={() => setShowAgreement(false)} />}
    </View>
  );
}

function AgreementModal({ onClose }: { onClose: () => void }) {
  const T = useTheme();
  const Section = ({ title, children }: { title: string; children: string }) => (
    <View style={{ marginTop: 18 }}>
      <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: fs(16), color: T.ink, marginBottom: 6 }}>{title}</Text>
      <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: fs(13.5), color: T.inkSoft, lineHeight: 21 }}>{children}</Text>
    </View>
  );
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(15,34,48,0.55)', justifyContent: 'flex-end' }}>
        <View style={{
          backgroundColor: T.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
          maxHeight: '92%', flex: 1,
        }}>
          <View style={{ paddingHorizontal: 22, paddingTop: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: T.border }}>
            <View style={{ width: 36, height: 4, borderRadius: 999, backgroundColor: T.borderStrong, alignSelf: 'center', marginBottom: 14 }} />
            <Text style={{ fontFamily: ALMA_FONTS.display, fontSize: fs(14), letterSpacing: 2, textTransform: 'uppercase', color: T.ink }}>
              ALMA Mahjong LLC
            </Text>
            <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: fs(18), color: T.ink, marginTop: 4 }}>
              Player Agreement &amp; Privacy Notice
            </Text>
            <Text style={{ fontFamily: ALMA_FONTS.ui, fontSize: fs(10), color: T.inkSoft, marginTop: 4 }}>
              Last Updated October 2, 2026 · Georgia law · Fulton County, Georgia
            </Text>
          </View>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 40 }}>
            <Text style={{ fontFamily: ALMA_FONTS.serif, fontSize: fs(13.5), color: T.inkSoft, lineHeight: 21, marginTop: 16 }}>
              This Player Agreement &amp; Privacy Notice (the "Agreement") is a binding contract between you ("Player") and ALMA Mahjong LLC ("ALMA," "we," "us," or "our"). It governs registration, team and partner play, matches, events, websites, apps, portals, schedules, rosters, leaderboards, communications, and related services (the "Services"). It also explains how ALMA collects, uses, shares, and protects personal information.
            </Text>
            <Text style={{ fontFamily: ALMA_FONTS.serifSemiBold, fontSize: fs(12), color: T.ink, textAlign: 'center', marginTop: 14, lineHeight: 19 }}>
              BY CHECKING THE ACCEPTANCE BOX, REGISTERING, PAYING, JOINING A TEAM, ACCESSING PLAYER INFORMATION, OR PARTICIPATING, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO THIS AGREEMENT.
            </Text>
            <Section title="1. Eligibility, Registration, Accounts, and League Rules">
              {`You must be at least 18 years old and legally able to contract. You must provide accurate information, protect your login credentials and team codes, and promptly report suspected unauthorized access. Your account and access are personal and may not be sold, shared, or transferred without ALMA's written permission.\n\nALMA's current Official Guide, scoring and scheduling rules, player etiquette/code of conduct, city or division procedures, season calendars, and event or promotion rules are incorporated by reference.\n\nALMA is a team-based, partner mahjong league. Captains may recruit, communicate availability, create rosters or pairings, and assist with team administration, but captains and players are not ALMA employees, agents, venue operators, partners, or representatives and cannot bind ALMA or guarantee anyone's safety.`}
            </Section>
            <Section title="2. Scheduling, Locations, and Third-Party Venues">
              {`Players coordinate when, where, and with whom to play, subject to ALMA rules. Match locations may include private homes, restaurants, clubs, community spaces, event spaces, or other public or private places. Except where ALMA expressly states in writing that it is operating a particular event, ALMA does not own, operate, possess, control, inspect, maintain, staff, supervise, secure, or guarantee any player-selected location.\n\nEach Player decides whether a proposed location is appropriate, is responsible for personal safety and belongings, must follow applicable law and venue/host rules, and may decline to enter, remain at, or play at a location.`}
            </Section>
            <Section title="3. Assumption of Risk and Release">
              {`Participation is voluntary. You knowingly assume risks associated with travel, parking, private homes, restaurants and other venues, slips and falls, stairs, pets, food and beverages, alcohol, illness, theft, property loss, interactions with other people, and other ordinary risks of in-person social and recreational activity, whether known or unknown, to the extent permitted by law.\n\nTO THE FULLEST EXTENT PERMITTED BY LAW, YOU RELEASE AND AGREE NOT TO SUE ALMA AND ITS OWNERS, MEMBERS, MANAGERS, OFFICERS, EMPLOYEES, CONTRACTORS, COORDINATORS, REPRESENTATIVES, AND AGENTS (THE "RELEASED PARTIES") FOR CLAIMS FOR PERSONAL INJURY, ILLNESS, DEATH, PROPERTY LOSS OR DAMAGE ARISING FROM PLAYER-SELECTED MATCH LOCATIONS, TRAVEL TO OR FROM MATCHES, OR THE ACTS OR OMISSIONS OF OTHER PLAYERS, HOSTS, VENUES, OR THIRD PARTIES.`}
            </Section>
            <Section title="4. Player Conduct, Property, Alcohol, Food, and Guests">
              {`You are responsible for your own conduct before, during, and after ALMA activities and for complying with law, ALMA rules, and reasonable host or venue rules.\n\nALMA does not require or supervise alcohol consumption. If alcohol is present, you are solely responsible for whether and how much you consume, for complying with law, and for arranging safe transportation.\n\nNon-member substitutes or guests, including any permitted "Mahj-igan," may be required to accept a separate guest waiver or other terms before participating.`}
            </Section>
            <Section title="5. Fees, Scoring, Service Availability, and Discipline">
              {`ALL REGISTRATION AND PROGRAM FEES ARE NON-REFUNDABLE EXCEPT WHEN A REFUND IS REQUIRED BY LAW.\n\nPlayers must report scores honestly and follow ALMA's scheduling, scoring, signaling, conduct, and dispute procedures. ALMA may correct scores, standings, pairings, or administrative errors; investigate suspected violations; issue warnings; suspend or remove a Player; terminate access; withhold prizes where permitted; or take other reasonable steps to protect league integrity.`}
            </Section>
            <Section title="6. Player Information, Confidentiality, and Permitted Use">
              {`To operate the league, ALMA may make certain information available to teammates, captains, opponents, or other authorized participants. By registering, you consent to this league-related sharing.\n\nYou may use another participant's information only for legitimate ALMA participation and communication. You may not sell, rent, license, trade, publish, post, scrape, harvest, download in bulk, build or enrich a mailing list, CRM, or database, or otherwise commercially exploit or misuse ALMA Data.`}
            </Section>
            <Section title="7. ALMA Materials and Acceptable Use">
              {`ALMA owns or licenses its names, logos, Guide, forms, graphics, communications, instructional content, website/app content, software features, operational materials, methods, processes, and other proprietary materials. You receive only a limited, revocable, non-transferable right to use them for authorized ALMA participation.`}
            </Section>
            <Section title="8. Privacy Notice">
              {`ALMA may collect information you provide (such as name, email, phone number, city/region, team, account details, availability, communications, support requests, and payment/transaction information); league-generated information (such as rosters, pairings, schedules, attendance, scores, standings, forfeits, disputes, and conduct reports); and technical information from websites/apps.\n\nALMA may use personal information to register and authenticate Players; operate teams, schedules, matches, scoring, standings, events and support; process transactions; send service and league communications; prevent fraud; comply with law; maintain records; and analyze and improve the Services.`}
            </Section>
            <Section title="9. Sharing, Marketing, Retention, and Security">
              {`ALMA may share information with authorized league participants; with service providers that support hosting, software, registration, payments, email, messaging, analytics, mapping, security, customer support, accounting, insurance, and professional services; with attorneys, courts, regulators, insurers, or law enforcement when reasonably necessary.\n\nALMA does not intentionally sell player contact lists to third parties for their independent direct marketing.`}
            </Section>
            <Section title="10. Photos, Video, Voice, and Publicity Release">
              {`ALMA activities may be photographed, filmed, livestreamed, or recorded. To the fullest extent permitted by law, you grant ALMA and its designees a non-exclusive, royalty-free, worldwide, perpetual, irrevocable, transferable, and sublicensable right to photograph, record, edit, reproduce, publish, display, distribute, and otherwise use your name, image, likeness, voice, team affiliation, city, scores, standings, testimonials, and ALMA-related photographs or recordings for ALMA purposes.`}
            </Section>
            <Section title="11–14. Additional Terms">
              {`Privacy Choices: You may request correction of certain account information and may unsubscribe from non-essential promotional email.\n\nDisclaimers: THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" TO THE FULLEST EXTENT PERMITTED BY LAW.\n\nIndemnification: To the fullest extent permitted by law, you agree to defend, indemnify, and hold harmless the Released Parties from third-party claims arising from your negligent, reckless, or intentional acts or omissions.\n\nDisputes: This Agreement is governed by Georgia law. Court proceedings must be brought exclusively in Fulton County, Georgia.\n\nThis Agreement is the entire agreement concerning the Services. Electronic records and acceptance satisfy writing/signature requirements to the extent permitted by law.`}
            </Section>
          </ScrollView>
          <View style={{ paddingHorizontal: 22, paddingVertical: 12, borderTopWidth: 1, borderTopColor: T.border }}>
            <Button variant="primary" fullWidth onPress={onClose}>
              <Text style={{ fontFamily: ALMA_FONTS.uiMedium, fontSize: fs(14), color: T.inkOnDeep }}>Close</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
