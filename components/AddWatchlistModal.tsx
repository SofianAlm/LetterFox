"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Modal } from "./Modal";
import { addWatchlistItem, type AddWatchlistState } from "@/app/actions/watchlist";
import { posterUrl } from "@/lib/tmdb-image";
import { SearchIcon } from "./icons";

type Result = {
  id: number;
  title?: string;
  name?: string;
  release_date?: string | null;
  first_air_date?: string | null;
  poster_path: string | null;
  genre_ids?: number[];
};

type GenreMap = Record<number, string>;

const initialState: AddWatchlistState = { error: null };

export function AddWatchlistModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [mediaType, setMediaType] = useState<"movie" | "tv">("movie");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [selected, setSelected] = useState<Result | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [genreMaps, setGenreMaps] = useState<{ movie: GenreMap; tv: GenreMap }>({
    movie: {},
    tv: {},
  });
  const [state, formAction, pending] = useActionState(addWatchlistItem, initialState);

  useEffect(() => {
    Promise.all([
      fetch("/api/tmdb/genres?type=movie").then((res) => res.json()),
      fetch("/api/tmdb/genres?type=tv").then((res) => res.json()),
    ]).then(([movie, tv]) => {
      const toMap = (list: { id: number; name: string }[]) =>
        Object.fromEntries(list.map((g) => [g.id, g.name]));
      setGenreMaps({ movie: toMap(movie.genres ?? []), tv: toMap(tv.genres ?? []) });
    }).catch(() => {
      // Genre lists unavailable — the item still gets added, just without tags.
    });
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const endpoint = mediaType === "movie" ? "search-movie" : "search-tv";
    const timeout = setTimeout(() => {
      fetch(`/api/tmdb/${endpoint}?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => setResults(data.results ?? []));
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, mediaType]);

  useEffect(() => {
    if (submitted && !pending && state.error === null) {
      router.refresh();
      onClose();
    }
  }, [submitted, pending, state, router, onClose]);

  const label = (r: Result) => r.title ?? r.name ?? "";
  const year = (r: Result) => (r.release_date ?? r.first_air_date)?.slice(0, 4) ?? "—";
  const genreNames = (r: Result) =>
    (r.genre_ids ?? []).map((id) => genreMaps[mediaType][id]).filter((n): n is string => !!n);

  return (
    <Modal title="Ajouter à voir" onClose={onClose}>
      <form
        action={(formData) => {
          setSubmitted(true);
          formAction(formData);
        }}
        className="p-6"
      >
        {!selected ? (
          <div>
            <div className="mb-4 flex rounded-[11px] border border-border bg-bg-elev-2 p-1">
              {(
                [
                  ["movie", "Film"],
                  ["tv", "Série"],
                ] as const
              ).map(([value, text]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setMediaType(value);
                    setResults([]);
                  }}
                  className={`flex-1 rounded-[8px] py-2 text-[13.5px] font-bold ${
                    mediaType === value
                      ? `${value === "movie" ? "bg-blue" : "bg-purple"} text-on-accent`
                      : "text-text-muted"
                  }`}
                >
                  {text}
                </button>
              ))}
            </div>

            <label className="mb-2 block text-[13px] font-bold text-text-muted">
              Rechercher {mediaType === "movie" ? "un film" : "une série"}
            </label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-faint" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Le titre…"
                className="w-full rounded-[10px] border border-border-strong bg-bg-elev-2 py-3 pl-[42px] pr-3.5 text-sm focus:border-accent focus:outline-none"
              />
            </div>
            {results.length > 0 && (
              <div className="mt-2.5 overflow-hidden rounded-xl border border-border-strong">
                {results.map((r) => (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className="flex w-full items-center gap-3 border-b border-border p-2.5 text-left last:border-none hover:bg-bg-elev-2"
                  >
                    <span className="h-16 w-11 flex-shrink-0 overflow-hidden rounded-md bg-bg-elev-2">
                      {r.poster_path && (
                        <Image
                          src={posterUrl(r.poster_path, "w92")!}
                          alt=""
                          width={44}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{label(r)}</span>
                      <span className="block text-xs text-text-faint">{year(r)}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <input type="hidden" name="media_type" value={mediaType} />
            <input type="hidden" name="tmdb_id" value={selected.id} />
            <input type="hidden" name="title" value={label(selected)} />
            <input type="hidden" name="poster_path" value={selected.poster_path ?? ""} />
            <input type="hidden" name="release_year" value={year(selected)} />
            <input type="hidden" name="genres" value={JSON.stringify(genreNames(selected))} />

            <div
              className={`flex items-center gap-3 rounded-xl border p-2.5 ${
                mediaType === "movie"
                  ? "border-blue-soft-strong bg-blue-soft"
                  : "border-purple-soft-strong bg-purple-soft"
              }`}
            >
              <span className="h-16 w-11 flex-shrink-0 overflow-hidden rounded-md bg-bg-elev-2">
                {selected.poster_path && (
                  <Image
                    src={posterUrl(selected.poster_path, "w92")!}
                    alt=""
                    width={44}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                )}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-bold">{label(selected)}</span>
                <span className="block text-xs text-text-faint">{year(selected)}</span>
              </span>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className={`text-xs font-bold ${mediaType === "movie" ? "text-blue" : "text-purple"}`}
              >
                Modifier
              </button>
            </div>

            {genreNames(selected).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {genreNames(selected).map((g) => (
                  <span
                    key={g}
                    className="rounded-full bg-bg-elev-2 px-2.5 py-1 text-[11px] font-semibold text-text-muted"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            {state.error && <p className="mt-3 text-sm text-red-400">{state.error}</p>}

            <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-[10px] border border-border-strong px-5 py-3 text-sm font-bold sm:w-auto"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-[10px] bg-accent px-5 py-3 text-sm font-bold text-on-accent disabled:opacity-60 sm:w-auto"
              >
                {pending ? "Ajout…" : "Ajouter à la liste"}
              </button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}
