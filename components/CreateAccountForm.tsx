"use client";

import { useActionState, useEffect, useRef } from "react";
import { createAccount, type CreateAccountState } from "@/app/actions/admin";

const initialState: CreateAccountState = { error: null, success: false };

export function CreateAccountForm() {
  const [state, formAction, pending] = useActionState(createAccount, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex max-w-[420px] flex-col gap-4">
      <div>
        <label className="mb-2 block text-[13px] font-bold text-text-muted">Nom affiché</label>
        <input
          name="display_name"
          required
          placeholder="Camille"
          className="w-full rounded-[10px] border border-border-strong bg-bg-elev-2 px-3.5 py-3 text-sm placeholder:text-text-faint focus:border-accent focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-2 block text-[13px] font-bold text-text-muted">Email</label>
        <input
          name="email"
          type="email"
          required
          placeholder="camille@exemple.com"
          className="w-full rounded-[10px] border border-border-strong bg-bg-elev-2 px-3.5 py-3 text-sm placeholder:text-text-faint focus:border-accent focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-2 block text-[13px] font-bold text-text-muted">
          Mot de passe temporaire
        </label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Au moins 8 caractères"
          className="w-full rounded-[10px] border border-border-strong bg-bg-elev-2 px-3.5 py-3 text-sm placeholder:text-text-faint focus:border-accent focus:outline-none"
        />
      </div>
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-emerald-400">
          Compte créé — la personne peut se connecter et changer son mot de passe ensuite.
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-1 self-start rounded-[10px] bg-accent px-5 py-3 text-sm font-bold text-on-accent disabled:opacity-60"
      >
        {pending ? "Création…" : "Créer le compte"}
      </button>
    </form>
  );
}
