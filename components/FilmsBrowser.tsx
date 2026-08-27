"use client";

import { useState } from "react";
import { BrowseGrid } from "./BrowseGrid";
import { AddFilmModal } from "./AddFilmModal";
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
  return (
    <>
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
