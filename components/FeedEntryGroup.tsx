"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { FeedEntry } from "@/lib/feed";
import { formatDayMonth } from "@/lib/date";
import { posterUrl } from "@/lib/tmdb-image";
import { initials, avatarColor } from "@/lib/avatar-color";
import { formatRating } from "@/lib/ratings";
import { ReactionBar } from "./ReactionBar";
import { EntryActions } from "./EntryActions";
import { AddFilmModal } from "./AddFilmModal";
import { AddSeriesModal } from "./AddSeriesModal";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "./icons";

function typeLabel(entry: FeedEntry): string {
  if (entry.media_type === "movie") return "Film";
  if (entry.granularity === "season") return `Série · Saison ${entry.season_number} entière`;
  return `Série · Saison ${entry.season_number} · Épisode ${entry.episode_number}`;
}

export function FeedEntryGroup({
  entries,
  currentUserId,
  isAdmin = false,
  locations,
}: {
  entries: FeedEntry[];
  currentUserId: string;
  isAdmin?: boolean;
  locations: string[];
}) {
  const [index, setIndex] = useState(0);
  const [adding, setAdding] = useState(false);
  const head = entries[0];
  const active = entries[index];
  const { day, month } = formatDayMonth(head.watched_on);
  const isFilm = head.media_type === "movie";
  const poster = posterUrl(head.poster_path, "w154");
  const detailHref = `${isFilm ? "/films" : "/series"}/${head.tmdb_id}`;

  const review = (
    <>
      <div className="flex items-center justify-between gap-4">
        <div
          className={`inline-flex items-baseline gap-1 rounded-full px-3.5 py-1.5 font-display text-[15px] font-extrabold ${
            isFilm ? "bg-blue-soft text-blue" : "bg-purple-soft text-purple"
          }`}
        >
          {active.is_rewatch ? "—" : formatRating(active.rating)}
          <span className="text-[11px] font-bold opacity-70">/10</span>
        </div>
        {entries.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIndex((i) => (i - 1 + entries.length) % entries.length)}
              className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-border bg-bg-elev-2 text-text-muted"
              aria-label="Avis précédent"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => (i + 1) % entries.length)}
              className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-border bg-bg-elev-2 text-text-muted"
              aria-label="Avis suivant"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {active.is_rewatch ? (
        <p className="mt-3.5 text-[13px] text-text-faint">Rewatch — pas de nouvel avis.</p>
      ) : (
        active.comment && (
          <p className="mt-3.5 text-[14.5px] italic leading-relaxed text-text-muted">
            « {active.comment} »
          </p>
        )
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div
          className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full font-display text-[11px] font-extrabold text-[oklch(20%_0.03_0)]"
          style={{
            background: active.profiles?.avatar_color ?? avatarColor(active.profiles?.display_name ?? "?"),
          }}
        >
          {initials(active.profiles?.display_name ?? "?")}
        </div>
        <span className="text-[13px] text-text-muted">{active.profiles?.display_name}</span>
        {active.locations?.name && (
          <span className="text-[13px] text-text-faint">· {active.locations.name}</span>
        )}
        <div className="flex-1" />
        <EntryActions entry={active} currentUserId={currentUserId} isAdmin={isAdmin} path="/" />
        <ReactionBar
          entryId={active.id}
          reactions={active.reactions}
          currentUserId={currentUserId}
          size="lg"
        />
      </div>

      {entries.length > 1 && (
        <div className="mt-4 flex justify-center gap-1.5">
          {entries.map((_, i) => (
            <span
              key={i}
              className={`block h-1.5 rounded-full transition-all ${
                i === index
                  ? `w-[18px] ${isFilm ? "bg-blue" : "bg-purple"}`
                  : "w-1.5 bg-border-strong"
              }`}
            />
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="flex gap-4 border-b border-border py-[30px] last:border-none sm:gap-7">
      <div className="w-11 flex-shrink-0 pt-1 text-right sm:w-16">
        <div className="font-display text-[20px] font-extrabold leading-none sm:text-[26px]">
          {day}
        </div>
        <div className="mt-[3px] text-[9.5px] font-bold uppercase tracking-wide text-text-faint sm:text-[11px]">
          {month}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex gap-3 sm:gap-5">
          <Link href={detailHref} className="flex-shrink-0">
            {poster ? (
              <Image
                src={poster}
                alt=""
                width={104}
                height={156}
                className="h-[114px] w-[76px] rounded-[10px] object-cover shadow-lg sm:h-[156px] sm:w-[104px]"
              />
            ) : (
              <div className="h-[114px] w-[76px] rounded-[10px] bg-bg-elev-2 sm:h-[156px] sm:w-[104px]" />
            )}
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div
                className={`text-[11px] font-extrabold uppercase tracking-wide ${
                  isFilm ? "text-blue" : "text-purple"
                }`}
              >
                {typeLabel(head)}
              </div>
              {currentUserId && (
                <button
                  type="button"
                  onClick={() => setAdding(true)}
                  className="flex flex-shrink-0 items-center gap-1 rounded-full bg-bg-elev-2 px-2.5 py-1 text-[11px] font-bold text-text-muted hover:text-text"
                >
                  <PlusIcon className="h-3 w-3" />
                  Ajouter
                </button>
              )}
            </div>
            <Link href={detailHref} className="block">
              <h3 className="mt-1 font-display text-[19px] font-bold hover:underline">
                {head.title}
              </h3>
            </Link>
            {head.genres.length > 0 && (
              <p className="mt-0.5 text-[12px] text-text-faint">{head.genres.join(" · ")}</p>
            )}

            {entries.length > 1 ? (
              <div className="mt-4 rounded-xl border border-border bg-bg-elev p-5">{review}</div>
            ) : (
              <div className="mt-3.5">{review}</div>
            )}
          </div>
        </div>
      </div>

      {adding && isFilm && (
        <AddFilmModal
          onClose={() => setAdding(false)}
          locations={locations}
          initialSelected={{
            id: active.tmdb_id,
            title: active.title,
            release_date: active.release_year ? `${active.release_year}-01-01` : null,
            poster_path: active.poster_path,
            genres: active.genres,
          }}
          initialWatchedOn={active.watched_on}
          initialLanguage={active.language === "VO" ? "VO" : "VF"}
          initialLocation={active.locations?.name ?? undefined}
        />
      )}
      {adding && !isFilm && (
        <AddSeriesModal
          onClose={() => setAdding(false)}
          locations={locations}
          initialSelected={{
            id: active.tmdb_id,
            name: active.title,
            first_air_date: active.release_year ? `${active.release_year}-01-01` : null,
            poster_path: active.poster_path,
            genres: active.genres,
          }}
          initialWatchedOn={active.watched_on}
          initialLanguage={active.language === "VO" ? "VO" : "VF"}
          initialLocation={active.locations?.name ?? undefined}
          initialGranularity={active.granularity === "episode" ? "episode" : "season"}
          initialSeasonNumber={active.season_number ?? undefined}
          initialEpisodeNumber={active.episode_number ?? undefined}
        />
      )}
    </div>
  );
}
