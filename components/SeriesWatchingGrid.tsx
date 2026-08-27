"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { posterUrl } from "@/lib/tmdb-image";
import { AddWatchingSeriesModal } from "./AddWatchingSeriesModal";
import { AddSeriesModal } from "./AddSeriesModal";
import { removeFromWatching } from "@/app/actions/series-progress";
import { PlusIcon, CheckIcon, TrashIcon } from "./icons";
import type { Tables } from "@/lib/database.types";

type Progress = Tables<"series_progress">;

export function SeriesWatchingGrid({
  progress,
  locations,
}: {
  progress: Progress[];
  locations: string[];
}) {
  const [open, setOpen] = useState(false);
  const [finishing, setFinishing] = useState<Progress | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-sm text-text-faint">
          {progress.length} série{progress.length > 1 ? "s" : ""} en cours
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-[10px] bg-purple px-4 py-2.5 text-[13.5px] font-bold text-on-accent"
        >
          <PlusIcon className="h-4 w-4" />
          Ajouter en cours
        </button>
      </div>

      {progress.length === 0 ? (
        <p className="text-text-faint">
          Aucune série en cours — ajoute-en une, ou note un épisode d&rsquo;une série pas encore
          terminée pour qu&rsquo;elle apparaisse ici automatiquement.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-[22px] gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {progress.map((p) => {
            const poster = posterUrl(p.poster_path, "w342");
            return (
              <div key={p.id}>
                <div className="relative aspect-[2/3] overflow-hidden rounded-[10px] bg-bg-elev-2 shadow-lg">
                  {poster && (
                    <Image src={poster} alt="" fill sizes="200px" className="object-cover" />
                  )}
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setFinishing(p)}
                    aria-label="Marquer comme terminée"
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur hover:bg-emerald-500"
                  >
                    <CheckIcon className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => startTransition(() => removeFromWatching(p.tmdb_id))}
                    aria-label="Retirer des séries en cours"
                    className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur hover:text-red-400"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
                <h3 className="mt-2.5 line-clamp-2 text-sm font-bold leading-tight">{p.title}</h3>
                {p.release_year && (
                  <p className="mt-1 text-[12.5px] text-text-faint">{p.release_year}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {open && <AddWatchingSeriesModal onClose={() => setOpen(false)} />}
      {finishing && (
        <AddSeriesModal
          onClose={() => setFinishing(null)}
          locations={locations}
          initialSelected={{
            id: finishing.tmdb_id,
            name: finishing.title,
            first_air_date: finishing.release_year ? `${finishing.release_year}-01-01` : null,
            poster_path: finishing.poster_path,
          }}
          initialGranularity="season"
        />
      )}
    </div>
  );
}
