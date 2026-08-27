"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setTopPick(
  mediaType: "movie" | "tv",
  rank: 1 | 2 | 3,
  pick: { tmdbId: number; title: string; posterPath: string | null; releaseYear: number | null },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté." };

  const { error } = await supabase.from("top_picks").upsert(
    {
      user_id: user.id,
      media_type: mediaType,
      rank,
      tmdb_id: pick.tmdbId,
      title: pick.title,
      poster_path: pick.posterPath,
      release_year: pick.releaseYear,
    },
    { onConflict: "user_id,media_type,rank" },
  );

  if (error) return { error: "Impossible d'enregistrer ce choix." };

  revalidatePath("/profile");
  revalidatePath("/tops");
  return { error: null };
}

export async function removeTopPick(mediaType: "movie" | "tv", rank: 1 | 2 | 3) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("top_picks")
    .delete()
    .eq("user_id", user.id)
    .eq("media_type", mediaType)
    .eq("rank", rank);

  revalidatePath("/profile");
  revalidatePath("/tops");
}
