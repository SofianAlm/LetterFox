-- La page d'accueil doit être visible sans connexion (bouton "Se connecter"
-- affiché sinon). Lecture seule : les policies "authenticated" existantes
-- restent seules à autoriser l'écriture.
create policy "profiles are readable by anon" on public.profiles
  for select to anon using (true);

create policy "locations are readable by anon" on public.locations
  for select to anon using (true);

create policy "watch entries are readable by anon" on public.watch_entries
  for select to anon using (true);

create policy "reactions are readable by anon" on public.reactions
  for select to anon using (true);
