"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Modal } from "./Modal";
import { addMovieEntry, type AddEntryState } from "@/app/actions/watch-entries";
import { posterUrl } from "@/lib/tmdb-image";
import { SearchIcon } from "./icons";

type MovieResult = {
  id: number;
  title: string;
  release_date: string | null;
  poster_path: string | null;
};

const initialState: AddEntryState = { error: null };

export function AddFilmModal({
  onClose,
  locations,
}: {
  onClose: () => void;
  locations: string[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MovieResult[]>([]);
  const [selected, setSelected] = useState<MovieResult | null>(null);
  const [isRewatch, setIsRewatch] = useState(false);
  const [rating, setRating] = useState(7);
  const [language, setLanguage] = useState<"VF" | "VO">("VF");
  const [submitted, setSubmitted] = useState(false);
  const [state, formAction, pending] = useActionState(addMovieEntry, initialState);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      fetch(`/api/tmdb/search-movie?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => setResults(data.results ?? []));
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    if (submitted && !pending && state.error === null) {
      router.refresh();
      onClose();
    }
  }, [submitted, pending, state, router, onClose]);

  return (
    <Modal title="Ajouter un film" onClose={onClose}>
      <form
        action={(formData) => {
          setSubmitted(true);
          formAction(formData);
        }}
        className="p-6"
      >
        {!selected ? (
          <div>
            <label className="mb-2 block text-[13px] font-bold text-text-muted">
              Rechercher un film
            </label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-faint" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Le titre du film…"
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
                      <span className="block text-sm font-semibold">{r.title}</span>
                      <span className="block text-xs text-text-faint">
                        {r.release_date?.slice(0, 4) ?? "—"}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <input type="hidden" name="tmdb_id" value={selected.id} />
            <input type="hidden" name="title" value={selected.title} />
            <input type="hidden" name="poster_path" value={selected.poster_path ?? ""} />
            <input
              type="hidden"
              name="release_year"
              value={selected.release_date?.slice(0, 4) ?? ""}
            />

            <div className="flex items-center gap-3 rounded-xl border border-blue-soft-strong bg-blue-soft p-2.5">
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
                <span className="block text-sm font-bold">{selected.title}</span>
                <span className="block text-xs text-text-faint">
                  {selected.release_date?.slice(0, 4) ?? "—"}
                </span>
              </span>
              <button type="button" onClick={() => setSelected(null)} className="text-xs font-bold text-blue">
                Modifier
              </button>
            </div>

            <label className="mt-5 flex items-center justify-between gap-3 rounded-[10px] border border-border-strong bg-bg-elev-2 p-3.5">
              <span>
                <span className="block text-[13.5px] font-bold">Rewatch</span>
                <span className="block text-xs text-text-faint">
                  Déjà vu — pas de nouvelle note ni commentaire
                </span>
              </span>
              <input
                type="checkbox"
                name="is_rewatch"
                checked={isRewatch}
                onChange={(e) => setIsRewatch(e.target.checked)}
                className="h-5 w-5 accent-blue"
              />
            </label>

            <input type="hidden" name="language" value={language} />
            <div className="mt-4">
              <label className="mb-2 block text-[13px] font-bold text-text-muted">Langue</label>
              <div className="flex rounded-[11px] border border-border bg-bg-elev-2 p-1">
                {(["VF", "VO"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLanguage(l)}
                    className={`flex-1 rounded-[8px] py-2 text-[13.5px] font-bold ${
                      language === l ? "bg-blue text-bg" : "text-text-muted"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-[13px] font-bold text-text-muted">
                  Date de visionnage
                </label>
                <input
                  type="date"
                  name="watched_on"
                  required
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  className="w-full rounded-[10px] border border-border-strong bg-bg-elev-2 px-3.5 py-3 text-sm focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-[13px] font-bold text-text-muted">Lieu</label>
                <input
                  name="location"
                  list="location-suggestions-film"
                  placeholder="Chez Sofian…"
                  className="w-full rounded-[10px] border border-border-strong bg-bg-elev-2 px-3.5 py-3 text-sm focus:border-accent focus:outline-none"
                />
                <datalist id="location-suggestions-film">
                  {locations.map((l) => (
                    <option key={l} value={l} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className={isRewatch ? "mt-4 pointer-events-none opacity-35" : "mt-4"}>
              <label className="mb-2 block text-[13px] font-bold text-text-muted">
                Note — {rating.toFixed(1).replace(".", ",")} / 10
              </label>
              <input
                type="range"
                name="rating"
                min={0}
                max={10}
                step={0.5}
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                disabled={isRewatch}
                className="w-full accent-blue"
              />
            </div>

            <div className={isRewatch ? "mt-4 pointer-events-none opacity-35" : "mt-4"}>
              <label className="mb-2 block text-[13px] font-bold text-text-muted">
                Commentaire (optionnel)
              </label>
              <textarea
                name="comment"
                disabled={isRewatch}
                rows={3}
                placeholder="Qu'as-tu pensé du film ?"
                className="w-full resize-none rounded-[10px] border border-border-strong bg-bg-elev-2 px-3.5 py-3 text-sm placeholder:text-text-faint focus:border-accent focus:outline-none"
              />
            </div>

            {state.error && <p className="mt-3 text-sm text-red-400">{state.error}</p>}

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-[10px] border border-border-strong px-5 py-3 text-sm font-bold"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={pending}
                className="rounded-[10px] bg-blue px-5 py-3 text-sm font-bold text-bg disabled:opacity-60"
              >
                {pending ? "Ajout…" : "Ajouter"}
              </button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}
