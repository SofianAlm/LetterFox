create table public.series_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tmdb_id integer not null,
  title text not null,
  poster_path text,
  release_year integer,
  created_at timestamptz not null default now(),
  unique (user_id, tmdb_id)
);

alter table public.series_progress enable row level security;

create policy "series progress readable by any authenticated user"
  on public.series_progress for select to authenticated using (true);

create policy "users manage their own series progress"
  on public.series_progress for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
