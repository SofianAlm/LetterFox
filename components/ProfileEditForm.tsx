"use client";

import { useActionState, useState } from "react";
import { updateProfile, type UpdateProfileState } from "@/app/actions/profile";
import { AVATAR_SWATCHES, initials } from "@/lib/avatar-color";

const initialState: UpdateProfileState = { error: null, success: false };

export function ProfileEditForm({
  displayName: initialDisplayName,
  avatarColor: initialAvatarColor,
}: {
  displayName: string;
  avatarColor: string;
}) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [avatarColor, setAvatarColor] = useState(initialAvatarColor);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="avatar_color" value={avatarColor} />
      <div>
        <label className="mb-2 block text-[13px] font-bold text-text-muted">Nom affiché</label>
        <input
          name="display_name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          className="w-full rounded-[10px] border border-border-strong bg-bg-elev-2 px-3.5 py-3 text-sm focus:border-accent focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-2 block text-[13px] font-bold text-text-muted">
          Couleur de l&rsquo;avatar
        </label>
        <div className="flex flex-wrap gap-2.5">
          {AVATAR_SWATCHES.map((swatch) => (
            <button
              key={swatch}
              type="button"
              onClick={() => setAvatarColor(swatch)}
              className={`flex h-10 w-10 items-center justify-center rounded-full font-display text-[11px] font-extrabold text-[oklch(20%_0.03_0)] ${
                avatarColor === swatch ? "ring-2 ring-text ring-offset-2 ring-offset-bg-elev" : ""
              }`}
              style={{ background: swatch }}
              aria-label="Choisir cette couleur"
            >
              {avatarColor === swatch ? initials(displayName || "?") : ""}
            </button>
          ))}
        </div>
      </div>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-400">Profil mis à jour.</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 self-start rounded-[10px] bg-accent px-5 py-3 text-sm font-bold text-bg disabled:opacity-60"
      >
        {pending ? "Mise à jour…" : "Enregistrer"}
      </button>
    </form>
  );
}
