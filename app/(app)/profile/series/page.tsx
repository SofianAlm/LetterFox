import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MySeriesTabs } from "@/components/MySeriesTabs";
import { MediaBackground } from "@/components/MediaBackground";
import type { FeedEntry } from "@/lib/feed";

export default async function ProfileSeriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: entries }, { data: progress }, { data: locations }] = await Promise.all([
    supabase
      .from("watch_entries")
      .select("*, profiles(display_name, avatar_color), locations(name), reactions(emoji, user_id)")
      .eq("user_id", user.id)
      .eq("media_type", "tv")
      .order("watched_on", { ascending: false }),
    supabase
      .from("series_progress")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("locations").select("name").order("name").returns<{ name: string }[]>(),
  ]);

  return (
    <div className="rounded-2xl border border-border bg-bg-elev p-7">
      <MediaBackground media="tv" />
      <h3 className="mb-4 text-[15.5px] font-bold">Mes séries</h3>
      <MySeriesTabs
        entries={(entries ?? []) as unknown as FeedEntry[]}
        progress={progress ?? []}
        currentUserId={user.id}
        locations={(locations ?? []).map((l) => l.name)}
      />
    </div>
  );
}
