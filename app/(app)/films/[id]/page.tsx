import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMovieDetails } from "@/lib/tmdb";
import { posterUrl } from "@/lib/tmdb-image";
import { movieAverage, formatRating } from "@/lib/ratings";
import { initials, avatarColor } from "@/lib/avatar-color";
import { formatFullDate } from "@/lib/date";
import { ReactionBar } from "@/components/ReactionBar";
import { EntryActions } from "@/components/EntryActions";
import { ChevronLeftIcon } from "@/components/icons";
import type { FeedEntry } from "@/lib/feed";

export default async function FilmDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tmdbId = Number(id);

  const supabase = await createClient();
  const [
    {
      data: { user },
    },
    { data: entries },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("watch_entries")
      .select("*, profiles(display_name, avatar_color), locations(name), reactions(emoji, user_id)")
      .eq("media_type", "movie")
      .eq("tmdb_id", tmdbId)
      .order("watched_on", { ascending: false }),
  ]);

  if (!entries || entries.length === 0) notFound();
  const list = entries as unknown as FeedEntry[];
  const details = await getMovieDetails(tmdbId).catch(() => null);
  const avg = movieAverage(list);
  const poster = posterUrl(list[0].poster_path, "w500");

  return (
    <div className="mx-auto max-w-[1120px] px-6 pb-24 pt-8 sm:px-10">
      <Link
        href="/films"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-text-muted"
      >
        <ChevronLeftIcon className="h-4 w-4" /> Films
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
          <div className="text-[13px] font-bold uppercase tracking-wide text-blue">Film</div>
          <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {list[0].title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            {list[0].release_year && (
              <span className="rounded-full bg-bg-elev-2 px-3.5 py-1.5 text-xs font-semibold text-text-muted">
                {list[0].release_year}
              </span>
            )}
            {details?.runtime && (
              <span className="rounded-full bg-bg-elev-2 px-3.5 py-1.5 text-xs font-semibold text-text-muted">
                {Math.floor(details.runtime / 60)}h{String(details.runtime % 60).padStart(2, "0")}
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
          <span className="font-display text-4xl font-extrabold text-blue">
            {formatRating(avg)}
          </span>
          <span className="text-sm font-bold text-text-faint">/10</span>
        </div>
        <div>
          <div className="text-sm font-bold">Note moyenne de la bande</div>
          <div className="text-xs text-text-faint">
            d&rsquo;après {list.filter((e) => e.rating !== null).length} avis
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="mb-5 text-xl font-bold">Avis de la bande</h2>
        <div className="flex flex-col">
          {list.map((entry) => (
            <div key={entry.id} className="flex gap-4 border-b border-border py-5 last:border-none">
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-display text-sm font-extrabold text-[oklch(20%_0.03_0)]"
                style={{
                  background:
                    entry.profiles?.avatar_color ?? avatarColor(entry.profiles?.display_name ?? "?"),
                }}
              >
                {initials(entry.profiles?.display_name ?? "?")}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm">
                    <span className="font-bold">{entry.profiles?.display_name}</span>
                    <span className="ml-2 text-text-faint">
                      {formatFullDate(entry.watched_on)}
                      {entry.locations?.name && ` · ${entry.locations.name}`}
                      {` · ${entry.language}`}
                    </span>
                  </div>
                  {!entry.is_rewatch && (
                    <div className="inline-flex items-baseline gap-1 rounded-full bg-blue-soft px-3 py-1 font-display text-sm font-extrabold text-blue">
                      {formatRating(entry.rating)}
                      <span className="text-[10px] opacity-70">/10</span>
                    </div>
                  )}
                </div>
                {entry.is_rewatch ? (
                  <p className="mt-2 text-[13px] text-text-faint">Rewatch — pas de nouvel avis.</p>
                ) : (
                  entry.comment && (
                    <p className="mt-2 text-[14.5px] italic leading-relaxed text-text-muted">
                      « {entry.comment} »
                    </p>
                  )
                )}
                <div className="mt-3 flex items-center gap-2">
                  <ReactionBar
                    entryId={entry.id}
                    reactions={entry.reactions}
                    currentUserId={user?.id ?? ""}
                  />
                  {user && (
                    <EntryActions
                      entry={entry}
                      currentUserId={user.id}
                      path={`/films/${tmdbId}`}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
