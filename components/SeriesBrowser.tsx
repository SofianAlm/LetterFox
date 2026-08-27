"use client";

import { useState } from "react";
import { BrowseGrid } from "./BrowseGrid";
import { AddSeriesModal } from "./AddSeriesModal";
import { PlusIcon } from "./icons";
import type { FeedEntry } from "@/lib/feed";

export function SeriesBrowser({
  entries,
  profiles,
  locations,
}: {
  entries: FeedEntry[];
  profiles: { id: string; display_name: string; avatar_color: string | null }[];
  locations: string[];
}) {
  const [open, setOpen] = useState(false);
  const count = entries.length;

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-bold">Séries</h1>
          <p className="mt-1.5 text-sm text-text-faint">
            {count} entrée{count > 1 ? "s" : ""} · note = moyenne saisons + épisodes
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-[10px] bg-purple px-4 py-2.5 text-[13.5px] font-bold text-on-accent"
        >
          <PlusIcon className="h-4 w-4" />
          Ajouter une série
        </button>
      </div>

      <BrowseGrid
        entries={entries}
        profiles={profiles}
        mediaType="tv"
        basePath="/series"
        onAdd={() => setOpen(true)}
      />
      {open && <AddSeriesModal onClose={() => setOpen(false)} locations={locations} />}
    </>
  );
}
