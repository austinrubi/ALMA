-- Add short-handed bonus to seasons
alter table public.seasons add column if not exists short_handed_bonus int not null default 15;

-- Add short_handed marker to match_results
alter table public.match_results add column if not exists short_handed text check (short_handed in ('home', 'away'));

-- Add alternate_ids to away_rosters (6 primary in user_ids, 2 alternates here)
alter table public.away_rosters add column if not exists alternate_ids uuid[] not null default '{}';

-- Update comment on matches table
comment on table public.matches is 'Three tables per weekly pairing';
