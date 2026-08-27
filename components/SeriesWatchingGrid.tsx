"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { posterUrl } from "@/lib/tmdb-image";
import { initials, avatarColor } from "@/lib/avatar-color";
import { AddWatchingSeriesModal } from "./AddWatchingSeriesModal";
import { AddSeriesModal } from "./AddSeriesModal";
import { removeFromWatching } from "@/app/actions/series-progress";
import { PlusIcon, CheckIcon, TrashIcon } from "./icons";
import type { Tables } from "@/lib/database.types";
import type { AutoWatchingItem } from "@/lib/series-watching";

type Progress = Tables<"series_progress">;
type Profile = { id: string; display_name: string; avatar_color: string | null };

type Item = {
  key: string;
  userId: string;
  tmdbId: number;
  title: string;
  posterPath: string | null;
  releaseYear: number | null;
  seasonNumber: number | null;
  inProgress: boolean;
  manual: boolean;
};

export function SeriesWatchingGrid({
  autoItems,
  manualItems,
  profiles,
  locations,
  currentUserId,
}: {
  autoItems: AutoWatchingItem[];
  manualItems: Progress[];
  profiles: Profile[];
  locations: string[];
  currentUserId: string;
}) {
  const [open, setOpen] = useState(false);
  const [finishing, setFinishing] = useState<Item | null>(null);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const items = useMemo<Item[]>(() => {
    const autoKeys = new Set(autoItems.map((a) => `${a.userId}:${a.tmdbId}`));
    const auto: Item[] = autoItems.map((a) => ({
      key: `auto:${a.userId}:${a.tmdbId}:${a.seasonNumber}`,
      userId: a.userId,
      tmdbId: a.tmdbId,
      title: a.title,
      posterPath: a.posterPath,
      releaseYear: a.releaseYear,
      seasonNumber: a.seasonNumber,
      inProgress: a.inProgress,
      manual: false,
    }));
    const manual: Item[] = manualItems
      .filter((m) => !autoKeys.has(`${m.user_id}:${m.tmdb_id}`))
      .map((m) => ({
        key: `manual:${m.id}`,
        userId: m.user_id,
        tmdbId: m.tmdb_id,
        title: m.title,
        posterPath: m.poster_path,
        releaseYear: m.release_year,
        seasonNumber: null,
        inProgress: false,
        manual: true,
      }));
    return [...auto, ...manual];
  }, [autoItems, manualItems]);

  const profilesWithItems = profiles.filter((p) => items.some((i) => i.userId === p.id));
  const visible = items.filter((i) => !excluded.has(i.userId));

  function toggle(id: string) {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-text-faint">
          {visible.length} série{visible.length > 1 ? "s" : ""} en cours
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-[10px] bg-purple px-4 py-2.5 text-[13.5px] font-bold text-on-accent"
        >
          <PlusIcon className="h-4 w-4" />
          Ajouter en cours
        </button>
      </div>

      {profilesWithItems.length > 1 && (
        <div className="mb-6 flex flex-wrap items-center gap-2.5 border-b border-border pb-5">
          <span className="text-[12.5px] font-bold text-text-faint">Filtrer par personne</span>
          <button
            type="button"
            onClick={() => setExcluded(new Set())}
            className={`rounded-full px-4 py-2 text-[13px] font-semibold ${
              excluded.size === 0 ? "bg-accent-soft text-purple" : "bg-bg-elev-2 text-text-muted"
            }`}
          >
            Tout le monde
          </button>
          {profilesWithItems.map((p) => {
            const off = excluded.has(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggle(p.id)}
                className={`flex items-center gap-2 rounded-full border border-border-strong bg-bg-elev-2 py-1.5 pl-1.5 pr-3.5 text-[13px] font-semibold text-text ${
                  off ? "opacity-40" : ""
                }`}
              >
                <span
                  className="flex h-[22px] w-[22px] items-center justify-center rounded-full font-display text-[9.5px] font-extrabold text-[oklch(20%_0.03_0)]"
                  style={{ background: p.avatar_color ?? avatarColor(p.display_name) }}
                >
                  {initials(p.display_name)}
                </span>
                {p.display_name}
              </button>
            );
          })}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="text-text-faint">
          Aucune série en cours — ajoute-en une, ou note un épisode d&rsquo;une série pas encore
          terminée pour qu&rsquo;elle apparaisse ici automatiquement.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-[22px] gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {visible.map((item) => {
            const poster = posterUrl(item.posterPath, "w342");
            const owner = profiles.find((p) => p.id === item.userId);
            const mine = item.userId === currentUserId;
            return (
              <div key={item.key}>
                <div className="relative aspect-[2/3] overflow-hidden rounded-[10px] bg-bg-elev-2 shadow-lg">
                  {poster && (
                    <Image src={poster} alt="" fill sizes="200px" className="object-cover" />
                  )}
                  {item.seasonNumber !== null && (
                    <div className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 font-display text-[11px] font-extrabold text-purple backdrop-blur">
                      S{item.seasonNumber}
                    </div>
                  )}
                  {owner && (
                    <span
                      className="absolute left-2 bottom-2 flex h-6 w-6 items-center justify-center rounded-full font-display text-[9.5px] font-extrabold text-[oklch(20%_0.03_0)] shadow"
                      style={{ background: owner.avatar_color ?? avatarColor(owner.display_name) }}
                      title={owner.display_name}
                    >
                      {initials(owner.display_name)}
                    </span>
                  )}
                  {mine && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => setFinishing(item)}
                      aria-label="Marquer cette saison"
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur hover:bg-emerald-500"
                    >
                      <CheckIcon className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {mine && item.manual && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => startTransition(() => removeFromWatching(item.tmdbId))}
                      aria-label="Retirer des séries en cours"
                      className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur hover:text-red-400"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <h3 className="mt-2.5 line-clamp-2 text-sm font-bold leading-tight">
                  {item.title}
                  {item.seasonNumber !== null && (
                    <span className="text-text-faint"> — Saison {item.seasonNumber}</span>
                  )}
                </h3>
                {item.releaseYear && (
                  <p className="mt-1 text-[12.5px] text-text-faint">{item.releaseYear}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {open && <AddWatchingSeriesModal onClose={() => setOpen(false)} />}
      {finishing && (
        <AddSeriesModal
          onClose={() => setFinishing(null)}
          locations={locations}
          initialSelected={{
            id: finishing.tmdbId,
            name: finishing.title,
            first_air_date: finishing.releaseYear ? `${finishing.releaseYear}-01-01` : null,
            poster_path: finishing.posterPath,
          }}
          initialGranularity="season"
          initialSeasonNumber={finishing.seasonNumber ?? undefined}
        />
      )}
    </div>
  );
}
