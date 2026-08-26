create type public.task_status as enum ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED');
create type public.task_priority as enum ('LOW', 'MEDIUM', 'HIGH');
create type public.area as enum ('ENGINEERING', 'UNIVERSITY', 'CAREER', 'PRODUCT', 'DISTRIBUTION', 'PERSONAL');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 500),
  description text,
  area public.area not null,
  status public.task_status not null default 'PENDING',
  priority public.task_priority not null default 'MEDIUM',
  estimated_minutes integer check (estimated_minutes is null or estimated_minutes > 0),
  actual_minutes integer check (actual_minutes is null or actual_minutes >= 0),
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 250),
  area public.area,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.routine_entries (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  date date not null default current_date,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (routine_id, date),
  check ((completed and completed_at is not null) or (not completed and completed_at is null))
);

create table public.links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  url text not null check (url ~* '^https?://'),
  title text not null check (char_length(trim(title)) between 1 and 500),
  category text check (category is null or char_length(trim(category)) between 1 and 100),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.time_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  area public.area,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_minutes integer check (duration_minutes is null or duration_minutes >= 0),
  created_at timestamptz not null default now(),
  check (ended_at is null or ended_at >= started_at)
);

create index tasks_user_status_idx on public.tasks (user_id, status);
create index tasks_user_due_date_idx on public.tasks (user_id, due_date) where due_date is not null;
create index routines_user_id_idx on public.routines (user_id);
create index routine_entries_user_date_idx on public.routine_entries (user_id, date);
create index links_user_created_at_idx on public.links (user_id, created_at desc);
create index time_entries_user_started_at_idx on public.time_entries (user_id, started_at desc);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger tasks_set_updated_at before update on public.tasks for each row execute procedure public.set_updated_at();
create trigger routines_set_updated_at before update on public.routines for each row execute procedure public.set_updated_at();
create trigger links_set_updated_at before update on public.links for each row execute procedure public.set_updated_at();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', 'André'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;
create trigger auth_user_profile_bootstrap after insert on auth.users for each row execute procedure public.handle_new_user();

grant select, insert, update, delete on public.profiles, public.tasks, public.routines, public.routine_entries, public.links, public.time_entries to authenticated;

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.routines enable row level security;
alter table public.routine_entries enable row level security;
alter table public.links enable row level security;
alter table public.time_entries enable row level security;

create policy "profiles_select_own" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "profiles_delete_own" on public.profiles for delete to authenticated using ((select auth.uid()) = id);

create policy "tasks_select_own" on public.tasks for select to authenticated using ((select auth.uid()) = user_id);
create policy "tasks_insert_own" on public.tasks for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "tasks_update_own" on public.tasks for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "tasks_delete_own" on public.tasks for delete to authenticated using ((select auth.uid()) = user_id);

create policy "routines_select_own" on public.routines for select to authenticated using ((select auth.uid()) = user_id);
create policy "routines_insert_own" on public.routines for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "routines_update_own" on public.routines for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "routines_delete_own" on public.routines for delete to authenticated using ((select auth.uid()) = user_id);

create policy "routine_entries_select_own" on public.routine_entries for select to authenticated using ((select auth.uid()) = user_id);
create policy "routine_entries_insert_own" on public.routine_entries for insert to authenticated with check ((select auth.uid()) = user_id and exists (select 1 from public.routines where routines.id = routine_id and routines.user_id = (select auth.uid())));
create policy "routine_entries_update_own" on public.routine_entries for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id and exists (select 1 from public.routines where routines.id = routine_id and routines.user_id = (select auth.uid())));
create policy "routine_entries_delete_own" on public.routine_entries for delete to authenticated using ((select auth.uid()) = user_id);

create policy "links_select_own" on public.links for select to authenticated using ((select auth.uid()) = user_id);
create policy "links_insert_own" on public.links for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "links_update_own" on public.links for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "links_delete_own" on public.links for delete to authenticated using ((select auth.uid()) = user_id);

create policy "time_entries_select_own" on public.time_entries for select to authenticated using ((select auth.uid()) = user_id);
create policy "time_entries_insert_own" on public.time_entries for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "time_entries_update_own" on public.time_entries for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "time_entries_delete_own" on public.time_entries for delete to authenticated using ((select auth.uid()) = user_id);
