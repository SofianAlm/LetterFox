"use client";

import { useActionState, useState } from "react";
import { resetPassword, type ResetPasswordState } from "@/app/actions/admin";

type Profile = { id: string; display_name: string; is_admin: boolean };

const initialState: ResetPasswordState = { error: null, success: false };

function ResetRow({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(resetPassword, initialState);

  return (
    <div className="rounded-xl border border-border bg-bg-elev-2 p-3.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold">
          {profile.display_name}
          {profile.is_admin && <span className="ml-1.5 text-xs text-accent">· admin</span>}
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-xs font-bold text-text-muted hover:text-text"
        >
          {open ? "Annuler" : "Réinitialiser le mot de passe"}
        </button>
      </div>

      {open && (
        <form action={formAction} className="mt-3 flex flex-col gap-2.5 sm:flex-row">
          <input type="hidden" name="user_id" value={profile.id} />
          <input
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="Nouveau mot de passe (8+ caractères)"
            className="w-full flex-1 rounded-[10px] border border-border-strong bg-bg-elev-3 px-3.5 py-2.5 text-sm placeholder:text-text-faint focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            disabled={pending}
            className="w-full flex-shrink-0 rounded-[10px] bg-accent px-4 py-2.5 text-sm font-bold text-on-accent disabled:opacity-60 sm:w-auto"
          >
            {pending ? "…" : "Valider"}
          </button>
        </form>
      )}
      {state.error && <p className="mt-2 text-xs text-red-400">{state.error}</p>}
      {state.success && (
        <p className="mt-2 text-xs text-emerald-400">
          Mot de passe mis à jour — transmets-le à la personne.
        </p>
      )}
    </div>
  );
}

export function AccountsList({ profiles }: { profiles: Profile[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      {profiles.map((p) => (
        <ResetRow key={p.id} profile={p} />
      ))}
    </div>
  );
}
