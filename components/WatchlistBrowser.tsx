"use client";

import { useEffect, useMemo, useState } from "react";
import { WatchlistGrid } from "./WatchlistGrid";
import { AddWatchlistModal } from "./AddWatchlistModal";
import { PlusIcon } from "./icons";
import { initials, avatarColor } from "@/lib/avatar-color";
import type { WatchlistItem } from "@/app/(app)/watchlist/page";

type Profile = { id: string; display_name: string; avatar_color: string | null };
type Genre = { id: number; name: string };

const TYPE_TABS = [
  { value: "all", label: "Tout" },
  { value: "movie", label: "Films" },
  { value: "tv", label: "Séries" },
] as const;

export function WatchlistBrowser({
  items,
  profiles,
  locations,
  currentUserId,
}: {
  items: WatchlistItem[];
  profiles: Profile[];
  locations: string[];
  currentUserId: string;
}) {
  const [open, setOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<(typeof TYPE_TABS)[number]["value"]>("all");
  const [selectedWanters, setSelectedWanters] = useState<Set<string>>(new Set());
  const [wantMode, setWantMode] = useState<"any" | "all">("any");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [genreLists, setGenreLists] = useState<{ movie: Genre[]; tv: Genre[] }>({
    movie: [],
    tv: [],
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/tmdb/genres?type=movie").then((res) => res.json()),
      fetch("/api/tmdb/genres?type=tv").then((res) => res.json()),
    ]).then(([movie, tv]) => {
      setGenreLists({ movie: movie.genres ?? [], tv: tv.genres ?? [] });
    });
  }, []);

  const availableGenres = useMemo(() => {
    const names = new Set<string>();
    if (typeFilter !== "tv") for (const g of genreLists.movie) names.add(g.name);
    if (typeFilter !== "movie") for (const g of genreLists.tv) names.add(g.name);
    return [...names].sort((a, b) => a.localeCompare(b, "fr"));
  }, [genreLists, typeFilter]);

  useEffect(() => {
    if (genreFilter !== "all" && !availableGenres.includes(genreFilter)) setGenreFilter("all");
  }, [availableGenres, genreFilter]);

  function toggleWanter(id: string) {
    setSelectedWanters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (typeFilter !== "all" && item.media_type !== typeFilter) return false;
      if (genreFilter !== "all" && !item.genres.includes(genreFilter)) return false;
      if (selectedWanters.size > 0) {
        const wanterIds = new Set(item.wants.map((w) => w.profile_id));
        if (wantMode === "all") {
          for (const id of selectedWanters) if (!wanterIds.has(id)) return false;
        } else {
          let any = false;
          for (const id of selectedWanters) {
            if (wanterIds.has(id)) {
              any = true;
              break;
            }
          }
          if (!any) return false;
        }
      }
      return true;
    });
  }, [items, typeFilter, genreFilter, selectedWanters, wantMode]);

  const count = filtered.length;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-bold">À voir</h1>
          <p className="mt-1.5 text-sm text-text-faint">
            {count} élément{count > 1 ? "s" : ""} à voir en bande
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-[10px] bg-accent px-4 py-2.5 text-[13.5px] font-bold text-on-accent"
        >
          <PlusIcon className="h-4 w-4" />
          Ajouter à voir
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3 border-b border-border pb-6">
        <div className="flex rounded-full border border-border bg-bg-elev-2 p-1">
          {TYPE_TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTypeFilter(t.value)}
              className={`rounded-full px-4 py-2 text-[13px] font-bold ${
                typeFilter === t.value ? "bg-accent text-on-accent" : "text-text-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="hidden h-6 w-px bg-border sm:block" />

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedWanters(new Set())}
            className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold ${
              selectedWanters.size === 0
                ? "bg-accent-soft text-accent"
                : "bg-bg-elev-2 text-text-muted"
            }`}
          >
            Tout le monde
          </button>
          {profiles.map((p) => {
            const active = selectedWanters.has(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggleWanter(p.id)}
                className={`flex items-center gap-1.5 rounded-full border border-border-strong py-1 pl-1 pr-3 text-[12.5px] font-semibold ${
                  active ? "bg-accent-soft text-accent" : "bg-bg-elev-2 text-text-muted"
                }`}
              >
                <span
                  className="flex h-[18px] w-[18px] items-center justify-center rounded-full font-display text-[7.5px] font-extrabold text-on-accent"
                  style={{ background: p.avatar_color ?? avatarColor(p.display_name) }}
                >
                  {initials(p.display_name)}
                </span>
                {p.id === currentUserId ? "Moi" : p.display_name}
              </button>
            );
          })}
        </div>

        {selectedWanters.size >= 2 && (
          <div className="flex rounded-full border border-border bg-bg-elev-2 p-1">
            <button
              type="button"
              onClick={() => setWantMode("any")}
              className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-bold ${
                wantMode === "any" ? "bg-accent text-on-accent" : "text-text-muted"
              }`}
            >
              Chacun
            </button>
            <button
              type="button"
              onClick={() => setWantMode("all")}
              className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-bold ${
                wantMode === "all" ? "bg-accent text-on-accent" : "text-text-muted"
              }`}
            >
              En commun
            </button>
          </div>
        )}
      </div>

      {availableGenres.length > 0 && (
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <span className="text-[12.5px] font-bold text-text-faint">Catégorie</span>
          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="rounded-full border border-border-strong bg-bg-elev-2 px-3.5 py-1.5 text-[12.5px] font-semibold text-text focus:border-accent focus:outline-none"
          >
            <option value="all">Toutes les catégories</option>
            {availableGenres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      )}

      <WatchlistGrid
        items={filtered}
        currentUserId={currentUserId}
        locations={locations}
        onAdd={() => setOpen(true)}
      />
      {open && <AddWatchlistModal onClose={() => setOpen(false)} />}
    </>
  );
}
