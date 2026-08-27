"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "./Modal";
import { updateEntry, type AddEntryState } from "@/app/actions/watch-entries";
import type { FeedEntry } from "@/lib/feed";

const initialState: AddEntryState = { error: null };

export function EditEntryModal({ entry, onClose }: { entry: FeedEntry; onClose: () => void }) {
  const router = useRouter();
  const accent = entry.media_type === "movie" ? "blue" : "purple";
  const [isRewatch, setIsRewatch] = useState(entry.is_rewatch);
  const [rating, setRating] = useState(entry.rating ?? 7);
  const [language, setLanguage] = useState<"VF" | "VO">(entry.language === "VO" ? "VO" : "VF");
  const [submitted, setSubmitted] = useState(false);
  const [state, formAction, pending] = useActionState(updateEntry, initialState);

  useEffect(() => {
    if (submitted && !pending && state.error === null) {
      router.refresh();
      onClose();
    }
  }, [submitted, pending, state, router, onClose]);

  return (
    <Modal title={`Modifier — ${entry.title}`} onClose={onClose}>
      <form
        action={(formData) => {
          setSubmitted(true);
          formAction(formData);
        }}
        className="flex flex-col gap-4 p-6"
      >
        <input type="hidden" name="entry_id" value={entry.id} />
        <input type="hidden" name="language" value={language} />

        <label className="flex items-center justify-between gap-3 rounded-[10px] border border-border-strong bg-bg-elev-2 p-3.5">
          <span>
            <span className="block text-[13.5px] font-bold">Rewatch</span>
            <span className="block text-xs text-text-faint">
              Déjà vu — pas de nouvelle note ni commentaire
            </span>
          </span>
          <input
            type="checkbox"
            checked={isRewatch}
            onChange={(e) => setIsRewatch(e.target.checked)}
            className={`h-5 w-5 ${accent === "blue" ? "accent-blue" : "accent-purple"}`}
          />
        </label>
        <input type="hidden" name="is_rewatch" value={isRewatch ? "on" : ""} />

        <div>
          <label className="mb-2 block text-[13px] font-bold text-text-muted">Langue</label>
          <div className="flex rounded-[11px] border border-border bg-bg-elev-2 p-1">
            {(["VF", "VO"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLanguage(l)}
                className={`flex-1 rounded-[8px] py-2 text-[13.5px] font-bold ${
                  language === l
                    ? `${accent === "blue" ? "bg-blue" : "bg-purple"} text-on-accent`
                    : "text-text-muted"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-[13px] font-bold text-text-muted">
              Date de visionnage
            </label>
            <input
              type="date"
              name="watched_on"
              required
              defaultValue={entry.watched_on}
              className="w-full rounded-[10px] border border-border-strong bg-bg-elev-2 px-3.5 py-3 text-sm focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-[13px] font-bold text-text-muted">Lieu</label>
            <input
              name="location"
              defaultValue={entry.locations?.name ?? ""}
              placeholder="Chez Sofian…"
              className="w-full rounded-[10px] border border-border-strong bg-bg-elev-2 px-3.5 py-3 text-sm focus:border-accent focus:outline-none"
            />
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
            className={`w-full ${accent === "blue" ? "accent-blue" : "accent-purple"}`}
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
            defaultValue={entry.comment ?? ""}
            className="w-full resize-none rounded-[10px] border border-border-strong bg-bg-elev-2 px-3.5 py-3 text-sm placeholder:text-text-faint focus:border-accent focus:outline-none"
          />
        </div>

        {state.error && <p className="text-sm text-red-400">{state.error}</p>}

        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[10px] border border-border-strong px-5 py-3 text-sm font-bold"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={pending}
            className={`rounded-[10px] ${
              accent === "blue" ? "bg-blue" : "bg-purple"
            } px-5 py-3 text-sm font-bold text-on-accent disabled:opacity-60`}
          >
            {pending ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
