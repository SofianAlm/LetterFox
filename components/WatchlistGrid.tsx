"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { posterUrl } from "@/lib/tmdb-image";
import { initials, avatarColor } from "@/lib/avatar-color";
import { markWatchlistItemWatched, deleteWatchlistItem } from "@/app/actions/watchlist";
import { CheckIcon, TrashIcon, PlusIcon } from "./icons";
import type { Tables } from "@/lib/database.types";

type Item = Tables<"watchlist_items"> & {
  added_by_profile: { display_name: string; avatar_color: string | null } | null;
};

export function WatchlistGrid({
  items,
  currentUserId,
  onAdd,
}: {
  items: Item[];
  currentUserId: string;
  onAdd: () => void;
}) {
  return (
    <div className="relative">
      {items.length === 0 ? (
        <p className="text-text-faint">Rien à voir pour l&rsquo;instant.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-[22px] gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((item) => (
            <WatchlistCard key={item.id} item={item} currentUserId={currentUserId} />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onAdd}
        className="fixed bottom-10 right-6 z-10 flex h-[58px] w-[58px] items-center justify-center rounded-full bg-accent text-bg shadow-xl sm:right-10"
        aria-label="Ajouter à voir"
      >
        <PlusIcon className="h-6 w-6" />
      </button>
    </div>
  );
}

function WatchlistCard({ item, currentUserId }: { item: Item; currentUserId: string }) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const poster = posterUrl(item.poster_path, "w342");
  const accent = item.media_type === "movie" ? "text-blue" : "text-purple";
  const canDelete = item.added_by === currentUserId;

  return (
    <div>
      <div className="relative aspect-[2/3] overflow-hidden rounded-[10px] bg-bg-elev-2 shadow-lg">
        {poster && <Image src={poster} alt="" fill sizes="200px" className="object-cover" />}
        <div
          className={`absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[10.5px] font-extrabold uppercase tracking-wide backdrop-blur ${accent}`}
        >
          {item.media_type === "movie" ? "Film" : "Série"}
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(() => {
              markWatchlistItemWatched(item.id);
            })
          }
          aria-label="Marquer comme vu"
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur hover:bg-emerald-500"
        >
          <CheckIcon className="h-3.5 w-3.5" />
        </button>
        {canDelete && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              if (confirming) {
                startTransition(() => {
                  deleteWatchlistItem(item.id);
                });
              } else {
                setConfirming(true);
              }
            }}
            onBlur={() => setConfirming(false)}
            aria-label="Supprimer de la liste"
            className={`absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 backdrop-blur ${
              confirming ? "text-red-400" : "text-white hover:text-red-400"
            }`}
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <h3 className="mt-2.5 line-clamp-2 text-sm font-bold leading-tight">{item.title}</h3>
      <div className="mt-1 flex items-center gap-1.5">
        <span
          className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full font-display text-[8px] font-extrabold text-[oklch(20%_0.03_0)]"
          style={{
            background:
              item.added_by_profile?.avatar_color ??
              avatarColor(item.added_by_profile?.display_name ?? "?"),
          }}
        >
          {initials(item.added_by_profile?.display_name ?? "?")}
        </span>
        <p className="text-[12px] text-text-faint">
          {item.release_year ?? ""} · ajouté par {item.added_by_profile?.display_name ?? "?"}
        </p>
      </div>
    </div>
  );
}
