"use client";

import { useState } from "react";
import { initials, avatarColor } from "@/lib/avatar-color";
import { formatRating } from "@/lib/ratings";
import { formatFullDate } from "@/lib/date";
import { ChevronDownIcon } from "./icons";
import { ReactionBar } from "./ReactionBar";
import { EntryActions } from "./EntryActions";
import type { FeedEntry } from "@/lib/feed";

export function EpisodeRow({
  episodeNumber,
  episodeName,
  entries,
  currentUserId,
  isAdmin = false,
  path,
}: {
  episodeNumber: number;
  episodeName: string;
  entries: FeedEntry[];
  currentUserId: string;
  isAdmin?: boolean;
  path: string;
}) {
  const [open, setOpen] = useState(false);
  const rated = entries.filter((e) => e.rating !== null);
  const avg = rated.length ? rated.reduce((s, e) => s + e.rating!, 0) / rated.length : null;

  if (entries.length === 0) {
    return (
      <div className="flex items-center gap-3 border-b border-border py-3 opacity-50 last:border-none">
        <span className="w-8 flex-shrink-0 text-[13px] text-text-faint">E{episodeNumber}</span>
        <span className="flex-1 text-[13.5px] font-semibold">{episodeName}</span>
        <span className="text-xs text-text-faint">Pas encore vu par la bande</span>
      </div>
    );
  }

  return (
    <div className="border-b border-border last:border-none">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 py-3 text-left"
      >
        <span className="w-8 flex-shrink-0 text-[13px] text-text-faint">E{episodeNumber}</span>
        <span className="flex-1 truncate text-[13.5px] font-semibold">{episodeName}</span>
        <div className="flex -space-x-2">
          {entries.slice(0, 4).map((e) => (
            <span
              key={e.id}
              className="flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-bg-elev font-display text-[8.5px] font-extrabold text-[oklch(20%_0.03_0)]"
              style={{ background: e.profiles?.avatar_color ?? avatarColor(e.profiles?.display_name ?? "?") }}
            >
              {initials(e.profiles?.display_name ?? "?")}
            </span>
          ))}
        </div>
        <span className="inline-flex flex-shrink-0 items-baseline gap-1 rounded-full bg-purple-soft px-2.5 py-1 font-display text-[12.5px] font-extrabold text-purple">
          {formatRating(avg)}
          <span className="text-[10px] opacity-70">/10</span>
        </span>
        <ChevronDownIcon
          className={`h-4 w-4 flex-shrink-0 text-text-faint transition-transform ${
            open ? "rotate-180 text-purple" : ""
          }`}
        />
      </button>
      {open && (
        <div className="flex flex-col gap-4 pb-4 pl-11">
          {entries.map((e) => (
            <div key={e.id} className="flex gap-3">
              <div
                className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full font-display text-[10px] font-extrabold text-[oklch(20%_0.03_0)]"
                style={{ background: e.profiles?.avatar_color ?? avatarColor(e.profiles?.display_name ?? "?") }}
              >
                {initials(e.profiles?.display_name ?? "?")}
              </div>
              <div className="flex-1">
                <div className="text-xs text-text-faint">
                  {e.profiles?.display_name} · {formatFullDate(e.watched_on)}
                  {e.locations?.name && ` · ${e.locations.name}`}
                  {` · ${e.language}`}
                </div>
                {e.is_rewatch ? (
                  <p className="mt-1 text-[13px] text-text-faint">Rewatch — pas de nouvel avis.</p>
                ) : (
                  e.comment && (
                    <p className="mt-1 text-[13.5px] italic leading-relaxed text-text-muted">
                      « {e.comment} »
                    </p>
                  )
                )}
                <div className="mt-2 flex items-center gap-2">
                  <ReactionBar entryId={e.id} reactions={e.reactions} currentUserId={currentUserId} />
                  <EntryActions entry={e} currentUserId={currentUserId} isAdmin={isAdmin} path={path} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
