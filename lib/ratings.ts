import type { Tables } from "@/lib/database.types";

type WatchEntry = Tables<"watch_entries">;

function average(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/** Note d'un épisode = moyenne de tous les avis "episode" postés sur cet épisode précis. */
export function episodeAverage(
  entries: WatchEntry[],
  seasonNumber: number,
  episodeNumber: number,
): number | null {
  const ratings = entries
    .filter(
      (e) =>
        e.granularity === "episode" &&
        e.season_number === seasonNumber &&
        e.episode_number === episodeNumber &&
        e.rating !== null,
    )
    .map((e) => e.rating!);
  return average(ratings);
}

export type SeasonBreakdown = {
  seasonWideAvg: number | null;
  seasonWideCount: number;
  episodeAvg: number | null;
  episodeCount: number;
  combined: number | null;
};

/**
 * Note d'une saison = moyenne de la liste [chaque avis "saison entière",
 * chaque moyenne d'épisode ayant au moins un avis]. Un épisode jamais vu par
 * la bande n'entre dans aucune moyenne.
 */
export function seasonBreakdown(entries: WatchEntry[], seasonNumber: number): SeasonBreakdown {
  const seasonWideRatings = entries
    .filter(
      (e) => e.granularity === "season" && e.season_number === seasonNumber && e.rating !== null,
    )
    .map((e) => e.rating!);

  const episodeNumbers = new Set(
    entries
      .filter((e) => e.granularity === "episode" && e.season_number === seasonNumber)
      .map((e) => e.episode_number!),
  );

  const episodeAverages = [...episodeNumbers]
    .map((ep) => episodeAverage(entries, seasonNumber, ep))
    .filter((v): v is number => v !== null);

  return {
    seasonWideAvg: average(seasonWideRatings),
    seasonWideCount: seasonWideRatings.length,
    episodeAvg: average(episodeAverages),
    episodeCount: episodeAverages.length,
    combined: average([...seasonWideRatings, ...episodeAverages]),
  };
}

export function seasonAverage(entries: WatchEntry[], seasonNumber: number): number | null {
  return seasonBreakdown(entries, seasonNumber).combined;
}

/** Note globale de la série = moyenne des notes de saison. */
export function seriesAverage(entries: WatchEntry[]): number | null {
  const seasonNumbers = new Set(
    entries
      .filter((e) => e.media_type === "tv" && e.season_number !== null)
      .map((e) => e.season_number!),
  );
  const seasonAverages = [...seasonNumbers]
    .map((s) => seasonAverage(entries, s))
    .filter((v): v is number => v !== null);
  return average(seasonAverages);
}

/** Note d'un film = moyenne simple de tous les avis (hors rewatch, sans note). */
export function movieAverage(entries: WatchEntry[]): number | null {
  return average(entries.filter((e) => e.rating !== null).map((e) => e.rating!));
}

export function formatRating(value: number | null): string {
  if (value === null) return "—";
  return value.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
