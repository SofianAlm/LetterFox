import Link from "next/link";
import Image from "next/image";
import { posterUrl } from "@/lib/tmdb-image";
import { formatFullDate } from "@/lib/date";
import { formatRating } from "@/lib/ratings";
import { EntryActions } from "./EntryActions";
import type { FeedEntry } from "@/lib/feed";

export function MyEntryTypeList({
  entries,
  currentUserId,
  path,
  basePath,
}: {
  entries: FeedEntry[];
  currentUserId: string;
  path: string;
  basePath: string;
}) {
  if (entries.length === 0) {
    return <p className="text-sm text-text-faint">Rien ajouté pour l&rsquo;instant.</p>;
  }

  return (
    <div className="flex flex-col">
      {entries.map((e) => {
        const poster = posterUrl(e.poster_path, "w92");
        return (
          <div
            key={e.id}
            className="flex items-center gap-3.5 border-b border-border py-3.5 last:border-none"
          >
            <Link href={`${basePath}/${e.tmdb_id}`} className="flex-shrink-0">
              <span className="block h-[70px] w-12 overflow-hidden rounded-md bg-bg-elev-2">
                {poster && (
                  <Image
                    src={poster}
                    alt=""
                    width={48}
                    height={70}
                    className="h-full w-full object-cover"
                  />
                )}
              </span>
            </Link>
            <Link href={`${basePath}/${e.tmdb_id}`} className="min-w-0 flex-1">
              <span className="block truncate text-[13.5px] font-bold">
                {e.title}
                {e.media_type === "tv" &&
                  e.season_number &&
                  ` · S${e.season_number}${e.episode_number ? `E${e.episode_number}` : " entière"}`}
              </span>
              <span className="block text-xs text-text-faint">
                {formatFullDate(e.watched_on)}
                {e.locations?.name && ` · ${e.locations.name}`}
              </span>
            </Link>
            <span className="flex-shrink-0 font-display text-sm font-extrabold text-accent">
              {e.is_rewatch ? "Rewatch" : `${formatRating(e.rating)}/10`}
            </span>
            <EntryActions entry={e} currentUserId={currentUserId} path={path} />
          </div>
        );
      })}
    </div>
  );
}
