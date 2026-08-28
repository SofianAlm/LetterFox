"use client";

import { useState } from "react";
import { BrowseGrid } from "./BrowseGrid";
import { AddFilmModal } from "./AddFilmModal";
import { AddFilmChoiceModal } from "./AddFilmChoiceModal";
import { AddFilmChainModal } from "./AddFilmChainModal";
import { PlusIcon } from "./icons";
import type { FeedEntry } from "@/lib/feed";
import type { TitleSummary } from "@/lib/aggregate";

export function FilmsBrowser({
  entries,
  profiles,
  locations,
  currentUserId,
}: {
  entries: FeedEntry[];
  profiles: { id: string; display_name: string; avatar_color: string | null }[];
  locations: string[];
  currentUserId: string;
}) {
  const [open, setOpen] = useState(false);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [chainOpen, setChainOpen] = useState(false);
  const [quickAdd, setQuickAdd] = useState<TitleSummary | null>(null);
  const count = entries.length;

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-bold">Films</h1>
          <p className="mt-1.5 text-sm text-text-faint">
            {count} entrée{count > 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setChoiceOpen(true)}
          className="flex items-center gap-2 rounded-[10px] bg-blue px-4 py-2.5 text-[13.5px] font-bold text-on-accent"
        >
          <PlusIcon className="h-4 w-4" />
          Ajouter un film
        </button>
      </div>

      <BrowseGrid
        entries={entries}
        profiles={profiles}
        mediaType="movie"
        basePath="/films"
        currentUserId={currentUserId}
        onAdd={() => setChoiceOpen(true)}
        onQuickAdd={(summary) => {
          setQuickAdd(summary);
          setOpen(true);
        }}
      />
      {choiceOpen && (
        <AddFilmChoiceModal
          onClose={() => setChoiceOpen(false)}
          onChooseSingle={() => {
            setChoiceOpen(false);
            setQuickAdd(null);
            setOpen(true);
          }}
          onChooseChain={() => {
            setChoiceOpen(false);
            setChainOpen(true);
          }}
        />
      )}
      {chainOpen && <AddFilmChainModal onClose={() => setChainOpen(false)} locations={locations} />}
      {open &&
        (() => {
          const source = quickAdd?.entries[0];
          return (
            <AddFilmModal
              onClose={() => setOpen(false)}
              locations={locations}
              initialSelected={
                quickAdd
                  ? {
                      id: quickAdd.tmdbId,
                      title: quickAdd.title,
                      release_date: quickAdd.year ? `${quickAdd.year}-01-01` : null,
                      poster_path: quickAdd.posterPath,
                      genres: source?.genres,
                    }
                  : undefined
              }
              initialWatchedOn={source?.watched_on}
              initialLanguage={source?.language === "VO" ? "VO" : "VF"}
              initialLocation={source?.locations?.name ?? undefined}
            />
          );
        })()}
    </>
  );
}
