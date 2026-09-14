-- ALMA Database Schema
-- All tables for the Atlanta League Mahjong Association app

-- ============================================================
-- PROFILES — extends Supabase auth.users
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  phone text not null default '',
  initials text not null default '',
  tile text not null default 'plum',
  tint text not null default 'bone',
  skill text not null default 'Experienced',
  zip text,
  area text,
  role text not null default 'player' check (role in ('admin', 'captain', 'player')),
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, initials)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    upper(left(coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 2))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- SEASONS
-- ============================================================
create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date not null,
  end_date date not null,
  week_count int not null default 8,
  current_week int not null default 1,
  fee numeric(10,2) not null default 75.00,
  forfeit_points int not null default 75,
  week_win_bonus int not null default 50,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- PLAY WINDOWS — weekly time bands for matches
-- ============================================================
create table public.play_windows (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  days int[] not null default '{}',
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- TEAMS
-- ============================================================
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  name text not null,
  short_name text not null,
  home_venue text,
  code text not null,
  division text not null default 'Atlanta League',
  points int not null default 0,
  prev_rank_change int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- TEAM MEMBERS — links users to teams with a role
-- ============================================================
create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  team_role text not null default 'player' check (team_role in ('captain', 'player')),
  joined_at timestamptz not null default now(),
  unique (team_id, user_id)
);

-- ============================================================
-- MATCHES — four tables per weekly pairing
-- ============================================================
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  week int not null,
  table_num int not null,
  match_type text not null default 'tournament',
  home_team_id uuid not null references public.teams(id) on delete cascade,
  away_team_id uuid not null references public.teams(id) on delete cascade,
  status text not null default 'open' check (status in ('open', 'final')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- MATCH SEATS — who sits at each table
-- ============================================================
create table public.match_seats (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  side text not null check (side in ('home', 'away')),
  seat_index int not null check (seat_index in (0, 1)),
  user_id uuid references public.profiles(id) on delete set null,
  unique (match_id, side, seat_index)
);

-- ============================================================
-- MATCH RESULTS — scores logged by the host pair
-- ============================================================
create table public.match_results (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade unique,
  home_score int not null check (home_score >= 0 and home_score <= 999),
  away_score int not null check (away_score >= 0 and away_score <= 999),
  forfeit_side text check (forfeit_side in ('home', 'away')),
  entered_by uuid references public.profiles(id),
  entered_at timestamptz not null default now(),
  edited_by uuid references public.profiles(id),
  edited_at timestamptz
);

-- ============================================================
-- MATCH PLANS — time and place agreed by players
-- ============================================================
create table public.match_plans (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade unique,
  when_text text,
  where_text text,
  set_by uuid references public.profiles(id),
  set_at timestamptz not null default now()
);

-- ============================================================
-- SLOT AVAILABILITY — per member, per week, per window slot
-- ============================================================
create table public.slot_availability (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  season_id uuid not null references public.seasons(id) on delete cascade,
  week int not null,
  slot_id text not null,
  value text not null check (value in ('yes', 'no', 'maybe')),
  unique (user_id, season_id, week, slot_id)
);

-- ============================================================
-- AWAY ROSTERS — captain clears 8 players for away weeks
-- ============================================================
create table public.away_rosters (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  season_id uuid not null references public.seasons(id) on delete cascade,
  week int not null,
  user_ids uuid[] not null default '{}',
  unique (team_id, season_id, week)
);

-- ============================================================
-- PAYMENTS — season dues
-- ============================================================
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  season_id uuid not null references public.seasons(id) on delete cascade,
  amount numeric(10,2) not null,
  method text not null default 'square',
  status text not null default 'unpaid' check (status in ('paid', 'unpaid', 'refunded')),
  ref text,
  paid_at timestamptz
);

-- ============================================================
-- ANNOUNCEMENTS
-- ============================================================
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references public.seasons(id) on delete cascade,
  title text not null,
  body text not null,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

-- ============================================================
-- DOCUMENTS — PDFs, handbooks, etc.
-- ============================================================
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  pages int not null default 0,
  role_visibility text not null default 'all' check (role_visibility in ('all', 'captain', 'admin')),
  url text,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- FAQS
-- ============================================================
create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  question text not null,
  answer text not null,
  sort_order int not null default 0
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_team_members_user on public.team_members(user_id);
create index idx_team_members_team on public.team_members(team_id);
create index idx_matches_season_week on public.matches(season_id, week);
create index idx_matches_teams on public.matches(home_team_id, away_team_id);
create index idx_match_seats_match on public.match_seats(match_id);
create index idx_match_seats_user on public.match_seats(user_id);
create index idx_slot_availability_user_season on public.slot_availability(user_id, season_id);
create index idx_payments_user on public.payments(user_id);
