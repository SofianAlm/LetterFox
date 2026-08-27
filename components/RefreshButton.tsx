"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshIcon } from "./icons";

export function RefreshButton({ className }: { className?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => router.refresh())}
      aria-label="Actualiser"
      disabled={isPending}
      className={`flex items-center justify-center rounded-full border border-border-strong bg-bg-elev-2 text-text-muted hover:text-text disabled:opacity-60 ${className ?? "h-8 w-8"}`}
    >
      <RefreshIcon className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
    </button>
  );
}
