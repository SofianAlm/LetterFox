"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Modal } from "./Modal";
import { addSeriesEntry, type AddEntryState } from "@/app/actions/watch-entries";
import { posterUrl } from "@/lib/tmdb-image";
import { SearchIcon } from "./icons";

type TvResult = {
  id: number;
  name: string;
  first_air_date: string | null;
  poster_path: string | null;
  genre_ids?: number[];
  genres?: string[];
};
type Season = { season_number: number; name: string; episode_count: number };
type Episode = { episode_number: number; name: string };

const initialState: AddEntryState = { error: null };

export function AddSeriesModal({
  onClose,
  locations,
  initialSelected,
  initialWatchedOn,
  initialLanguage,
  initialLocation,
  initialGranularity,
  initialSeasonNumber,
  initialEpisodeNumber,
  onAdded,
}: {
  onClose: () => void;
  locations: string[];
  initialSelected?: TvResult;
  initialWatchedOn?: string;
  initialLanguage?: "VF" | "VO";
  initialLocation?: string;
  initialGranularity?: "season" | "episode";
  initialSeasonNumber?: number;
  initialEpisodeNumber?: number;
  onAdded?: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TvResult[]>([]);
  const [selected, setSelected] = useState<TvResult | null>(initialSelected ?? null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [granularity, setGranularity] = useState<"season" | "episode">(
    initialGranularity ?? "season",
  );
  const [seasonNumber, setSeasonNumber] = useState<number | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [episodeNumber, setEpisodeNumber] = useState<number | null>(null);
  const [isRewatch, setIsRewatch] = useState(false);
  const [rating, setRating] = useState(7);
  const [language, setLanguage] = useState<"VF" | "VO">(initialLanguage ?? "VO");
  const [submitted, setSubmitted] = useState(false);
  const [genreMap, setGenreMap] = useState<Record<number, string>>({});
  const [state, formAction, pending] = useActionState(addSeriesEntry, initialState);

  useEffect(() => {
    fetch("/api/tmdb/genres?type=tv")
      .then((res) => res.json())
      .then((data) => {
        const list: { id: number; name: string }[] = data.genres ?? [];
        setGenreMap(Object.fromEntries(list.map((g) => [g.id, g.name])));
      })
      .catch(() => {
        // Genre list unavailable — the series still gets added, just without tags.
      });
  }, []);

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

  const genreNames = (r: TvResult) =>
    r.genres ?? (r.genre_ids ?? []).map((id) => genreMap[id]).filter((n): n is string => !!n);

  useEffect(() => {
    if (!selected) return;
    fetch(`/api/tmdb/tv/${selected.id}`)
      .then((res) => res.json())
      .then((data) => {
        const list: Season[] = (data.seasons ?? []).filter((s: Season) => s.season_number > 0);
        setSeasons(list);
        const fallback = list.at(-1)?.season_number ?? null;
        setSeasonNumber(
          initialSeasonNumber != null && list.some((s) => s.season_number === initialSeasonNumber)
            ? initialSeasonNumber
            : fallback,
        );
      });
    // Only re-run when the selected title changes — initialSeasonNumber is a
    // one-time hint from the quick-add flow, not a value to keep syncing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  useEffect(() => {
    if (!selected || seasonNumber === null || granularity !== "episode") {
      setEpisodes([]);
      return;
    }
    fetch(`/api/tmdb/tv/${selected.id}/season/${seasonNumber}`)
      .then((res) => res.json())
      .then((data) => {
        const list: Episode[] = data.episodes ?? [];
        setEpisodes(list);
        const fallback = list[0]?.episode_number ?? null;
        setEpisodeNumber(
          initialEpisodeNumber != null &&
            list.some((e) => e.episode_number === initialEpisodeNumber)
            ? initialEpisodeNumber
            : fallback,
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, seasonNumber, granularity]);

  useEffect(() => {
    if (submitted && !pending && state.error === null) {
      onAdded?.();
      router.refresh();
      onClose();
    }
  }, [submitted, pending, state, router, onClose, onAdded]);

  const selectedEpisode = episodes.find((e) => e.episode_number === episodeNumber);

  return (
    <Modal title="Ajouter une série" onClose={onClose}>
      <form
        action={(formData) => {
          setSubmitted(true);
          formAction(formData);
        }}
        className="flex flex-col gap-[18px] p-6"
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
            <input type="hidden" name="genres" value={JSON.stringify(genreNames(selected))} />
            <input type="hidden" name="granularity" value={granularity} />
            <input type="hidden" name="season_number" value={seasonNumber ?? ""} />
            {granularity === "episode" && (
              <>
                <input type="hidden" name="episode_number" value={episodeNumber ?? ""} />
                <input type="hidden" name="episode_name" value={selectedEpisode?.name ?? ""} />
              </>
            )}

            <div className="flex items-center gap-3 rounded-xl border border-border-strong p-3">
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

            <label className="flex items-center justify-between gap-3 rounded-[10px] border border-purple-soft-strong bg-purple-soft p-3.5">
              <span>
                <span className="block text-[13.5px] font-bold text-purple">Rewatch</span>
                <span className="block text-xs text-text-muted">
                  Déjà vu — la note et le commentaire restent ceux du premier visionnage
                </span>
              </span>
              <input
                type="checkbox"
                name="is_rewatch"
                checked={isRewatch}
                onChange={(e) => setIsRewatch(e.target.checked)}
                className="h-5 w-5 accent-purple"
              />
            </label>

            <div>
              <label className="mb-2 block text-[13px] font-bold text-text-muted">
                Que veux-tu enregistrer ?
              </label>
              <div className="flex rounded-[11px] border border-border bg-bg-elev-2 p-1">
                {(["season", "episode"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGranularity(g)}
                    className={`flex-1 rounded-[8px] py-2.5 text-[13.5px] font-bold ${
                      granularity === g ? "bg-purple text-on-accent" : "text-text-muted"
                    }`}
                  >
                    {g === "season" ? "Saison entière" : "Épisode précis"}
                  </button>
                ))}
              </div>
            </div>

            <input type="hidden" name="language" value={language} />
            <div>
              <label className="mb-2 block text-[13px] font-bold text-text-muted">Langue</label>
              <div className="flex rounded-[11px] border border-border bg-bg-elev-2 p-1">
                {(["VF", "VO"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLanguage(l)}
                    className={`flex-1 rounded-[8px] py-2 text-[13.5px] font-bold ${
                      language === l ? "bg-purple text-on-accent" : "text-text-muted"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-[13px] font-bold text-text-muted">Saison</label>
                <select
                  value={seasonNumber ?? ""}
                  onChange={(e) => setSeasonNumber(Number(e.target.value))}
                  className="w-full rounded-[10px] border border-border-strong bg-bg-elev-2 px-3.5 py-3 text-sm focus:border-accent focus:outline-none"
                >
                  {seasons.map((s) => (
                    <option key={s.season_number} value={s.season_number}>
                      Saison {s.season_number}
                    </option>
                  ))}
                </select>
              </div>
              {granularity === "episode" && (
                <div>
                  <label className="mb-2 block text-[13px] font-bold text-text-muted">
                    Épisode
                  </label>
                  <select
                    value={episodeNumber ?? ""}
                    onChange={(e) => setEpisodeNumber(Number(e.target.value))}
                    className="w-full rounded-[10px] border border-border-strong bg-bg-elev-2 px-3.5 py-3 text-sm focus:border-accent focus:outline-none"
                  >
                    {episodes.map((e) => (
                      <option key={e.episode_number} value={e.episode_number}>
                        E{e.episode_number} — {e.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-[13px] font-bold text-text-muted">
                  Date de visionnage
                </label>
                <input
                  type="date"
                  name="watched_on"
                  required
                  defaultValue={initialWatchedOn ?? new Date().toISOString().slice(0, 10)}
                  className="w-full rounded-[10px] border border-border-strong bg-bg-elev-2 px-3.5 py-3 text-sm focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-[13px] font-bold text-text-muted">Lieu</label>
                <input
                  name="location"
                  defaultValue={initialLocation ?? ""}
                  list="location-suggestions-series"
                  placeholder="Chez Camille…"
                  className="w-full rounded-[10px] border border-border-strong bg-bg-elev-2 px-3.5 py-3 text-sm focus:border-accent focus:outline-none"
                />
                <datalist id="location-suggestions-series">
                  {locations.map((l) => (
                    <option key={l} value={l} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className={isRewatch ? "pointer-events-none opacity-35" : ""}>
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
                className="w-full accent-purple"
              />
            </div>

            <div className={isRewatch ? "pointer-events-none opacity-35" : ""}>
              <label className="mb-2 block text-[13px] font-bold text-text-muted">
                Commentaire (optionnel)
              </label>
              <textarea
                name="comment"
                disabled={isRewatch}
                rows={3}
                placeholder="Qu'as-tu pensé de cet épisode ?"
                className="w-full resize-none rounded-[10px] border border-border-strong bg-bg-elev-2 px-3.5 py-3 text-sm placeholder:text-text-faint focus:border-accent focus:outline-none"
              />
            </div>

            {state.error && <p className="text-sm text-red-400">{state.error}</p>}

            <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-[10px] border border-border-strong px-5 py-3 text-sm font-bold sm:w-auto"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={pending || seasonNumber === null}
                className="w-full rounded-[10px] bg-purple px-5 py-3 text-sm font-bold text-on-accent disabled:opacity-60 sm:w-auto"
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
