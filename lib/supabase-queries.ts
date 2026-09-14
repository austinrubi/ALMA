import { supabase } from './supabase';
import type { AlmaDB, Person, Team, Match, Season, PlayWindow, Division, Announcement, Document, FAQ, PaymentRecord, DuesRecord } from '../types';

// Fetch the active season
export async function fetchSeason() {
  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (error) throw error;
  return data;
}

// Fetch play windows for a season
export async function fetchPlayWindows(seasonId: string) {
  const { data, error } = await supabase
    .from('play_windows')
    .select('*')
    .eq('season_id', seasonId);
  if (error) throw error;
  return data;
}

// Fetch all teams for a season
export async function fetchTeams(seasonId: string) {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('season_id', seasonId);
  if (error) throw error;
  return data;
}

// Fetch all team members (with profile data)
export async function fetchTeamMembers(seasonId: string) {
  const { data, error } = await supabase
    .from('team_members')
    .select(`
      *,
      team:teams!inner(season_id),
      profile:profiles(*)
    `)
    .eq('team.season_id', seasonId);
  if (error) throw error;
  return data;
}

// Fetch all matches for a season
export async function fetchMatches(seasonId: string) {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      seats:match_seats(*),
      result:match_results(*),
      plan:match_plans(*)
    `)
    .eq('season_id', seasonId);
  if (error) throw error;
  return data;
}

// Fetch all profiles
export async function fetchProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*');
  if (error) throw error;
  return data;
}

// Fetch slot availability for a season
export async function fetchSlotAvailability(seasonId: string) {
  const { data, error } = await supabase
    .from('slot_availability')
    .select('*')
    .eq('season_id', seasonId);
  if (error) throw error;
  return data;
}

// Fetch documents
export async function fetchDocuments() {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data;
}

// Fetch FAQs
export async function fetchFAQs() {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data;
}

// Fetch announcements for a season
export async function fetchAnnouncements(seasonId: string) {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('season_id', seasonId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
}

// ── Mutations ────────────────────────────────────────────────────────────────

export async function upsertMatchSeat(matchId: string, side: string, seatIndex: number, userId: string | null) {
  if (userId) {
    const { error } = await supabase
      .from('match_seats')
      .upsert({ match_id: matchId, side, seat_index: seatIndex, user_id: userId }, { onConflict: 'match_id,side,seat_index' });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('match_seats')
      .delete()
      .eq('match_id', matchId)
      .eq('side', side)
      .eq('seat_index', seatIndex);
    if (error) throw error;
  }
}

export async function upsertMatchResult(matchId: string, homeScore: number, awayScore: number, enteredBy: string, forfeitSide?: string) {
  const { error } = await supabase
    .from('match_results')
    .upsert({
      match_id: matchId,
      home_score: homeScore,
      away_score: awayScore,
      entered_by: enteredBy,
      entered_at: new Date().toISOString(),
      forfeit_side: forfeitSide || null,
    }, { onConflict: 'match_id' });
  if (error) throw error;

  // Also update match status
  const { error: matchError } = await supabase
    .from('matches')
    .update({ status: 'final' })
    .eq('id', matchId);
  if (matchError) throw matchError;
}

export async function upsertMatchPlan(matchId: string, whenText: string, whereText: string, setBy: string) {
  const { error } = await supabase
    .from('match_plans')
    .upsert({
      match_id: matchId,
      when_text: whenText,
      where_text: whereText,
      set_by: setBy,
      set_at: new Date().toISOString(),
    }, { onConflict: 'match_id' });
  if (error) throw error;
}

export async function updateProfile(userId: string, patch: Partial<Person>) {
  const { error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId);
  if (error) throw error;
}

export async function upsertSlotAvailability(userId: string, seasonId: string, week: number, slotId: string, value: string | null) {
  if (value) {
    const { error } = await supabase
      .from('slot_availability')
      .upsert({ user_id: userId, season_id: seasonId, week, slot_id: slotId, value }, { onConflict: 'user_id,season_id,week,slot_id' });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('slot_availability')
      .delete()
      .eq('user_id', userId)
      .eq('season_id', seasonId)
      .eq('week', week)
      .eq('slot_id', slotId);
    if (error) throw error;
  }
}

export async function joinTeam(teamId: string, userId: string) {
  // Remove from any existing team first
  await supabase.from('team_members').delete().eq('user_id', userId);
  // Add to new team
  const { error } = await supabase
    .from('team_members')
    .insert({ team_id: teamId, user_id: userId, team_role: 'player' });
  if (error) throw error;
}
