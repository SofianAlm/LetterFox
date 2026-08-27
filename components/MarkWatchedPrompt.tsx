"use client";

import { Modal } from "./Modal";

export function MarkWatchedPrompt({
  title,
  onAlreadySeen,
  onJustWatched,
  onClose,
}: {
  title: string;
  onAlreadySeen: () => void;
  onJustWatched: () => void;
  onClose: () => void;
}) {
  return (
    <Modal title="C'est vu !" onClose={onClose} width={420}>
      <div className="p-6">
        <p className="text-sm text-text-muted">
          Tu avais déjà vu <span className="font-bold text-text">{title}</span>, ou tu viens de le
          voir ?
        </p>
        <div className="mt-5 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onJustWatched}
            className="rounded-[10px] bg-accent px-4 py-3 text-sm font-bold text-on-accent"
          >
            Je viens de le voir
          </button>
          <button
            type="button"
            onClick={onAlreadySeen}
            className="rounded-[10px] border border-border-strong px-4 py-3 text-sm font-bold"
          >
            Je l&rsquo;avais déjà vu
          </button>
        </div>
      </div>
    </Modal>
  );
}
