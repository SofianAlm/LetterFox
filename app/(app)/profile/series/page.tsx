import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MyEntryTypeList } from "@/components/MyEntryTypeList";
import { MediaBackground } from "@/components/MediaBackground";
import type { FeedEntry } from "@/lib/feed";

export default async function ProfileSeriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: entries } = await supabase
    .from("watch_entries")
    .select("*, profiles(display_name, avatar_color), locations(name), reactions(emoji, user_id, profiles(display_name))")
    .eq("user_id", user.id)
    .eq("media_type", "tv")
    .order("watched_on", { ascending: false });

  return (
    <div className="rounded-2xl border border-border bg-bg-elev p-7">
      <MediaBackground media="tv" />
      <h3 className="mb-4 text-[15.5px] font-bold">Mes séries</h3>
      <MyEntryTypeList
        entries={(entries ?? []) as unknown as FeedEntry[]}
        currentUserId={user.id}
        path="/profile/series"
        basePath="/series"
      />
    </div>
  );
}
