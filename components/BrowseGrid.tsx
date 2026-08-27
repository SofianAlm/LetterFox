"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { posterUrl } from "@/lib/tmdb-image";
import { initials, avatarColor } from "@/lib/avatar-color";
import { summarizeByTitle, titleAverage, latestSeason } from "@/lib/aggregate";
import { formatRating } from "@/lib/ratings";
import type { FeedEntry } from "@/lib/feed";
import { PlusIcon } from "./icons";

type Profile = { id: string; display_name: string; avatar_color: string | null };

export function BrowseGrid({
  entries,
  profiles,
  mediaType,
  basePath,
  onAdd,
}: {
  entries: FeedEntry[];
  profiles: Profile[];
  mediaType: "movie" | "tv";
  basePath: string;
  onAdd: () => void;
}) {
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const accentClass = mediaType === "movie" ? "text-blue" : "text-purple";

  const filtered = useMemo(
    () => entries.filter((e) => e.user_id && !excluded.has(e.user_id)),
    [entries, excluded],
  );
  const summaries = useMemo(() => summarizeByTitle(filtered), [filtered]);

  function toggle(id: string) {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="relative">
      <div className="mb-8 flex flex-wrap items-center gap-2.5 border-b border-border pb-6">
        <span className="text-[12.5px] font-bold text-text-faint">Filtrer par personne</span>
        <button
          type="button"
          onClick={() => setExcluded(new Set())}
          className={`rounded-full px-4 py-2 text-[13px] font-semibold ${
            excluded.size === 0
              ? `bg-accent-soft ${mediaType === "movie" ? "text-blue" : "text-purple"}`
              : "bg-bg-elev-2 text-text-muted"
          }`}
        >
          Tout le monde
        </button>
        {profiles.map((p) => {
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

      {summaries.length === 0 ? (
        <p className="text-text-faint">Rien à afficher pour l&rsquo;instant.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-[22px] gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {summaries.map((summary) => {
            const poster = posterUrl(summary.posterPath, "w342");
            const avg = titleAverage(summary);
            const meta =
              mediaType === "movie"
                ? `${summary.year ?? ""} · vu ${summary.entries.length} fois`
                : `S${latestSeason(summary)} · ${summary.entries.length} entrée${
                    summary.entries.length > 1 ? "s" : ""
                  }`;
            return (
              <Link key={summary.tmdbId} href={`${basePath}/${summary.tmdbId}`} className="block">
                <div className="relative aspect-[2/3] overflow-hidden rounded-[10px] bg-bg-elev-2 shadow-lg">
                  {poster && (
                    <Image src={poster} alt="" fill sizes="200px" className="object-cover" />
                  )}
                  <div
                    className={`absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 font-display text-[12.5px] font-extrabold backdrop-blur ${accentClass}`}
                  >
                    {formatRating(avg)}
                  </div>
                </div>
                <h3 className="mt-2.5 line-clamp-2 text-sm font-bold leading-tight">
                  {summary.title}
                </h3>
                <p className="mt-1 text-[12.5px] text-text-faint">{meta}</p>
              </Link>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={onAdd}
        className={`fixed bottom-10 right-6 z-10 flex h-[58px] w-[58px] items-center justify-center rounded-full text-bg shadow-xl sm:right-10 ${
          mediaType === "movie" ? "bg-blue" : "bg-purple"
        }`}
        aria-label={mediaType === "movie" ? "Ajouter un film" : "Ajouter une série"}
      >
        <PlusIcon className="h-6 w-6" />
      </button>
    </div>
  );
}
