import "server-only";
import { getTvDetails } from "@/lib/tmdb";
import type { FeedEntry } from "@/lib/feed";

export type AutoWatchingItem = {
  userId: string;
  tmdbId: number;
  title: string;
  posterPath: string | null;
  releaseYear: number | null;
  seasonNumber: number;
  inProgress: boolean;
};

/**
 * For each (user, show) pair found in `tvEntries`, figures out which season
 * the user is currently working through — from the season/episode ratings
 * they've already logged, cross-referenced with TMDB's episode counts —
 * without needing any manual "en cours" bookkeeping.
 */
export async function computeAutoWatching(tvEntries: FeedEntry[]): Promise<AutoWatchingItem[]> {
  const byUserShow = new Map<string, FeedEntry[]>();
  for (const e of tvEntries) {
    if (!e.user_id) continue;
    const key = `${e.user_id}:${e.tmdb_id}`;
    const group = byUserShow.get(key);
    if (group) group.push(e);
    else byUserShow.set(key, [e]);
  }

  const showCache = new Map<number, Awaited<ReturnType<typeof getTvDetails>> | null>();
  async function getShow(tmdbId: number) {
    if (showCache.has(tmdbId)) return showCache.get(tmdbId)!;
    const details = await getTvDetails(tmdbId).catch(() => null);
    showCache.set(tmdbId, details);
    return details;
  }

  const results: AutoWatchingItem[] = [];

  for (const [key, group] of byUserShow) {
    const [userId, tmdbIdStr] = key.split(":");
    const tmdbId = Number(tmdbIdStr);
    const details = await getShow(tmdbId);
    if (!details) continue;

    const seasons = details.seasons
      .filter((s) => s.season_number > 0)
      .sort((a, b) => a.season_number - b.season_number);
    if (seasons.length === 0) continue;

    const maxSeasonWatched = Math.max(0, ...group.map((e) => e.season_number ?? 0));
    if (maxSeasonWatched === 0) continue;

    const seasonEntries = group.filter((e) => e.season_number === maxSeasonWatched);
    const hasSeasonLevel = seasonEntries.some((e) => e.granularity === "season");
    const episodesWatched = new Set(
      seasonEntries.filter((e) => e.granularity === "episode").map((e) => e.episode_number),
    );
    const seasonMeta = seasons.find((s) => s.season_number === maxSeasonWatched);
    const complete =
      hasSeasonLevel ||
      (!!seasonMeta && seasonMeta.episode_count > 0 && episodesWatched.size >= seasonMeta.episode_count);

    let targetSeason: number | null = null;
    let inProgress = false;
    if (!complete) {
      targetSeason = maxSeasonWatched;
      inProgress = true;
    } else {
      const next = seasons.find((s) => s.season_number === maxSeasonWatched + 1);
      if (next) {
        targetSeason = next.season_number;
        inProgress = false;
      }
    }

    if (targetSeason === null) continue;

    const sample = group[0];
    results.push({
      userId,
      tmdbId,
      title: sample.title,
      posterPath: sample.poster_path,
      releaseYear: sample.release_year,
      seasonNumber: targetSeason,
      inProgress,
    });
  }

  return results;
}
