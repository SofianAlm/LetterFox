import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SeriesBrowser } from "@/components/SeriesBrowser";
import { MediaBackground } from "@/components/MediaBackground";
import type { FeedEntry } from "@/lib/feed";

export default async function SeriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: entries }, { data: profiles }, { data: locations }] = await Promise.all([
    supabase
      .from("watch_entries")
      .select("*, profiles(display_name, avatar_color), locations(name), reactions(emoji, user_id)")
      .eq("media_type", "tv")
      .order("watched_on", { ascending: false }),
    supabase.from("profiles").select("id, display_name, avatar_color").order("display_name"),
    supabase.from("locations").select("name").order("name").returns<{ name: string }[]>(),
  ]);

  return (
    <div className="mx-auto max-w-[1240px] px-6 pb-24 pt-10 sm:px-10">
      <MediaBackground media="tv" />
      <SeriesBrowser
        entries={(entries ?? []) as unknown as FeedEntry[]}
        profiles={profiles ?? []}
        locations={(locations ?? []).map((l) => l.name)}
        currentUserId={user.id}
      />
    </div>
  );
}
