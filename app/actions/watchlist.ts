"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AddWatchlistState = { error: string | null };

export async function addWatchlistItem(
  _prev: AddWatchlistState,
  formData: FormData,
): Promise<AddWatchlistState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté." };

  const mediaType = formData.get("media_type") === "tv" ? "tv" : "movie";

  const { error } = await supabase.from("watchlist_items").insert({
    media_type: mediaType,
    tmdb_id: Number(formData.get("tmdb_id")),
    title: String(formData.get("title")),
    poster_path: (formData.get("poster_path") as string) || null,
    release_year: formData.get("release_year") ? Number(formData.get("release_year")) : null,
    added_by: user.id,
  });

  if (error) {
    if (error.code === "23505") return { error: "Déjà dans la liste à voir." };
    return { error: "Impossible d'ajouter cet élément." };
  }

  revalidatePath("/watchlist");
  return { error: null };
}

export async function markWatchlistItemWatched(itemId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("watchlist_items")
    .update({ watched: true, watched_by: user.id, watched_at: new Date().toISOString() })
    .eq("id", itemId);

  revalidatePath("/watchlist");
}

export async function deleteWatchlistItem(itemId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("watchlist_items").delete().eq("id", itemId).eq("added_by", user.id);
  revalidatePath("/watchlist");
}
