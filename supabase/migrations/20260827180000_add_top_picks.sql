create table public.top_picks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  media_type text not null check (media_type in ('movie', 'tv')),
  rank smallint not null check (rank between 1 and 3),
  tmdb_id integer not null,
  title text not null,
  poster_path text,
  release_year integer,
  created_at timestamptz not null default now(),
  unique (user_id, media_type, rank)
);

alter table public.top_picks enable row level security;

create policy "top picks readable by any authenticated user"
  on public.top_picks for select to authenticated using (true);

create policy "users manage their own top picks"
  on public.top_picks for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
