"use client";

import { useActionState } from "react";
import { updatePassword, type UpdatePasswordState } from "@/app/actions/auth";

const initialState: UpdatePasswordState = { error: null, success: false };

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, initialState);

  return (
    <form action={formAction} className="flex max-w-[420px] flex-col gap-4">
      <div>
        <label className="mb-2 block text-[13px] font-bold text-text-muted">
          Nouveau mot de passe
        </label>
        <input
          type="password"
          name="new_password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-[10px] border border-border-strong bg-bg-elev-2 px-3.5 py-3 text-sm focus:border-accent focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-2 block text-[13px] font-bold text-text-muted">
          Confirmer le nouveau mot de passe
        </label>
        <input
          type="password"
          name="confirm_password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-[10px] border border-border-strong bg-bg-elev-2 px-3.5 py-3 text-sm focus:border-accent focus:outline-none"
        />
      </div>
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-400">Mot de passe mis à jour.</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-1 self-start rounded-[10px] bg-accent px-5 py-3 text-sm font-bold text-on-accent disabled:opacity-60"
      >
        {pending ? "Mise à jour…" : "Mettre à jour le mot de passe"}
      </button>
    </form>
  );
}
