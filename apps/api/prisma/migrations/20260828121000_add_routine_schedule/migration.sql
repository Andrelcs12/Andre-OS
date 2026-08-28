create type public.routine_schedule as enum ('DAILY', 'WEEKDAYS', 'CUSTOM');

alter table public.routines
  add column description text,
  add column schedule public.routine_schedule not null default 'DAILY',
  add column days_of_week integer[] not null default array[]::integer[];
