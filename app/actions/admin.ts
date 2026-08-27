"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMovieDetails, getTvDetails } from "@/lib/tmdb";

async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: rows } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .limit(1)
    .returns<{ is_admin: boolean }[]>();

  return rows?.[0]?.is_admin ?? false;
}

export type CreateAccountState = { error: string | null; success: boolean };

export async function createAccount(
  _prev: CreateAccountState,
  formData: FormData,
): Promise<CreateAccountState> {
  if (!(await isCurrentUserAdmin())) {
    return { error: "Réservé aux administrateurs.", success: false };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim();

  if (!email || !password || !displayName) {
    return { error: "Tous les champs sont obligatoires.", success: false };
  }
  if (password.length < 8) {
    return { error: "Le mot de passe doit faire au moins 8 caractères.", success: false };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  });

  if (error) {
    return { error: "Impossible de créer ce compte (email déjà utilisé ?).", success: false };
  }

  revalidatePath("/profile");
  return { error: null, success: true };
}

export type BackfillGenresState = { error: string | null; updated: number | null };

export async function backfillGenres(): Promise<BackfillGenresState> {
  if (!(await isCurrentUserAdmin())) {
    return { error: "Réservé aux administrateurs.", updated: null };
  }

  const supabase = await createClient();
  const { data: rows } = await supabase.from("watch_entries").select("media_type, tmdb_id");

  const uniquePairs = new Map<string, { media_type: string; tmdb_id: number }>();
  for (const r of rows ?? []) uniquePairs.set(`${r.media_type}:${r.tmdb_id}`, r);

  let updated = 0;
  const pairs = [...uniquePairs.values()];
  const chunkSize = 5;

  for (let i = 0; i < pairs.length; i += chunkSize) {
    const chunk = pairs.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map(async (pair) => {
        try {
          const genres =
            pair.media_type === "movie"
              ? (await getMovieDetails(pair.tmdb_id)).genres.map((g) => g.name)
              : (await getTvDetails(pair.tmdb_id)).genres.map((g) => g.name);
          if (genres.length === 0) return;

          const { error } = await supabase
            .from("watch_entries")
            .update({ genres })
            .eq("media_type", pair.media_type)
            .eq("tmdb_id", pair.tmdb_id);
          if (!error) updated += 1;
        } catch {
          // TMDB lookup failed for this title (deleted, renamed…) — skip it.
        }
      }),
    );
  }

  revalidatePath("/");
  revalidatePath("/films");
  revalidatePath("/series");
  return { error: null, updated };
}
