"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AddWatchingState = { error: string | null };

export async function addWatchingSeries(
  _prev: AddWatchingState,
  formData: FormData,
): Promise<AddWatchingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté." };

  const { error } = await supabase.from("series_progress").insert({
    user_id: user.id,
    tmdb_id: Number(formData.get("tmdb_id")),
    title: String(formData.get("title")),
    poster_path: (formData.get("poster_path") as string) || null,
    release_year: formData.get("release_year") ? Number(formData.get("release_year")) : null,
  });

  if (error) {
    if (error.code === "23505") return { error: "Déjà dans tes séries en cours." };
    return { error: "Impossible d'ajouter cette série." };
  }

  revalidatePath("/series");
  revalidatePath("/profile/series");
  return { error: null };
}

export async function removeFromWatching(tmdbId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("series_progress")
    .delete()
    .eq("user_id", user.id)
    .eq("tmdb_id", tmdbId);

  revalidatePath("/series");
  revalidatePath("/profile/series");
}
