"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { posterUrl } from "@/lib/tmdb-image";
import { setTopPick, removeTopPick } from "@/app/actions/top-picks";
import { TopPickPickerModal } from "./TopPickPickerModal";
import { PlusIcon, CloseIcon } from "./icons";
import type { Tables } from "@/lib/database.types";

type Entry = Tables<"watch_entries">;
type TopPick = Tables<"top_picks">;

function summarizeOwn(entries: Entry[], mediaType: "movie" | "tv") {
  const map = new Map<number, { tmdbId: number; title: string; posterPath: string | null; year: number | null }>();
  for (const e of entries) {
    if (e.media_type !== mediaType) continue;
    if (!map.has(e.tmdb_id)) {
      map.set(e.tmdb_id, {
        tmdbId: e.tmdb_id,
        title: e.title,
        posterPath: e.poster_path,
        year: e.release_year,
      });
    }
  }
  return [...map.values()].sort((a, b) => a.title.localeCompare(b.title, "fr"));
}

const RANKS = [1, 2, 3] as const;

function Row({
  label,
  mediaType,
  entries,
  picks,
}: {
  label: string;
  mediaType: "movie" | "tv";
  entries: Entry[];
  picks: TopPick[];
}) {
  const [pickingRank, setPickingRank] = useState<1 | 2 | 3 | null>(null);
  const [isPending, startTransition] = useTransition();
  const items = useMemo(() => summarizeOwn(entries, mediaType), [entries, mediaType]);
  const accent = mediaType === "movie" ? "text-blue" : "text-purple";

  return (
    <div>
      <p className={`mb-3 text-[12.5px] font-bold uppercase tracking-wide ${accent}`}>{label}</p>
      <div className="grid grid-cols-3 gap-4">
        {RANKS.map((rank) => {
          const pick = picks.find((p) => p.rank === rank);
          const poster = pick ? posterUrl(pick.poster_path, "w154") : null;
          return (
            <div key={rank}>
              {pick ? (
                <div className="group relative aspect-[2/3] overflow-hidden rounded-[10px] bg-bg-elev-2 shadow-lg">
                  {poster && (
                    <Image src={poster} alt="" fill sizes="160px" className="object-cover" />
                  )}
                  <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 font-display text-[11px] font-extrabold text-white backdrop-blur">
                    {rank}
                  </div>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => startTransition(() => removeTopPick(mediaType, rank))}
                    aria-label="Retirer"
                    className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur hover:text-red-400"
                  >
                    <CloseIcon className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={items.length === 0}
                  onClick={() => setPickingRank(rank)}
                  className="flex aspect-[2/3] w-full flex-col items-center justify-center gap-1.5 rounded-[10px] border-2 border-dashed border-border-strong text-text-faint disabled:opacity-40"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span className="text-[11px] font-bold">#{rank}</span>
                </button>
              )}
              {pick && (
                <h4 className="mt-2 line-clamp-2 text-[12px] font-bold leading-tight">
                  {pick.title}
                </h4>
              )}
            </div>
          );
        })}
      </div>

      {pickingRank && (
        <TopPickPickerModal
          title={`${label} — top ${pickingRank}`}
          items={items}
          onClose={() => setPickingRank(null)}
          onPick={(item) => {
            startTransition(() => {
              void setTopPick(mediaType, pickingRank, {
                tmdbId: item.tmdbId,
                title: item.title,
                posterPath: item.posterPath,
                releaseYear: item.year,
              });
            });
            setPickingRank(null);
          }}
        />
      )}
    </div>
  );
}

export function TopPicksEditor({ entries, picks }: { entries: Entry[]; picks: TopPick[] }) {
  const moviePicks = picks.filter((p) => p.media_type === "movie");
  const seriesPicks = picks.filter((p) => p.media_type === "tv");

  return (
    <div className="flex flex-col gap-6">
      <Row label="Films" mediaType="movie" entries={entries} picks={moviePicks} />
      <Row label="Séries" mediaType="tv" entries={entries} picks={seriesPicks} />
    </div>
  );
}
