"use client";

import { useState, useTransition } from "react";
import { backfillGenres } from "@/app/actions/admin";

export function BackfillGenresButton() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ error: string | null; updated: number | null } | null>(
    null,
  );

  return (
    <div>
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            setResult(await backfillGenres());
          })
        }
        className="rounded-[10px] bg-accent px-5 py-3 text-sm font-bold text-on-accent disabled:opacity-60"
      >
        {isPending ? "Récupération en cours…" : "Récupérer les catégories manquantes"}
      </button>
      {result?.error && <p className="mt-3 text-sm text-red-400">{result.error}</p>}
      {result && !result.error && (
        <p className="mt-3 text-sm text-emerald-400">
          {result.updated} titre{(result.updated ?? 0) > 1 ? "s" : ""} mis à jour.
        </p>
      )}
    </div>
  );
}
