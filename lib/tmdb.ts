// Server-only: reads TMDB_READ_ACCESS_TOKEN. Never import this from a
// Client Component — go through the /api/tmdb/* route handlers instead.
import "server-only";
export { posterUrl } from "@/lib/tmdb-image";

const TMDB_BASE = "https://api.themoviedb.org/3";

function tmdbHeaders() {
  return {
    Authorization: `Bearer ${process.env.TMDB_READ_ACCESS_TOKEN}`,
    accept: "application/json",
  };
}

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("language", "fr-FR");
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  const res = await fetch(url, { headers: tmdbHeaders(), next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TMDB ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export type TmdbMovieResult = {
  id: number;
  title: string;
  release_date: string | null;
  poster_path: string | null;
  genre_ids: number[];
};

export type TmdbTvResult = {
  id: number;
  name: string;
  first_air_date: string | null;
  poster_path: string | null;
  genre_ids: number[];
};

export async function searchMovies(query: string) {
  const data = await tmdbFetch<{ results: TmdbMovieResult[] }>("/search/movie", { query });
  return data.results;
}

export async function searchTv(query: string) {
  const data = await tmdbFetch<{ results: TmdbTvResult[] }>("/search/tv", { query });
  return data.results;
}

export type TmdbGenre = { id: number; name: string };

export async function getMovieGenres() {
  const data = await tmdbFetch<{ genres: TmdbGenre[] }>("/genre/movie/list");
  return data.genres;
}

export async function getTvGenres() {
  const data = await tmdbFetch<{ genres: TmdbGenre[] }>("/genre/tv/list");
  return data.genres;
}

export type TmdbTvDetails = {
  id: number;
  name: string;
  poster_path: string | null;
  overview: string;
  genres: { id: number; name: string }[];
  networks: { id: number; name: string }[];
  in_production: boolean;
  seasons: { season_number: number; name: string; episode_count: number }[];
};

export async function getTvDetails(tvId: number) {
  return tmdbFetch<TmdbTvDetails>(`/tv/${tvId}`);
}

export type TmdbMovieDetails = {
  id: number;
  title: string;
  poster_path: string | null;
  overview: string;
  runtime: number | null;
  release_date: string | null;
  genres: { id: number; name: string }[];
};

export async function getMovieDetails(movieId: number) {
  return tmdbFetch<TmdbMovieDetails>(`/movie/${movieId}`);
}

export type TmdbEpisode = {
  episode_number: number;
  name: string;
};

export async function getSeasonEpisodes(tvId: number, seasonNumber: number) {
  const data = await tmdbFetch<{ episodes: TmdbEpisode[] }>(
    `/tv/${tvId}/season/${seasonNumber}`,
  );
  return data.episodes;
}

