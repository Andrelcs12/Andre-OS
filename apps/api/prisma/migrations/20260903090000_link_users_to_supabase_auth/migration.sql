-- Supabase Auth owns credentials and provider identities. Keep the application
-- primary key stable so existing related data remains attached to its user.
alter table public.users add column auth_user_id uuid;
alter table public.users alter column google_id drop not null;
create unique index users_auth_user_id_key on public.users (auth_user_id);
