"use client";

import { useState } from "react";
import { BrowseGrid } from "./BrowseGrid";
import { AddSeriesModal } from "./AddSeriesModal";
import type { FeedEntry } from "@/lib/feed";

export function SeriesBrowser({
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
        mediaType="tv"
        basePath="/series"
        onAdd={() => setOpen(true)}
      />
      {open && <AddSeriesModal onClose={() => setOpen(false)} locations={locations} />}
    </>
  );
}
