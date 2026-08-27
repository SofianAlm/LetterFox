create table public.watchlist_wants (
  item_id uuid not null references public.watchlist_items(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (item_id, profile_id)
);

alter table public.watchlist_wants enable row level security;

create policy "watchlist wants are readable by any authenticated user"
  on public.watchlist_wants for select to authenticated using (true);

create policy "watchlist wants are readable by anon"
  on public.watchlist_wants for select to anon using (true);

create policy "users can add their own want"
  on public.watchlist_wants for insert to authenticated with check (auth.uid() = profile_id);

create policy "users can remove their own want"
  on public.watchlist_wants for delete to authenticated using (auth.uid() = profile_id);

-- Back-fill: whoever originally added an item obviously wants to watch it.
insert into public.watchlist_wants (item_id, profile_id)
select id, added_by from public.watchlist_items
on conflict do nothing;
