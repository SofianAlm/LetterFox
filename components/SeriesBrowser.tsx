"use client";

import { useState } from "react";
import { BrowseGrid } from "./BrowseGrid";
import { AddSeriesModal } from "./AddSeriesModal";
import { SeriesWatchingGrid } from "./SeriesWatchingGrid";
import { PlusIcon } from "./icons";
import type { FeedEntry } from "@/lib/feed";
import type { TitleSummary } from "@/lib/aggregate";
import type { Tables } from "@/lib/database.types";
import type { AutoWatchingItem } from "@/lib/series-watching";

const TABS = [
  { value: "vues", label: "Vues" },
  { value: "en_cours", label: "En cours" },
] as const;

export function SeriesBrowser({
  entries,
  profiles,
  locations,
  currentUserId,
  autoWatching,
  manualWatching,
}: {
  entries: FeedEntry[];
  profiles: { id: string; display_name: string; avatar_color: string | null }[];
  locations: string[];
  currentUserId: string;
  autoWatching: AutoWatchingItem[];
  manualWatching: Tables<"series_progress">[];
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("vues");
  const [open, setOpen] = useState(false);
  const [quickAdd, setQuickAdd] = useState<TitleSummary | null>(null);
  const count = entries.length;
  const watchingKeys = new Set(autoWatching.map((a) => `${a.userId}:${a.tmdbId}`));
  const watchingCount =
    autoWatching.length +
    manualWatching.filter((m) => !watchingKeys.has(`${m.user_id}:${m.tmdb_id}`)).length;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-bold">Séries</h1>
          <p className="mt-1.5 text-sm text-text-faint">
            {count} entrée{count > 1 ? "s" : ""}
          </p>
        </div>
        {tab === "vues" && (
          <button
            type="button"
            onClick={() => {
              setQuickAdd(null);
              setOpen(true);
            }}
            className="flex items-center gap-2 rounded-[10px] bg-purple px-4 py-2.5 text-[13.5px] font-bold text-on-accent"
          >
            <PlusIcon className="h-4 w-4" />
            Ajouter une série
          </button>
        )}
      </div>

      <div className="mb-8 flex rounded-full border border-border bg-bg-elev-2 p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={`rounded-full px-4 py-2 text-[13px] font-bold ${
              tab === t.value ? "bg-purple text-on-accent" : "text-text-muted"
            }`}
          >
            {t.label}
            {t.value === "en_cours" && watchingCount > 0 && ` (${watchingCount})`}
          </button>
        ))}
      </div>

      {tab === "vues" ? (
        <BrowseGrid
          entries={entries}
          profiles={profiles}
          mediaType="tv"
          basePath="/series"
          currentUserId={currentUserId}
          onAdd={() => {
            setQuickAdd(null);
            setOpen(true);
          }}
          onQuickAdd={(summary) => {
            setQuickAdd(summary);
            setOpen(true);
          }}
        />
      ) : (
        <SeriesWatchingGrid
          autoItems={autoWatching}
          manualItems={manualWatching}
          profiles={profiles}
          locations={locations}
          currentUserId={currentUserId}
        />
      )}

      {open &&
        (() => {
          const source = quickAdd?.entries[0];
          return (
            <AddSeriesModal
              onClose={() => setOpen(false)}
              locations={locations}
              initialSelected={
                quickAdd
                  ? {
                      id: quickAdd.tmdbId,
                      name: quickAdd.title,
                      first_air_date: quickAdd.year ? `${quickAdd.year}-01-01` : null,
                      poster_path: quickAdd.posterPath,
                      genres: source?.genres,
                    }
                  : undefined
              }
              initialWatchedOn={source?.watched_on}
              initialLanguage={source?.language === "VO" ? "VO" : "VF"}
              initialLocation={source?.locations?.name ?? undefined}
              initialGranularity={source?.granularity === "episode" ? "episode" : "season"}
              initialSeasonNumber={source?.season_number ?? undefined}
              initialEpisodeNumber={source?.episode_number ?? undefined}
            />
          );
        })()}
    </>
  );
}
