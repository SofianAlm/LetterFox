"use client";

import { useEffect, useState } from "react";
import { seasonBreakdown, formatRating } from "@/lib/ratings";
import { EpisodeRow } from "./EpisodeRow";
import { ReactionBar } from "./ReactionBar";
import { initials, avatarColor } from "@/lib/avatar-color";
import { formatFullDate } from "@/lib/date";
import type { FeedEntry } from "@/lib/feed";

type Episode = { episode_number: number; name: string };

export function SeriesDetailContent({
  tmdbId,
  entries,
  seasonNumbers,
  currentUserId,
}: {
  tmdbId: number;
  entries: FeedEntry[];
  seasonNumbers: number[];
  currentUserId: string;
}) {
  const [activeSeason, setActiveSeason] = useState(seasonNumbers.at(-1) ?? 1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  useEffect(() => {
    fetch(`/api/tmdb/tv/${tmdbId}/season/${activeSeason}`)
      .then((res) => res.json())
      .then((data) => setEpisodes(data.episodes ?? []));
  }, [tmdbId, activeSeason]);

  const breakdown = seasonBreakdown(entries, activeSeason);
  const seasonWideEntries = entries.filter(
    (e) => e.granularity === "season" && e.season_number === activeSeason,
  );

  return (
    <div className="mt-10">
      <div className="mb-6 flex flex-wrap gap-2">
        {seasonNumbers.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setActiveSeason(s)}
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              s === activeSeason
                ? "bg-purple text-bg"
                : "border border-border bg-bg-elev-2 text-text-muted"
            }`}
          >
            S{s} · {formatRating(seasonBreakdown(entries, s).combined)}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-bg-elev-2 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-[15.5px] font-bold">Saison {activeSeason}</h3>
          <div className="inline-flex items-baseline gap-1 rounded-full bg-purple-soft px-3.5 py-1.5 font-display text-[15px] font-extrabold text-purple">
            {formatRating(breakdown.combined)}
            <span className="text-[11px] opacity-70">/10</span>
          </div>
        </div>
        <p className="mt-2.5 text-[12.5px] leading-relaxed text-text-faint">
          Combine l&rsquo;avis donné sur la saison entière et la moyenne des épisodes notés
          individuellement.
        </p>
        <div className="mt-3 flex flex-wrap gap-2.5">
          <span className="rounded-full bg-bg-elev-3 px-3 py-1.5 text-xs text-text-muted">
            Avis « saison entière » : {formatRating(breakdown.seasonWideAvg)} (
            {breakdown.seasonWideCount} avis)
          </span>
          <span className="rounded-full bg-bg-elev-3 px-3 py-1.5 text-xs text-text-muted">
            Moyenne des épisodes notés : {formatRating(breakdown.episodeAvg)} (
            {breakdown.episodeCount} épisodes)
          </span>
        </div>
      </div>

      {seasonWideEntries.length > 0 && (
        <div className="mt-8">
          <h4 className="mb-4 text-xs font-extrabold uppercase tracking-wide text-text-faint">
            Avis sur la saison entière
          </h4>
          <div className="flex flex-col gap-5 border-b border-border pb-6">
            {seasonWideEntries.map((e) => (
              <div key={e.id} className="flex gap-3">
                <div
                  className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full font-display text-xs font-extrabold text-[oklch(20%_0.03_0)]"
                  style={{ background: avatarColor(e.profiles?.display_name ?? "?") }}
                >
                  {initials(e.profiles?.display_name ?? "?")}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-[13.5px]">
                      <span className="font-bold">{e.profiles?.display_name}</span>
                      <span className="ml-2 text-text-faint">
                        {formatFullDate(e.watched_on)} · {e.language}
                      </span>
                    </div>
                    {!e.is_rewatch && (
                      <span className="inline-flex items-baseline gap-1 rounded-full bg-purple-soft px-2.5 py-1 font-display text-xs font-extrabold text-purple">
                        {formatRating(e.rating)}
                        <span className="text-[9px] opacity-70">/10</span>
                      </span>
                    )}
                  </div>
                  {e.comment && (
                    <p className="mt-2 text-[13.5px] italic leading-relaxed text-text-muted">
                      « {e.comment} »
                    </p>
                  )}
                  <div className="mt-2">
                    <ReactionBar entryId={e.id} reactions={e.reactions} currentUserId={currentUserId} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h4 className="mb-2 text-xs font-extrabold uppercase tracking-wide text-text-faint">
          Épisodes de la saison {activeSeason}
        </h4>
        <div className="flex flex-col">
          {episodes.map((ep) => (
            <EpisodeRow
              key={ep.episode_number}
              episodeNumber={ep.episode_number}
              episodeName={ep.name}
              entries={entries.filter(
                (e) =>
                  e.granularity === "episode" &&
                  e.season_number === activeSeason &&
                  e.episode_number === ep.episode_number,
              )}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
