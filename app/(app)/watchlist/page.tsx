import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WatchlistBrowser } from "@/components/WatchlistBrowser";
import type { Tables } from "@/lib/database.types";

type Item = Tables<"watchlist_items"> & {
  added_by_profile: { display_name: string; avatar_color: string | null } | null;
};

export default async function WatchlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: items } = await supabase
    .from("watchlist_items")
    .select(
      "*, added_by_profile:profiles!watchlist_items_added_by_fkey(display_name, avatar_color)",
    )
    .eq("watched", false)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-[1240px] px-6 pb-24 pt-10 sm:px-10">
      <WatchlistBrowser items={(items ?? []) as unknown as Item[]} currentUserId={user.id} />
    </div>
  );
}
