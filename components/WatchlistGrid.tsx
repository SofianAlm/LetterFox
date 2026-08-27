"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { posterUrl } from "@/lib/tmdb-image";
import { initials, avatarColor } from "@/lib/avatar-color";
import { markWatchlistItemWatched, deleteWatchlistItem, toggleWant } from "@/app/actions/watchlist";
import { MarkWatchedPrompt } from "./MarkWatchedPrompt";
import { AddFilmModal } from "./AddFilmModal";
import { AddSeriesModal } from "./AddSeriesModal";
import { CheckIcon, TrashIcon, PlusIcon } from "./icons";
import type { WatchlistItem } from "@/app/(app)/watchlist/page";

export function WatchlistGrid({
  items,
  currentUserId,
  locations,
  onAdd,
}: {
  items: WatchlistItem[];
  currentUserId: string;
  locations: string[];
  onAdd: () => void;
}) {
  return (
    <div className="relative">
      {items.length === 0 ? (
        <p className="text-text-faint">Rien à voir pour l&rsquo;instant.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-[22px] gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((item) => (
            <WatchlistCard
              key={item.id}
              item={item}
              currentUserId={currentUserId}
              locations={locations}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onAdd}
        className="fixed bottom-10 right-6 z-10 flex h-[58px] w-[58px] items-center justify-center rounded-full bg-accent text-on-accent shadow-xl sm:right-10"
        aria-label="Ajouter à voir"
      >
        <PlusIcon className="h-6 w-6" />
      </button>
    </div>
  );
}

function WatchlistCard({
  item,
  currentUserId,
  locations,
}: {
  item: WatchlistItem;
  currentUserId: string;
  locations: string[];
}) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [prompting, setPrompting] = useState(false);
  const [addingEntry, setAddingEntry] = useState(false);
  const poster = posterUrl(item.poster_path, "w342");
  const accent = item.media_type === "movie" ? "text-blue" : "text-purple";
  const canDelete = item.added_by === currentUserId;
  const iWant = item.wants.some((w) => w.profile_id === currentUserId);

  function markWatched() {
    startTransition(() => {
      markWatchlistItemWatched(item.id);
    });
  }

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
          onClick={() => setPrompting(true)}
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
      {item.genres.length > 0 && (
        <p className="mt-0.5 truncate text-[11px] text-text-faint">{item.genres.join(" · ")}</p>
      )}
      <div className="mt-1 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span
            className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full font-display text-[8px] font-extrabold text-on-accent"
            style={{
              background:
                item.added_by_profile?.avatar_color ??
                avatarColor(item.added_by_profile?.display_name ?? "?"),
            }}
          >
            {initials(item.added_by_profile?.display_name ?? "?")}
          </span>
          <p className="truncate text-[12px] text-text-faint">{item.release_year ?? ""}</p>
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(() => {
              toggleWant(item.id, iWant);
            })
          }
          aria-label={iWant ? "Retirer de mes envies" : "Je veux voir aussi"}
          className={`flex-shrink-0 text-[15px] leading-none ${
            iWant ? "text-red-400" : "text-text-faint hover:text-red-400"
          }`}
        >
          {iWant ? "♥" : "♡"}
        </button>
      </div>
      {item.wants.length > 0 && (
        <div className="mt-1.5 flex -space-x-1.5">
          {item.wants.slice(0, 5).map((w) => (
            <span
              key={w.profile_id}
              title={w.profiles?.display_name ?? "?"}
              className="flex h-[16px] w-[16px] items-center justify-center rounded-full border border-bg font-display text-[6.5px] font-extrabold text-on-accent"
              style={{
                background: w.profiles?.avatar_color ?? avatarColor(w.profiles?.display_name ?? "?"),
              }}
            >
              {initials(w.profiles?.display_name ?? "?")}
            </span>
          ))}
        </div>
      )}

      {prompting && (
        <MarkWatchedPrompt
          title={item.title}
          onClose={() => setPrompting(false)}
          onAlreadySeen={() => {
            setPrompting(false);
            markWatched();
          }}
          onJustWatched={() => {
            setPrompting(false);
            setAddingEntry(true);
          }}
        />
      )}

      {addingEntry && item.media_type === "movie" && (
        <AddFilmModal
          onClose={() => setAddingEntry(false)}
          locations={locations}
          initialSelected={{
            id: item.tmdb_id,
            title: item.title,
            release_date: item.release_year ? `${item.release_year}-01-01` : null,
            poster_path: item.poster_path,
          }}
          onAdded={markWatched}
        />
      )}
      {addingEntry && item.media_type === "tv" && (
        <AddSeriesModal
          onClose={() => setAddingEntry(false)}
          locations={locations}
          initialSelected={{
            id: item.tmdb_id,
            name: item.title,
            first_air_date: item.release_year ? `${item.release_year}-01-01` : null,
            poster_path: item.poster_path,
          }}
          onAdded={markWatched}
        />
      )}
    </div>
  );
}
