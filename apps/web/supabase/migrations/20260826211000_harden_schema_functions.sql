-- Restrict the auth bootstrap trigger function from PostgREST callers.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Cover the optional foreign key used when filtering time by task.
create index time_entries_task_id_idx on public.time_entries (task_id) where task_id is not null;
