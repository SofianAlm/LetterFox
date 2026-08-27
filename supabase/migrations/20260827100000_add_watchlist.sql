create table public.watchlist_items (
  id uuid primary key default gen_random_uuid(),
  media_type text not null check (media_type in ('movie','tv')),
  tmdb_id integer not null,
  title text not null,
  poster_path text,
  release_year integer,
  added_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  watched boolean not null default false,
  watched_by uuid references public.profiles(id),
  watched_at timestamptz,
  unique (media_type, tmdb_id)
);

alter table public.watchlist_items enable row level security;

create policy "watchlist items are readable by any authenticated user" on public.watchlist_items
  for select to authenticated using (true);
create policy "watchlist items are readable by anon" on public.watchlist_items
  for select to anon using (true);
create policy "authenticated users can add watchlist items" on public.watchlist_items
  for insert to authenticated with check (auth.uid() = added_by);
create policy "authenticated users can mark items watched" on public.watchlist_items
  for update to authenticated using (true) with check (true);
create policy "adders can delete their own watchlist items" on public.watchlist_items
  for delete to authenticated using (auth.uid() = added_by);
