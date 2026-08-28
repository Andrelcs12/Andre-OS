create type public.north_track_status as enum ('ACTIVE', 'PAUSED', 'COMPLETED');
create type public.north_item_status as enum ('TODO', 'IN_PROGRESS', 'COMPLETED');

create table public.north_tracks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  area public.area,
  status public.north_track_status not null default 'ACTIVE',
  started_at timestamptz(6),
  target_date date,
  created_at timestamptz(6) not null default now(),
  updated_at timestamptz(6) not null default now()
);

create table public.north_items (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.north_tracks(id) on delete cascade,
  title text not null,
  description text,
  status public.north_item_status not null default 'TODO',
  position integer not null,
  planned_minutes integer,
  scheduled_date date,
  completed_at timestamptz(6),
  created_at timestamptz(6) not null default now(),
  updated_at timestamptz(6) not null default now(),
  constraint north_items_planned_minutes_positive check (planned_minutes is null or planned_minutes > 0)
);

alter table public.time_entries add column north_item_id uuid references public.north_items(id) on delete set null;
alter table public.time_entries add constraint time_entries_single_subject check (task_id is null or north_item_id is null);

create index north_tracks_user_status_idx on public.north_tracks (user_id, status);
create index north_items_track_position_idx on public.north_items (track_id, position);
create index north_items_track_status_idx on public.north_items (track_id, status);
create index north_items_scheduled_date_idx on public.north_items (scheduled_date);
create index time_entries_north_item_id_idx on public.time_entries (north_item_id);
