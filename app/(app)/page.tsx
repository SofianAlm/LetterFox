import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { groupFeedEntries, type FeedEntry } from "@/lib/feed";
import { FeedEntryGroup } from "@/components/FeedEntryGroup";

const FILTERS = [
  { value: "all", label: "Tout" },
  { value: "movie", label: "Films" },
  { value: "tv", label: "Séries" },
] as const;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const activeFilter = type === "movie" || type === "tv" ? type : "all";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("watch_entries")
    .select("*, profiles(display_name, avatar_color), locations(name), reactions(emoji, user_id)")
    .order("watched_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(60);

  if (activeFilter !== "all") query = query.eq("media_type", activeFilter);

  const { data } = await query;
  const entries = (data ?? []) as unknown as FeedEntry[];
  const groups = groupFeedEntries(entries);

  return (
    <div className="mx-auto max-w-[920px] px-6 pb-20 sm:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4 py-9">
        <h1 className="font-display text-[26px] font-bold">Accueil</h1>
        <div className="inline-flex gap-1 rounded-full border border-border bg-bg-elev-2 p-1">
          {FILTERS.map((f) => (
            <Link
              key={f.value}
              href={f.value === "all" ? "/" : `/?type=${f.value}`}
              className={`rounded-full px-4 py-2 text-[13px] font-bold ${
                activeFilter === f.value ? "bg-accent text-bg" : "text-text-muted"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="text-text-faint">
          Aucun visionnage enregistré pour l&rsquo;instant — direction Films ou Séries pour ajouter
          le premier.
        </p>
      ) : (
        <div className="flex flex-col">
          {groups.map((group) => (
            <FeedEntryGroup key={group[0].id} entries={group} currentUserId={user?.id ?? ""} />
          ))}
        </div>
      )}
    </div>
  );
}
