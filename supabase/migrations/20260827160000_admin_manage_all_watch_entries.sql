create policy "admins manage all watch entries"
  on public.watch_entries for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin))
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin));
