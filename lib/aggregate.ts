import type { FeedEntry } from "@/lib/feed";
import { movieAverage, seriesAverage } from "@/lib/ratings";

export type TitleSummary = {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  year: number | null;
  mediaType: "movie" | "tv";
  entries: FeedEntry[];
};

export function summarizeByTitle(entries: FeedEntry[]): TitleSummary[] {
  const map = new Map<number, TitleSummary>();
  for (const e of entries) {
    const existing = map.get(e.tmdb_id);
    if (existing) {
      existing.entries.push(e);
    } else {
      map.set(e.tmdb_id, {
        tmdbId: e.tmdb_id,
        title: e.title,
        posterPath: e.poster_path,
        year: e.release_year,
        mediaType: e.media_type as "movie" | "tv",
        entries: [e],
      });
    }
  }
  return [...map.values()].sort((a, b) => {
    const latest = (s: TitleSummary) =>
      Math.max(...s.entries.map((e) => new Date(e.watched_on).getTime()));
    return latest(b) - latest(a);
  });
}

export function titleAverage(summary: TitleSummary): number | null {
  return summary.mediaType === "movie"
    ? movieAverage(summary.entries)
    : seriesAverage(summary.entries);
}

export function latestSeason(summary: TitleSummary): number {
  return Math.max(0, ...summary.entries.map((e) => e.season_number ?? 0));
}

export function latestWatchedOn(summary: TitleSummary): number {
  return Math.max(...summary.entries.map((e) => new Date(e.watched_on).getTime()));
}
