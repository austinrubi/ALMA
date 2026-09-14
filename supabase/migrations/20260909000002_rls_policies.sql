-- ALMA Row-Level Security Policies
-- Enable RLS on all tables, then define access rules.

-- ============================================================
-- Enable RLS
-- ============================================================
alter table public.profiles enable row level security;
alter table public.seasons enable row level security;
alter table public.play_windows enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.matches enable row level security;
alter table public.match_seats enable row level security;
alter table public.match_results enable row level security;
alter table public.match_plans enable row level security;
alter table public.slot_availability enable row level security;
alter table public.away_rosters enable row level security;
alter table public.payments enable row level security;
alter table public.announcements enable row level security;
alter table public.documents enable row level security;
alter table public.faqs enable row level security;

-- ============================================================
-- Helper: check if current user is admin
-- ============================================================
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- Helper: check if current user is captain of a given team
create or replace function public.is_captain_of(team_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.team_members
    where team_members.team_id = is_captain_of.team_id
      and user_id = auth.uid()
      and team_role = 'captain'
  );
$$ language sql security definer stable;

-- Helper: check if user is on a team
create or replace function public.is_on_team(team_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.team_members
    where team_members.team_id = is_on_team.team_id
      and user_id = auth.uid()
  );
$$ language sql security definer stable;

-- ============================================================
-- PROFILES
-- ============================================================
-- Everyone can read all profiles (needed for roster display, contacts)
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Admin can update any profile (role changes, etc.)
create policy "Admin can update any profile"
  on public.profiles for update
  to authenticated
  using (public.is_admin());

-- ============================================================
-- SEASONS
-- ============================================================
create policy "Seasons are viewable by authenticated users"
  on public.seasons for select to authenticated using (true);

create policy "Admin can manage seasons"
  on public.seasons for all to authenticated using (public.is_admin());

-- ============================================================
-- PLAY WINDOWS
-- ============================================================
create policy "Play windows are viewable by authenticated users"
  on public.play_windows for select to authenticated using (true);

create policy "Admin can manage play windows"
  on public.play_windows for all to authenticated using (public.is_admin());

-- ============================================================
-- TEAMS
-- ============================================================
create policy "Teams are viewable by authenticated users"
  on public.teams for select to authenticated using (true);

create policy "Admin can manage teams"
  on public.teams for all to authenticated using (public.is_admin());

-- ============================================================
-- TEAM MEMBERS
-- ============================================================
create policy "Team members are viewable by authenticated users"
  on public.team_members for select to authenticated using (true);

-- Players can join a team (insert themselves)
create policy "Users can join a team"
  on public.team_members for insert
  to authenticated
  with check (user_id = auth.uid());

-- Captains can add/remove members on their team
create policy "Captains can manage their team roster"
  on public.team_members for all
  to authenticated
  using (public.is_captain_of(team_id));

-- Admin can manage all memberships
create policy "Admin can manage all team members"
  on public.team_members for all to authenticated using (public.is_admin());

-- ============================================================
-- MATCHES
-- ============================================================
create policy "Matches are viewable by authenticated users"
  on public.matches for select to authenticated using (true);

create policy "Admin can manage matches"
  on public.matches for all to authenticated using (public.is_admin());

-- ============================================================
-- MATCH SEATS
-- ============================================================
create policy "Match seats are viewable by authenticated users"
  on public.match_seats for select to authenticated using (true);

-- Players can seat/unseat themselves
create policy "Players can manage own seats"
  on public.match_seats for all
  to authenticated
  using (user_id = auth.uid() or user_id is null);

-- Captains can seat anyone on their team
create policy "Captains can manage seats for their team"
  on public.match_seats for all
  to authenticated
  using (
    exists (
      select 1 from public.matches m
      where m.id = match_seats.match_id
        and (public.is_captain_of(m.home_team_id) or public.is_captain_of(m.away_team_id))
    )
  );

-- ============================================================
-- MATCH RESULTS
-- ============================================================
create policy "Match results are viewable by authenticated users"
  on public.match_results for select to authenticated using (true);

-- Host pair or captain can log/edit scores
create policy "Host pair and captains can manage results"
  on public.match_results for all
  to authenticated
  using (
    exists (
      select 1 from public.matches m
      where m.id = match_results.match_id
        and (
          public.is_captain_of(m.home_team_id)
          or exists (
            select 1 from public.match_seats ms
            where ms.match_id = m.id and ms.side = 'home' and ms.user_id = auth.uid()
          )
        )
    )
  );

-- ============================================================
-- MATCH PLANS
-- ============================================================
create policy "Match plans are viewable by authenticated users"
  on public.match_plans for select to authenticated using (true);

-- Seated players and captains can set plans
create policy "Seated players and captains can manage plans"
  on public.match_plans for all
  to authenticated
  using (
    exists (
      select 1 from public.matches m
      where m.id = match_plans.match_id
        and (
          public.is_captain_of(m.home_team_id)
          or public.is_captain_of(m.away_team_id)
          or exists (
            select 1 from public.match_seats ms
            where ms.match_id = m.id and ms.user_id = auth.uid()
          )
        )
    )
  );

-- ============================================================
-- SLOT AVAILABILITY
-- ============================================================
create policy "Slot availability is viewable by authenticated users"
  on public.slot_availability for select to authenticated using (true);

create policy "Users can manage own availability"
  on public.slot_availability for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================================
-- AWAY ROSTERS
-- ============================================================
create policy "Away rosters are viewable by authenticated users"
  on public.away_rosters for select to authenticated using (true);

create policy "Captains can manage away rosters"
  on public.away_rosters for all
  to authenticated
  using (public.is_captain_of(team_id));

-- ============================================================
-- PAYMENTS
-- ============================================================
create policy "Users can view own payments"
  on public.payments for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "Admin can manage payments"
  on public.payments for all to authenticated using (public.is_admin());

-- ============================================================
-- ANNOUNCEMENTS, DOCUMENTS, FAQS — read-only for members
-- ============================================================
create policy "Announcements are viewable by authenticated users"
  on public.announcements for select to authenticated using (true);
create policy "Admin can manage announcements"
  on public.announcements for all to authenticated using (public.is_admin());

create policy "Documents are viewable by authenticated users"
  on public.documents for select to authenticated using (true);
create policy "Admin can manage documents"
  on public.documents for all to authenticated using (public.is_admin());

create policy "FAQs are viewable by authenticated users"
  on public.faqs for select to authenticated using (true);
create policy "Admin can manage FAQs"
  on public.faqs for all to authenticated using (public.is_admin());
