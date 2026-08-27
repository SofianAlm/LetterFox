"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { posterUrl } from "@/lib/tmdb-image";
import { MyEntryTypeList } from "./MyEntryTypeList";
import { AddWatchingSeriesModal } from "./AddWatchingSeriesModal";
import { AddSeriesModal } from "./AddSeriesModal";
import { removeFromWatching } from "@/app/actions/series-progress";
import { PlusIcon, CheckIcon, TrashIcon } from "./icons";
import type { FeedEntry } from "@/lib/feed";
import type { Tables } from "@/lib/database.types";

type Progress = Tables<"series_progress">;

const TABS = [
  { value: "vues", label: "Vues" },
  { value: "en_cours", label: "En cours" },
] as const;

export function MySeriesTabs({
  entries,
  progress,
  currentUserId,
  locations,
}: {
  entries: FeedEntry[];
  progress: Progress[];
  currentUserId: string;
  locations: string[];
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("vues");
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-full border border-border bg-bg-elev-2 p-1">
          {TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              className={`rounded-full px-4 py-2 text-[13px] font-bold ${
                tab === t.value ? "bg-accent text-on-accent" : "text-text-muted"
              }`}
            >
              {t.label}
              {t.value === "en_cours" && progress.length > 0 && ` (${progress.length})`}
            </button>
          ))}
        </div>
        {tab === "en_cours" && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-[10px] bg-accent px-3.5 py-2 text-[12.5px] font-bold text-on-accent"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            Ajouter en cours
          </button>
        )}
      </div>

      {tab === "vues" ? (
        <MyEntryTypeList
          entries={entries}
          currentUserId={currentUserId}
          path="/profile/series"
          basePath="/series"
        />
      ) : (
        <WatchingGrid progress={progress} locations={locations} />
      )}

      {open && <AddWatchingSeriesModal onClose={() => setOpen(false)} />}
    </div>
  );
}

function WatchingGrid({ progress, locations }: { progress: Progress[]; locations: string[] }) {
  const [finishing, setFinishing] = useState<Progress | null>(null);
  const [isPending, startTransition] = useTransition();

  if (progress.length === 0) {
    return (
      <p className="text-sm text-text-faint">
        Aucune série en cours — ajoute-en une, ou note un épisode d&rsquo;une série pas encore
        terminée pour qu&rsquo;elle apparaisse ici automatiquement.
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4 md:grid-cols-5">
        {progress.map((p) => {
          const poster = posterUrl(p.poster_path, "w154");
          return (
            <div key={p.id}>
              <div className="relative aspect-[2/3] overflow-hidden rounded-[10px] bg-bg-elev-2 shadow-lg">
                {poster && (
                  <Image src={poster} alt="" fill sizes="160px" className="object-cover" />
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
              <h3 className="mt-2 line-clamp-2 text-[13px] font-bold leading-tight">{p.title}</h3>
              {p.release_year && (
                <p className="mt-0.5 text-[11.5px] text-text-faint">{p.release_year}</p>
              )}
            </div>
          );
        })}
      </div>

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
    </>
  );
}
