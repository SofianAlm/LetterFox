import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTvDetails } from "@/lib/tmdb";
import { posterUrl } from "@/lib/tmdb-image";
import { seriesAverage, formatRating } from "@/lib/ratings";
import { ChevronLeftIcon } from "@/components/icons";
import { SeriesDetailContent } from "@/components/SeriesDetailContent";
import { MediaBackground } from "@/components/MediaBackground";
import { isAdmin } from "@/lib/admin";
import type { FeedEntry } from "@/lib/feed";

export default async function SeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tmdbId = Number(id);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [{ data: entries }, admin] = await Promise.all([
    supabase
      .from("watch_entries")
      .select("*, profiles(display_name, avatar_color), locations(name), reactions(emoji, user_id)")
      .eq("media_type", "tv")
      .eq("tmdb_id", tmdbId)
      .order("watched_on", { ascending: false }),
    isAdmin(supabase, user?.id),
  ]);

  if (!entries || entries.length === 0) notFound();
  const list = entries as unknown as FeedEntry[];
  const details = await getTvDetails(tmdbId).catch(() => null);
  const avg = seriesAverage(list);
  const poster = posterUrl(list[0].poster_path, "w500");
  const seasonNumbers = [
    ...new Set(list.map((e) => e.season_number).filter((n): n is number => n != null)),
  ].sort((a, b) => a - b);

  return (
    <div className="mx-auto max-w-[1120px] px-6 pb-24 pt-8 sm:px-10">
      <MediaBackground media="tv" />
      <Link
        href="/series"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-text-muted"
      >
        <ChevronLeftIcon className="h-4 w-4" /> Séries
      </Link>

      <div className="flex flex-col gap-8 sm:flex-row">
        <div className="w-[180px] flex-shrink-0 overflow-hidden rounded-xl shadow-2xl sm:w-[220px]">
          {poster && (
            <Image
              src={poster}
              alt=""
              width={220}
              height={330}
              className="h-auto w-full object-cover"
            />
          )}
        </div>
        <div className="flex-1">
          <div className="text-[13px] font-bold uppercase tracking-wide text-purple">Série</div>
          <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {list[0].title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            {list[0].release_year && (
              <span className="rounded-full bg-bg-elev-2 px-3.5 py-1.5 text-xs font-semibold text-text-muted">
                {list[0].release_year}
              </span>
            )}
            {details?.networks[0] && (
              <span className="rounded-full bg-bg-elev-2 px-3.5 py-1.5 text-xs font-semibold text-text-muted">
                {details.networks[0].name}
              </span>
            )}
            {details?.genres.slice(0, 2).map((g) => (
              <span
                key={g.id}
                className="rounded-full bg-bg-elev-2 px-3.5 py-1.5 text-xs font-semibold text-text-muted"
              >
                {g.name}
              </span>
            ))}
            {details && (
              <span className="rounded-full bg-bg-elev-2 px-3.5 py-1.5 text-xs font-semibold text-text-muted">
                {details.in_production ? "En cours" : "Terminée"}
              </span>
            )}
          </div>
          {details?.overview && (
            <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-text-muted">
              {details.overview}
            </p>
          )}
        </div>
      </div>

      <div className="mt-10 flex items-center gap-4 rounded-2xl border border-border bg-bg-elev p-6">
        <div className="flex items-baseline gap-1">
          <span className="font-display text-4xl font-extrabold text-purple">
            {formatRating(avg)}
          </span>
          <span className="text-sm font-bold text-text-faint">/10</span>
        </div>
        <div>
          <div className="text-sm font-bold">Note globale de la série</div>
          <div className="text-xs text-text-faint">
            Moyenne des notes de saison sur {seasonNumbers.map((s) => `S${s}`).join(" · ")}
          </div>
        </div>
      </div>

      <SeriesDetailContent
        tmdbId={tmdbId}
        entries={list}
        seasonNumbers={seasonNumbers}
        currentUserId={user?.id ?? ""}
        isAdmin={admin}
      />
    </div>
  );
}
