import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FilmsBrowser } from "@/components/FilmsBrowser";
import type { FeedEntry } from "@/lib/feed";

export default async function FilmsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: entries }, { data: profiles }, { data: locations }] = await Promise.all([
    supabase
      .from("watch_entries")
      .select("*, profiles(display_name, avatar_color), locations(name), reactions(emoji, user_id)")
      .eq("media_type", "movie")
      .order("watched_on", { ascending: false }),
    supabase.from("profiles").select("id, display_name, avatar_color").order("display_name"),
    supabase.from("locations").select("name").order("name").returns<{ name: string }[]>(),
  ]);

  return (
    <div className="mx-auto max-w-[1240px] px-6 pb-24 pt-10 sm:px-10">
      <FilmsBrowser
        entries={(entries ?? []) as unknown as FeedEntry[]}
        profiles={profiles ?? []}
        locations={(locations ?? []).map((l) => l.name)}
      />
    </div>
  );
}
