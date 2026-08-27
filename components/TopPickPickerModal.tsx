"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Modal } from "./Modal";
import { posterUrl } from "@/lib/tmdb-image";
import { SearchIcon } from "./icons";

type Item = {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  year: number | null;
};

export function TopPickPickerModal({
  title,
  items,
  onPick,
  onClose,
}: {
  title: string;
  items: Item[];
  onPick: (item: Item) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => items.filter((i) => i.title.toLowerCase().includes(query.trim().toLowerCase())),
    [items, query],
  );

  return (
    <Modal title={title} onClose={onClose} width={480}>
      <div className="p-6">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-faint" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher dans tes visionnages…"
            className="w-full rounded-[10px] border border-border-strong bg-bg-elev-2 py-3 pl-[42px] pr-3.5 text-sm focus:border-accent focus:outline-none"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="mt-4 text-sm text-text-faint">Aucun résultat.</p>
        ) : (
          <div className="mt-2.5 max-h-[360px] overflow-y-auto rounded-xl border border-border-strong">
            {filtered.map((item) => (
              <button
                type="button"
                key={item.tmdbId}
                onClick={() => onPick(item)}
                className="flex w-full items-center gap-3 border-b border-border p-2.5 text-left last:border-none hover:bg-bg-elev-2"
              >
                <span className="h-16 w-11 flex-shrink-0 overflow-hidden rounded-md bg-bg-elev-2">
                  {item.posterPath && (
                    <Image
                      src={posterUrl(item.posterPath, "w92")!}
                      alt=""
                      width={44}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  )}
                </span>
                <span>
                  <span className="block text-sm font-semibold">{item.title}</span>
                  <span className="block text-xs text-text-faint">{item.year ?? "—"}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
