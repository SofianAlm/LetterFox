alter table public.watchlist_items
  add column genres text[] not null default '{}';
