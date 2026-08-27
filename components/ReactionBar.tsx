"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { toggleReaction } from "@/app/actions/reactions";
import { REACTION_EMOJIS, type ReactionEmoji } from "@/lib/reactions";
import { PlusIcon } from "./icons";

export function ReactionBar({
  entryId,
  reactions,
  currentUserId,
}: {
  entryId: string;
  reactions: { emoji: string; user_id: string }[];
  currentUserId: string;
}) {
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [pickerOpen, setPickerOpen] = useState(false);

  const counts = new Map<string, { count: number; mine: boolean }>();
  for (const r of reactions) {
    const entry = counts.get(r.emoji) ?? { count: 0, mine: false };
    entry.count += 1;
    if (r.user_id === currentUserId) entry.mine = true;
    counts.set(r.emoji, entry);
  }

  function react(emoji: ReactionEmoji) {
    setPickerOpen(false);
    startTransition(() => toggleReaction(entryId, emoji, pathname));
  }

  return (
    <div className="flex items-center gap-2">
      {[...counts.entries()].map(([emoji, { count, mine }]) => (
        <button
          key={emoji}
          type="button"
          disabled={pending}
          onClick={() => react(emoji as ReactionEmoji)}
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[13px] ${
            mine
              ? "border-accent-soft-strong bg-accent-soft text-accent"
              : "border-border bg-bg-elev-2 text-text-muted"
          }`}
        >
          <span>{emoji}</span>
          <span>{count}</span>
        </button>
      ))}

      <div className="relative">
        <button
          type="button"
          onClick={() => setPickerOpen((v) => !v)}
          className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-dashed border-border-strong text-text-faint"
          aria-label="Ajouter une réaction"
        >
          <PlusIcon className="h-3.5 w-3.5" />
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
