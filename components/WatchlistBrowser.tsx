"use client";

import { useState } from "react";
import { WatchlistGrid } from "./WatchlistGrid";
import { AddWatchlistModal } from "./AddWatchlistModal";
import { PlusIcon } from "./icons";
import type { Tables } from "@/lib/database.types";

type Item = Tables<"watchlist_items"> & {
  added_by_profile: { display_name: string; avatar_color: string | null } | null;
};

export function WatchlistBrowser({
  items,
  currentUserId,
}: {
  items: Item[];
  currentUserId: string;
}) {
  const [open, setOpen] = useState(false);
  const count = items.length;

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-bold">À voir</h1>
          <p className="mt-1.5 text-sm text-text-faint">
            {count} élément{count > 1 ? "s" : ""} à voir en bande
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-[10px] bg-accent px-4 py-2.5 text-[13.5px] font-bold text-bg"
        >
          <PlusIcon className="h-4 w-4" />
          Ajouter à voir
        </button>
      </div>

      <WatchlistGrid items={items} currentUserId={currentUserId} onAdd={() => setOpen(true)} />
      {open && <AddWatchlistModal onClose={() => setOpen(false)} />}
    </>
  );
}
