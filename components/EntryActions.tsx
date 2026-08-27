"use client";

import { useState, useTransition } from "react";
import { deleteEntry } from "@/app/actions/watch-entries";
import { EditEntryModal } from "./EditEntryModal";
import { PencilIcon, TrashIcon } from "./icons";
import type { FeedEntry } from "@/lib/feed";

export function EntryActions({
  entry,
  currentUserId,
  path,
}: {
  entry: FeedEntry;
  currentUserId: string;
  path: string;
}) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (entry.user_id !== currentUserId) return null;

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label="Modifier cet avis"
          className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-border bg-bg-elev-2 text-text-muted hover:text-text"
        >
          <PencilIcon className="h-3.5 w-3.5" />
        </button>
        {confirming ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await deleteEntry(entry.id, path);
                setConfirming(false);
              })
            }
            className="rounded-full border border-red-400/40 bg-red-400/10 px-2.5 py-[5px] text-[11px] font-bold text-red-400 disabled:opacity-60"
          >
            {isPending ? "…" : "Confirmer"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            onBlur={() => setConfirming(false)}
            aria-label="Supprimer cet avis"
            className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-border bg-bg-elev-2 text-text-muted hover:text-red-400"
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {editing && <EditEntryModal entry={entry} onClose={() => setEditing(false)} />}
    </>
  );
}
