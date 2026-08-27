"use client";

import { useState } from "react";
import { BrowseGrid } from "./BrowseGrid";
import { AddFilmModal } from "./AddFilmModal";
import { PlusIcon } from "./icons";
import type { FeedEntry } from "@/lib/feed";

export function FilmsBrowser({
  entries,
  profiles,
  locations,
}: {
  entries: FeedEntry[];
  profiles: { id: string; display_name: string }[];
  locations: string[];
}) {
  const [open, setOpen] = useState(false);
  const count = entries.length;

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-bold">Films</h1>
          <p className="mt-1.5 text-sm text-text-faint">
            {count} entrée{count > 1 ? "s" : ""} · note = moyenne des avis
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-[10px] bg-blue px-4 py-2.5 text-[13.5px] font-bold text-bg"
        >
          <PlusIcon className="h-4 w-4" />
          Ajouter un film
        </button>
      </div>

      <BrowseGrid
        entries={entries}
        profiles={profiles}
        mediaType="movie"
        basePath="/films"
        onAdd={() => setOpen(true)}
      />
      {open && <AddFilmModal onClose={() => setOpen(false)} locations={locations} />}
    </>
  );
}
