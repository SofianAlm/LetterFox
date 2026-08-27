import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WatchlistBrowser } from "@/components/WatchlistBrowser";
import type { Tables } from "@/lib/database.types";

export type WatchlistItem = Tables<"watchlist_items"> & {
  added_by_profile: { display_name: string; avatar_color: string | null } | null;
  wants: {
    profile_id: string;
    profiles: { display_name: string; avatar_color: string | null } | null;
  }[];
};

export default async function WatchlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: items }, { data: profiles }, { data: locations }] = await Promise.all([
    supabase
      .from("watchlist_items")
      .select(
        "*, added_by_profile:profiles!watchlist_items_added_by_fkey(display_name, avatar_color), wants:watchlist_wants(profile_id, profiles(display_name, avatar_color))",
      )
      .eq("watched", false)
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, display_name, avatar_color").order("display_name"),
    supabase.from("locations").select("name").order("name").returns<{ name: string }[]>(),
  ]);

  return (
    <div className="mx-auto max-w-[1240px] px-6 pb-24 pt-10 sm:px-10">
      <WatchlistBrowser
        items={(items ?? []) as unknown as WatchlistItem[]}
        profiles={profiles ?? []}
        locations={(locations ?? []).map((l) => l.name)}
        currentUserId={user.id}
      />
    </div>
  );
}
