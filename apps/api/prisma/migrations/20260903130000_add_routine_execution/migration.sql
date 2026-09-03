alter table public.routines add column target_minutes integer;
alter table public.routines add constraint routines_target_minutes_positive check (target_minutes is null or target_minutes > 0);
alter table public.time_entries add column routine_id uuid references public.routines(id) on delete set null;
alter table public.time_entries drop constraint time_entries_single_subject;
alter table public.time_entries add constraint time_entries_single_subject check (
  (case when task_id is null then 0 else 1 end) +
  (case when north_item_id is null then 0 else 1 end) +
  (case when routine_id is null then 0 else 1 end) <= 1
);
create index time_entries_routine_id_idx on public.time_entries (routine_id);
