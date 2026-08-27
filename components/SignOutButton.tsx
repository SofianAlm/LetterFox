"use client";

import { signOut } from "@/app/actions/auth";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="w-full rounded-[10px] border border-border-strong px-4 py-2.5 text-sm font-bold text-text-muted"
      >
        Se déconnecter
      </button>
    </form>
  );
}
