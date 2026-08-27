import { createClient } from "@/lib/supabase/server";
import { FilmsBrowser } from "@/components/FilmsBrowser";
import type { FeedEntry } from "@/lib/feed";

export default async function FilmsPage() {
  const supabase = await createClient();

  const [{ data: entries }, { data: profiles }, { data: locations }] = await Promise.all([
    supabase
      .from("watch_entries")
      .select("*, profiles(display_name), locations(name), reactions(emoji, user_id)")
      .eq("media_type", "movie")
      .order("watched_on", { ascending: false }),
    supabase.from("profiles").select("id, display_name").order("display_name"),
    supabase.from("locations").select("name").order("name").returns<{ name: string }[]>(),
  ]);

  const count = entries?.length ?? 0;

  return (
    <div className="mx-auto max-w-[1240px] px-6 pb-24 pt-10 sm:px-10">
      <div className="mb-8">
        <h1 className="font-display text-[28px] font-bold">Films</h1>
        <p className="mt-1.5 text-sm text-text-faint">
          {count} entrée{count > 1 ? "s" : ""} · note = moyenne des avis
        </p>
      </div>
      <FilmsBrowser
        entries={(entries ?? []) as unknown as FeedEntry[]}
        profiles={profiles ?? []}
        locations={(locations ?? []).map((l) => l.name)}
      />
    </div>
  );
}
