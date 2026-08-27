-- Profils publics, un par utilisateur (auth.users n'est pas requêtable côté client)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_color text,
  created_at timestamptz not null default now()
);

-- Crée automatiquement un profil quand un compte est créé (par l'admin, pas d'inscription publique)
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Lieux de visionnage, avec autocomplete basé sur l'historique du groupe
create table public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- Une entrée = un visionnage (film entier, saison entière, ou épisode précis)
create table public.watch_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  media_type text not null check (media_type in ('movie','tv')),
  tmdb_id integer not null,
  title text not null,
  poster_path text,
  release_year integer,
  season_number integer,
  episode_number integer,
  episode_name text,
  granularity text not null check (granularity in ('movie','season','episode')),
  watched_on date not null,
  location_id uuid references public.locations(id),
  rating numeric(3,1) check (rating between 0 and 10),
  comment text,
  is_rewatch boolean not null default false,
  created_at timestamptz not null default now(),
  constraint rewatch_has_no_new_rating check (not (is_rewatch and (rating is not null or comment is not null))),
  constraint tv_fields check (
    (media_type = 'movie' and season_number is null and episode_number is null and episode_name is null)
    or (media_type = 'tv' and season_number is not null and (granularity = 'season' or episode_number is not null))
  )
);
create index watch_entries_tmdb_idx on public.watch_entries (media_type, tmdb_id);
create index watch_entries_user_idx on public.watch_entries (user_id);

-- Réactions emoji sur les avis, set fixe
create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  watch_entry_id uuid not null references public.watch_entries(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  emoji text not null check (emoji in ('👍','❤️','😂','😮','💀')),
  created_at timestamptz not null default now(),
  unique (watch_entry_id, user_id, emoji)
);

-- RLS : groupe privé, tout le monde connecté voit tout, chacun ne modifie que ses propres entrées
alter table public.profiles enable row level security;
alter table public.locations enable row level security;
alter table public.watch_entries enable row level security;
alter table public.reactions enable row level security;

create policy "profiles are readable by any authenticated user" on public.profiles
  for select to authenticated using (true);
create policy "users can update their own profile" on public.profiles
  for update to authenticated using (auth.uid() = id);

create policy "locations are readable by any authenticated user" on public.locations
  for select to authenticated using (true);
create policy "authenticated users can add locations" on public.locations
  for insert to authenticated with check (auth.uid() = created_by);

create policy "watch entries are readable by any authenticated user" on public.watch_entries
  for select to authenticated using (true);
create policy "users manage their own watch entries" on public.watch_entries
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "reactions are readable by any authenticated user" on public.reactions
  for select to authenticated using (true);
create policy "users manage their own reactions" on public.reactions
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
