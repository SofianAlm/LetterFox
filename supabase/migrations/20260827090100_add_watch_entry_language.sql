alter table public.watch_entries
  add column language text not null default 'VF' check (language in ('VO','VF'));
