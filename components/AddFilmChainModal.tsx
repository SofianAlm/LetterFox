"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Modal } from "./Modal";
import { addMovieEntries, type AddEntryState } from "@/app/actions/watch-entries";
import { posterUrl } from "@/lib/tmdb-image";
import { SearchIcon, CloseIcon } from "./icons";

type MovieResult = {
  id: number;
  title: string;
  release_date: string | null;
  poster_path: string | null;
  genre_ids?: number[];
};

type CollectionResult = {
  id: number;
  name: string;
  poster_path: string | null;
};

type ChainItem = {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  releaseYear: number | null;
  genres: string[];
  language: "VF" | "VO";
  watchedOn: string;
  location: string;
  rating: number;
  comment: string;
  isRewatch: boolean;
};

const initialState: AddEntryState = { error: null };

function ChainItemCard({
  item,
  onChange,
  onRemove,
}: {
  item: ChainItem;
  onChange: (patch: Partial<ChainItem>) => void;
  onRemove: () => void;
}) {
  const poster = posterUrl(item.posterPath, "w92");
  return (
    <div className="rounded-xl border border-border-strong bg-bg-elev-2 p-3.5">
      <div className="flex items-start gap-3">
        <span className="h-16 w-11 flex-shrink-0 overflow-hidden rounded-md bg-bg-elev-3">
          {poster && (
            <Image src={poster} alt="" width={44} height={64} className="h-full w-full object-cover" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-bold">{item.title}</p>
              <p className="text-xs text-text-faint">{item.releaseYear ?? "—"}</p>
            </div>
            <button
              type="button"
              onClick={onRemove}
              aria-label="Retirer"
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-text-faint hover:bg-bg-elev-3 hover:text-red-400"
            >
              <CloseIcon className="h-3.5 w-3.5" />
            </button>
          </div>

          <label className="mt-3 flex items-center justify-between gap-3 text-xs">
            <span className="font-bold text-text-muted">Rewatch</span>
            <input
              type="checkbox"
              checked={item.isRewatch}
              onChange={(e) => onChange({ isRewatch: e.target.checked })}
              className="h-4 w-4 accent-blue"
            />
          </label>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="sm:col-span-1">
              <label className="mb-1 block text-[11px] font-bold text-text-faint">Langue</label>
              <div className="flex rounded-[8px] border border-border bg-bg-elev-3 p-0.5">
                {(["VF", "VO"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => onChange({ language: l })}
                    className={`flex-1 rounded-[6px] py-1.5 text-[11.5px] font-bold ${
                      item.language === l ? "bg-blue text-on-accent" : "text-text-muted"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-1">
              <label className="mb-1 block text-[11px] font-bold text-text-faint">Date</label>
              <input
                type="date"
                value={item.watchedOn}
                onChange={(e) => onChange({ watchedOn: e.target.value })}
                className="w-full rounded-[8px] border border-border-strong bg-bg-elev-3 px-2 py-1.5 text-[12.5px] focus:border-accent focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-[11px] font-bold text-text-faint">Lieu</label>
              <input
                value={item.location}
                onChange={(e) => onChange({ location: e.target.value })}
                list="chain-location-suggestions"
                placeholder="Chez Sofian…"
                className="w-full rounded-[8px] border border-border-strong bg-bg-elev-3 px-2 py-1.5 text-[12.5px] focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div className={item.isRewatch ? "mt-3 pointer-events-none opacity-35" : "mt-3"}>
            <label className="mb-1 block text-[11px] font-bold text-text-faint">
              Note — {item.rating.toFixed(1).replace(".", ",")} / 10
            </label>
            <input
              type="range"
              min={0}
              max={10}
              step={0.5}
              value={item.rating}
              onChange={(e) => onChange({ rating: Number(e.target.value) })}
              disabled={item.isRewatch}
              className="w-full accent-blue"
            />
          </div>

          <div className={item.isRewatch ? "mt-3 pointer-events-none opacity-35" : "mt-3"}>
            <textarea
              value={item.comment}
              onChange={(e) => onChange({ comment: e.target.value })}
              disabled={item.isRewatch}
              rows={2}
              placeholder="Commentaire (optionnel)"
              className="w-full resize-none rounded-[8px] border border-border-strong bg-bg-elev-3 px-2.5 py-2 text-[12.5px] placeholder:text-text-faint focus:border-accent focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AddFilmChainModal({
  onClose,
  locations,
}: {
  onClose: () => void;
  locations: string[];
}) {
  const router = useRouter();
  const [saga, setSaga] = useState(false);
  const [query, setQuery] = useState("");
  const [movieResults, setMovieResults] = useState<MovieResult[]>([]);
  const [collectionResults, setCollectionResults] = useState<CollectionResult[]>([]);
  const [loadingCollection, setLoadingCollection] = useState(false);
  const [items, setItems] = useState<ChainItem[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [genreMap, setGenreMap] = useState<Record<number, string>>({});
  const [state, formAction, pending] = useActionState(addMovieEntries, initialState);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    fetch("/api/tmdb/genres?type=movie")
      .then((res) => res.json())
      .then((data) => {
        const list: { id: number; name: string }[] = data.genres ?? [];
        setGenreMap(Object.fromEntries(list.map((g) => [g.id, g.name])));
      })
      .catch(() => {
        // Genre list unavailable — films still get added, just without tags.
      });
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setMovieResults([]);
      setCollectionResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      const endpoint = saga ? "/api/tmdb/search-collection" : "/api/tmdb/search-movie";
      fetch(`${endpoint}?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          if (saga) setCollectionResults(data.results ?? []);
          else setMovieResults(data.results ?? []);
        });
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, saga]);

  useEffect(() => {
    if (submitted && !pending && state.error === null) {
      router.refresh();
      onClose();
    }
  }, [submitted, pending, state, router, onClose]);

  function addItem(movie: MovieResult) {
    setItems((prev) => {
      if (prev.some((i) => i.tmdbId === movie.id)) return prev;
      return [
        ...prev,
        {
          tmdbId: movie.id,
          title: movie.title,
          posterPath: movie.poster_path,
          releaseYear: movie.release_date ? Number(movie.release_date.slice(0, 4)) : null,
          genres: (movie.genre_ids ?? [])
            .map((id) => genreMap[id])
            .filter((n): n is string => !!n),
          language: "VO",
          watchedOn: today,
          location: "",
          rating: 7,
          comment: "",
          isRewatch: false,
        },
      ];
    });
  }

  async function chooseCollection(collection: CollectionResult) {
    setLoadingCollection(true);
    try {
      const res = await fetch(`/api/tmdb/collection/${collection.id}`);
      const data = await res.json();
      const parts: MovieResult[] = (data.parts ?? [])
        .slice()
        .sort((a: MovieResult, b: MovieResult) =>
          (a.release_date ?? "9999").localeCompare(b.release_date ?? "9999"),
        );
      for (const part of parts) addItem(part);
      setQuery("");
      setCollectionResults([]);
    } finally {
      setLoadingCollection(false);
    }
  }

  function removeItem(tmdbId: number) {
    setItems((prev) => prev.filter((i) => i.tmdbId !== tmdbId));
  }

  function updateItem(tmdbId: number, patch: Partial<ChainItem>) {
    setItems((prev) => prev.map((i) => (i.tmdbId === tmdbId ? { ...i, ...patch } : i)));
  }

  const payload = useMemo(
    () =>
      JSON.stringify(
        items.map((i) => ({
          tmdb_id: i.tmdbId,
          title: i.title,
          poster_path: i.posterPath,
          release_year: i.releaseYear,
          genres: i.genres,
          watched_on: i.watchedOn,
          location: i.location,
          language: i.language,
          rating: i.rating,
          comment: i.comment,
          is_rewatch: i.isRewatch,
        })),
      ),
    [items],
  );

  return (
    <Modal title="Ajouter une chaîne de films" onClose={onClose} width={640}>
      <datalist id="chain-location-suggestions">
        {locations.map((l) => (
          <option key={l} value={l} />
        ))}
      </datalist>

      <form
        action={(formData) => {
          setSubmitted(true);
          formAction(formData);
        }}
        className="flex max-h-[75vh] flex-col"
      >
        <input type="hidden" name="items" value={payload} />

        <div className="border-b border-border p-6">
          <label className="flex items-center justify-between gap-3 rounded-[10px] border border-border-strong bg-bg-elev-2 p-3.5">
            <span>
              <span className="block text-[13.5px] font-bold">Saga</span>
              <span className="block text-xs text-text-faint">
                Recherche une franchise entière (ex. Harry Potter) au lieu de films séparés
              </span>
            </span>
            <input
              type="checkbox"
              checked={saga}
              onChange={(e) => {
                setSaga(e.target.checked);
                setQuery("");
                setMovieResults([]);
                setCollectionResults([]);
              }}
              className="h-5 w-5 accent-blue"
            />
          </label>

          <div className="relative mt-4">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={saga ? "Le nom de la saga…" : "Le titre du film…"}
              className="w-full rounded-[10px] border border-border-strong bg-bg-elev-2 py-3 pl-[42px] pr-3.5 text-sm focus:border-accent focus:outline-none"
            />
          </div>

          {!saga && movieResults.length > 0 && (
            <div className="mt-2.5 overflow-hidden rounded-xl border border-border-strong">
              {movieResults.map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => addItem(r)}
                  disabled={items.some((i) => i.tmdbId === r.id)}
                  className="flex w-full items-center gap-3 border-b border-border p-2.5 text-left last:border-none hover:bg-bg-elev-2 disabled:opacity-40"
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
                    <span className="block text-sm font-semibold">{r.title}</span>
                    <span className="block text-xs text-text-faint">
                      {r.release_date?.slice(0, 4) ?? "—"}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {saga && collectionResults.length > 0 && (
            <div className="mt-2.5 overflow-hidden rounded-xl border border-border-strong">
              {collectionResults.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => chooseCollection(c)}
                  disabled={loadingCollection}
                  className="flex w-full items-center gap-3 border-b border-border p-2.5 text-left last:border-none hover:bg-bg-elev-2 disabled:opacity-40"
                >
                  <span className="h-16 w-11 flex-shrink-0 overflow-hidden rounded-md bg-bg-elev-2">
                    {c.poster_path && (
                      <Image
                        src={posterUrl(c.poster_path, "w92")!}
                        alt=""
                        width={44}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </span>
                  <span className="text-sm font-semibold">{c.name}</span>
                </button>
              ))}
            </div>
          )}
          {saga && loadingCollection && (
            <p className="mt-2.5 text-xs text-text-faint">Chargement des films de la saga…</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <p className="text-sm text-text-faint">Aucun film sélectionné pour l&rsquo;instant.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <ChainItemCard
                  key={item.tmdbId}
                  item={item}
                  onChange={(patch) => updateItem(item.tmdbId, patch)}
                  onRemove={() => removeItem(item.tmdbId)}
                />
              ))}
            </div>
          )}
        </div>

        {state.error && <p className="px-6 pb-3 text-sm text-red-400">{state.error}</p>}

        <div className="flex flex-col-reverse gap-2.5 border-t border-border p-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-[10px] border border-border-strong px-5 py-3 text-sm font-bold sm:w-auto"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={pending || items.length === 0}
            className="w-full rounded-[10px] bg-blue px-5 py-3 text-sm font-bold text-on-accent disabled:opacity-60 sm:w-auto"
          >
            {pending ? "Ajout…" : `Ajouter ${items.length || ""} film${items.length > 1 ? "s" : ""}`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
