-- Move application identity away from Supabase Auth while preserving UUID foreign keys.
alter table public.profiles rename to users;
alter table public.users drop constraint if exists profiles_id_fkey;
alter table public.users alter column id set default gen_random_uuid();
alter table public.users add column google_id text;
alter table public.users add column email text;
alter table public.users alter column google_id set not null;
alter table public.users alter column email set not null;
create unique index users_google_id_key on public.users (google_id);
create unique index users_email_key on public.users (email);

-- Remove the retired Supabase Auth bootstrap once no application data depends on it.
drop trigger if exists auth_user_profile_bootstrap on auth.users;
drop function if exists public.handle_new_user();

-- Keep RLS enabled as a Data API hardening layer, but remove policies coupled to auth.uid().
do $$
declare
  target record;
begin
  for target in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('users', 'tasks', 'routines', 'routine_entries', 'links', 'time_entries')
  loop
    execute format('drop policy if exists %I on public.%I', target.policyname, target.tablename);
  end loop;
end;
$$;

revoke all on table public.users, public.tasks, public.routines, public.routine_entries, public.links, public.time_entries from anon, authenticated;
