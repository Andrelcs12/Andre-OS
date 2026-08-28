-- Evolui os campos legados de links para o contrato da aplicação.
alter table public.links
  rename column category to area;

alter table public.links
  rename column notes to description;

alter table public.links
  add column is_favorite boolean not null default false;

alter table public.time_entries
  add column description text;

-- Mantém no banco a garantia de uma sessão aberta por usuário, inclusive sob cliques concorrentes.
create unique index time_entries_one_active_per_user_idx
  on public.time_entries (user_id)
  where ended_at is null;

create index time_entries_user_ended_at_idx
  on public.time_entries (user_id, ended_at desc);
