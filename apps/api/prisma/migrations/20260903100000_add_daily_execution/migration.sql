-- Explicit daily planning is independent from a task deadline.
alter table public.tasks add column planned_for date;
create index tasks_user_planned_for_idx on public.tasks (user_id, planned_for);

-- The service pauses the previous Norte, and this index protects the invariant
-- under concurrent requests as well.
create unique index north_tracks_one_active_per_user_idx
  on public.north_tracks (user_id)
  where status = 'ACTIVE';
