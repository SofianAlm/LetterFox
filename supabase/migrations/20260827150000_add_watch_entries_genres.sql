alter table public.watch_entries
  add column genres text[] not null default '{}';
