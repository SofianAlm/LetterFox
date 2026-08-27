"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { posterUrl } from "@/lib/tmdb-image";
import { SearchIcon } from "./icons";
import type { Tables } from "@/lib/database.types";

type Entry = Tables<"watch_entries">;

type Item = {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  year: number | null;
  mediaType: "movie" | "tv";
  count: number;
  latest: string;
};

function summarize(entries: Entry[]): Item[] {
  const map = new Map<number, Item>();
  for (const e of entries) {
    const existing = map.get(e.tmdb_id);
    if (existing) {
      existing.count += 1;
      if (e.watched_on > existing.latest) existing.latest = e.watched_on;
    } else {
      map.set(e.tmdb_id, {
        tmdbId: e.tmdb_id,
        title: e.title,
        posterPath: e.poster_path,
        year: e.release_year,
        mediaType: e.media_type as "movie" | "tv",
        count: 1,
        latest: e.watched_on,
      });
    }
  }
  return [...map.values()].sort((a, b) => (a.latest < b.latest ? 1 : -1));
}

const TABS = [
  { value: "all", label: "Tout" },
  { value: "movie", label: "Films" },
  { value: "tv", label: "Séries" },
] as const;

export function MyEntriesGrid({ entries }: { entries: Entry[] }) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("all");
  const items = useMemo(() => summarize(entries), [entries]);

  const filtered = items.filter(
    (item) =>
      (tab === "all" || item.mediaType === tab) &&
      item.title.toLowerCase().includes(query.trim().toLowerCase()),
  );

  if (items.length === 0) {
    return <p className="text-sm text-text-faint">Rien ajouté pour l&rsquo;instant.</p>;
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[180px] flex-1">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher dans mes ajouts…"
            className="w-full rounded-[10px] border border-border-strong bg-bg-elev-2 py-2.5 pl-[42px] pr-3.5 text-sm focus:border-accent focus:outline-none"
          />
        </div>
        <div className="flex rounded-full border border-border bg-bg-elev-2 p-1">
          {TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-bold ${
                tab === t.value ? "bg-accent text-bg" : "text-text-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-text-faint">Aucun résultat.</p>
      ) : (
        <div className="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4 md:grid-cols-5">
          {filtered.map((item) => {
            const poster = posterUrl(item.posterPath, "w154");
            const basePath = item.mediaType === "movie" ? "/films" : "/series";
            return (
              <Link key={item.tmdbId} href={`${basePath}/${item.tmdbId}`} className="block">
                <div className="relative aspect-[2/3] overflow-hidden rounded-[10px] bg-bg-elev-2 shadow-lg">
                  {poster && (
                    <Image src={poster} alt="" fill sizes="160px" className="object-cover" />
                  )}
                  {item.count > 1 && (
                    <div className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-extrabold backdrop-blur">
                      ×{item.count}
                    </div>
                  )}
                </div>
                <h3 className="mt-2 line-clamp-2 text-[13px] font-bold leading-tight">
                  {item.title}
                </h3>
                {item.year && <p className="mt-0.5 text-[11.5px] text-text-faint">{item.year}</p>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
