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

  let genres: string[] = [];
  try {
    const parsed = JSON.parse(String(formData.get("genres") ?? "[]"));
    if (Array.isArray(parsed)) genres = parsed.filter((g): g is string => typeof g === "string");
  } catch {
    genres = [];
  }

  const { data: inserted, error } = await supabase
    .from("watchlist_items")
    .insert({
      media_type: mediaType,
      tmdb_id: Number(formData.get("tmdb_id")),
      title: String(formData.get("title")),
      poster_path: (formData.get("poster_path") as string) || null,
      release_year: formData.get("release_year") ? Number(formData.get("release_year")) : null,
      genres,
      added_by: user.id,
    })
    .select("id")
    .returns<{ id: string }[]>();

  if (error) {
    if (error.code === "23505") return { error: "Déjà dans la liste à voir." };
    return { error: "Impossible d'ajouter cet élément." };
  }

  if (inserted?.[0]) {
    await supabase.from("watchlist_wants").insert({ item_id: inserted[0].id, profile_id: user.id });
  }

  revalidatePath("/watchlist");
  return { error: null };
}

export async function toggleWant(itemId: string, currentlyWanted: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  if (currentlyWanted) {
    await supabase
      .from("watchlist_wants")
      .delete()
      .eq("item_id", itemId)
      .eq("profile_id", user.id);
  } else {
    await supabase.from("watchlist_wants").insert({ item_id: itemId, profile_id: user.id });
  }

  revalidatePath("/watchlist");
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
