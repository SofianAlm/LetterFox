import type { Tables } from "@/lib/database.types";

export type FeedEntry = Tables<"watch_entries"> & {
  profiles: { display_name: string; avatar_color: string | null } | null;
  locations: { name: string } | null;
  reactions: { emoji: string; user_id: string }[];
};

function groupKey(
  e: Pick<FeedEntry, "media_type" | "tmdb_id" | "season_number" | "episode_number" | "watched_on">,
): string {
  return [e.media_type, e.tmdb_id, e.season_number ?? "", e.episode_number ?? "", e.watched_on].join(
    "|",
  );
}

/**
 * Regroupe les entrées vues par plusieurs personnes le même jour pour le
 * même film/saison/épisode, en conservant l'ordre chronologique (le plus
 * récent en premier) déjà appliqué par la requête.
 */
export function groupFeedEntries(entries: FeedEntry[]): FeedEntry[][] {
  const groups = new Map<string, FeedEntry[]>();
  for (const entry of entries) {
    const key = groupKey(entry);
    const list = groups.get(key);
    if (list) list.push(entry);
    else groups.set(key, [entry]);
  }

  const ordered: FeedEntry[][] = [];
  const seen = new Set<string>();
  for (const entry of entries) {
    const key = groupKey(entry);
    if (seen.has(key)) continue;
    seen.add(key);
    const group = groups.get(key)!;
    // Best rating first when several people reviewed the same thing the same day.
    group.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    ordered.push(group);
  }
  return ordered;
}
