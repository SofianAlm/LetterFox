"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Modal } from "./Modal";
import { addWatchingSeries, type AddWatchingState } from "@/app/actions/series-progress";
import { posterUrl } from "@/lib/tmdb-image";
import { SearchIcon } from "./icons";

type TvResult = {
  id: number;
  name: string;
  first_air_date: string | null;
  poster_path: string | null;
};

const initialState: AddWatchingState = { error: null };

export function AddWatchingSeriesModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TvResult[]>([]);
  const [selected, setSelected] = useState<TvResult | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [state, formAction, pending] = useActionState(addWatchingSeries, initialState);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      fetch(`/api/tmdb/search-tv?q=${encodeURIComponent(query)}`)
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
    <Modal title="Ajouter une série en cours" onClose={onClose} width={480}>
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
              Rechercher une série
            </label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-faint" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Le titre de la série…"
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
                      <span className="block text-sm font-semibold">{r.name}</span>
                      <span className="block text-xs text-text-faint">
                        {r.first_air_date?.slice(0, 4) ?? "—"}
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
            <input type="hidden" name="title" value={selected.name} />
            <input type="hidden" name="poster_path" value={selected.poster_path ?? ""} />
            <input
              type="hidden"
              name="release_year"
              value={selected.first_air_date?.slice(0, 4) ?? ""}
            />

            <div className="flex items-center gap-3 rounded-xl border border-purple-soft-strong bg-purple-soft p-2.5">
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
                <span className="block text-sm font-bold">{selected.name}</span>
                <span className="block text-xs text-text-faint">
                  {selected.first_air_date?.slice(0, 4) ?? "—"}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-xs font-bold text-purple"
              >
                Modifier
              </button>
            </div>

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
                className="w-full rounded-[10px] bg-purple px-5 py-3 text-sm font-bold text-on-accent disabled:opacity-60 sm:w-auto"
              >
                {pending ? "Ajout…" : "Ajouter en cours"}
              </button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}
