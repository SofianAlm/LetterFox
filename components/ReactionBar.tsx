"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { toggleReaction } from "@/app/actions/reactions";
import { REACTION_EMOJIS, type ReactionEmoji } from "@/lib/reactions";
import { PlusIcon } from "./icons";

type Reaction = { emoji: string; user_id: string; profiles?: { display_name: string } | null };

export function ReactionBar({
  entryId,
  reactions,
  currentUserId,
  size = "md",
}: {
  entryId: string;
  reactions: Reaction[];
  currentUserId: string;
  size?: "md" | "lg";
}) {
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const lg = size === "lg";

  const counts = new Map<string, { count: number; mine: boolean; names: string[] }>();
  for (const r of reactions) {
    const entry = counts.get(r.emoji) ?? { count: 0, mine: false, names: [] };
    entry.count += 1;
    if (r.user_id === currentUserId) entry.mine = true;
    if (r.profiles?.display_name) entry.names.push(r.profiles.display_name);
    counts.set(r.emoji, entry);
  }

  const isAnonymous = currentUserId === "";

  function react(emoji: ReactionEmoji) {
    setPickerOpen(false);
    startTransition(() => toggleReaction(entryId, emoji, pathname));
  }

  if (isAnonymous) {
    return (
      <div className="flex items-center gap-2">
        {[...counts.entries()].map(([emoji, { count, names }]) => (
          <span
            key={emoji}
            className="relative"
            onMouseEnter={() => setHovered(emoji)}
            onMouseLeave={() => setHovered((h) => (h === emoji ? null : h))}
          >
            <span
              className={`flex items-center gap-1.5 rounded-full border border-border bg-bg-elev-2 text-text-muted ${
                lg ? "px-3 py-1.5 text-[15px]" : "px-2.5 py-1 text-[13px]"
              }`}
            >
              <span>{emoji}</span>
              <span>{count}</span>
            </span>
            {hovered === emoji && names.length > 0 && (
              <span className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border-strong bg-bg-elev-2 px-2.5 py-1.5 text-xs font-semibold text-text shadow-lg">
                {names.join(", ")}
              </span>
            )}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {[...counts.entries()].map(([emoji, { count, mine, names }]) => (
        <div
          key={emoji}
          className="relative"
          onMouseEnter={() => setHovered(emoji)}
          onMouseLeave={() => setHovered((h) => (h === emoji ? null : h))}
        >
          <button
            type="button"
            disabled={pending}
            onClick={() => react(emoji as ReactionEmoji)}
            className={`flex items-center gap-1.5 rounded-full border font-bold ${
              lg ? "px-3 py-1.5 text-[15px]" : "px-2.5 py-1 text-[13px]"
            } ${
              mine
                ? "border-accent-soft-strong bg-accent-soft text-accent"
                : "border-border bg-bg-elev-2 text-text-muted"
            }`}
          >
            <span>{emoji}</span>
            <span>{count}</span>
          </button>
          {hovered === emoji && names.length > 0 && (
            <span className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border-strong bg-bg-elev-2 px-2.5 py-1.5 text-xs font-semibold text-text shadow-lg">
              {names.join(", ")}
            </span>
          )}
        </div>
      ))}

      <div className="relative">
        <button
          type="button"
          onClick={() => setPickerOpen((v) => !v)}
          className={`flex items-center justify-center rounded-full border border-dashed border-border-strong text-text-faint ${
            lg ? "h-9 w-9" : "h-[30px] w-[30px]"
          }`}
          aria-label="Ajouter une réaction"
        >
          <PlusIcon className={lg ? "h-4 w-4" : "h-3.5 w-3.5"} />
        </button>
        {pickerOpen && (
          <div className="absolute bottom-full right-0 z-10 mb-2 flex gap-1 rounded-full border border-border-strong bg-bg-elev-2 p-1.5 shadow-lg">
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                disabled={pending}
                onClick={() => react(emoji)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-base hover:bg-bg-elev-3"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
