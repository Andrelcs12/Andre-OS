create type public.time_entry_mode as enum ('FREE', 'POMODORO', 'MANUAL');
alter table public.time_entries
  add column note text,
  add column mode public.time_entry_mode not null default 'FREE',
  add column focus_ends_at timestamptz(6);
