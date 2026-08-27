"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function resolveLocationId(
  supabase: SupabaseServerClient,
  name: string,
  userId: string,
): Promise<string | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const { data: existingRows } = await supabase
    .from("locations")
    .select("id")
    .eq("name", trimmed)
    .limit(1)
    .returns<{ id: string }[]>();
  if (existingRows?.[0]) return existingRows[0].id;

  const { data: createdRows, error } = await supabase
    .from("locations")
    .insert({ name: trimmed, created_by: userId })
    .select("id")
    .returns<{ id: string }[]>();
  if (error) throw error;
  return createdRows![0].id;
}

function parseGenres(formData: FormData): string[] {
  try {
    const parsed = JSON.parse(String(formData.get("genres") ?? "[]"));
    if (Array.isArray(parsed)) return parsed.filter((g): g is string => typeof g === "string");
  } catch {
    // ignore malformed input, fall through to empty
  }
  return [];
}

export type AddEntryState = { error: string | null };

export async function addMovieEntry(
  _prev: AddEntryState,
  formData: FormData,
): Promise<AddEntryState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté." };

  const isRewatch = formData.get("is_rewatch") === "on";
  const language = formData.get("language") === "VO" ? "VO" : "VF";
  const locationId = await resolveLocationId(
    supabase,
    String(formData.get("location") ?? ""),
    user.id,
  );

  const { error } = await supabase.from("watch_entries").insert({
    user_id: user.id,
    media_type: "movie",
    granularity: "movie",
    tmdb_id: Number(formData.get("tmdb_id")),
    title: String(formData.get("title")),
    poster_path: (formData.get("poster_path") as string) || null,
    release_year: formData.get("release_year") ? Number(formData.get("release_year")) : null,
    genres: parseGenres(formData),
    watched_on: String(formData.get("watched_on")),
    location_id: locationId,
    language,
    rating: isRewatch ? null : Number(formData.get("rating")),
    comment: isRewatch ? null : String(formData.get("comment") ?? "").trim() || null,
    is_rewatch: isRewatch,
  });

  if (error) return { error: "Impossible d'ajouter ce film." };

  revalidatePath("/films");
  revalidatePath("/");
  return { error: null };
}

export async function addSeriesEntry(
  _prev: AddEntryState,
  formData: FormData,
): Promise<AddEntryState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté." };

  const isRewatch = formData.get("is_rewatch") === "on";
  const granularity = String(formData.get("granularity")) as "season" | "episode";
  const language = formData.get("language") === "VO" ? "VO" : "VF";
  const locationId = await resolveLocationId(
    supabase,
    String(formData.get("location") ?? ""),
    user.id,
  );

  const { error } = await supabase.from("watch_entries").insert({
    user_id: user.id,
    media_type: "tv",
    granularity,
    tmdb_id: Number(formData.get("tmdb_id")),
    title: String(formData.get("title")),
    poster_path: (formData.get("poster_path") as string) || null,
    release_year: formData.get("release_year") ? Number(formData.get("release_year")) : null,
    genres: parseGenres(formData),
    season_number: Number(formData.get("season_number")),
    episode_number: granularity === "episode" ? Number(formData.get("episode_number")) : null,
    episode_name:
      granularity === "episode" ? String(formData.get("episode_name") ?? "").trim() || null : null,
    watched_on: String(formData.get("watched_on")),
    location_id: locationId,
    language,
    rating: isRewatch ? null : Number(formData.get("rating")),
    comment: isRewatch ? null : String(formData.get("comment") ?? "").trim() || null,
    is_rewatch: isRewatch,
  });

  if (error) return { error: "Impossible d'ajouter cette série." };

  revalidatePath("/series");
  revalidatePath("/");
  return { error: null };
}

export async function updateEntry(
  _prev: AddEntryState,
  formData: FormData,
): Promise<AddEntryState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté." };

  const entryId = String(formData.get("entry_id") ?? "");
  const isRewatch = formData.get("is_rewatch") === "on";
  const language = formData.get("language") === "VO" ? "VO" : "VF";
  const locationId = await resolveLocationId(
    supabase,
    String(formData.get("location") ?? ""),
    user.id,
  );

  const { error } = await supabase
    .from("watch_entries")
    .update({
      watched_on: String(formData.get("watched_on")),
      location_id: locationId,
      language,
      rating: isRewatch ? null : Number(formData.get("rating")),
      comment: isRewatch ? null : String(formData.get("comment") ?? "").trim() || null,
      is_rewatch: isRewatch,
    })
    .eq("id", entryId)
    .eq("user_id", user.id);

  if (error) return { error: "Impossible de modifier cet avis." };

  revalidatePath("/films/[id]", "page");
  revalidatePath("/series/[id]", "page");
  revalidatePath("/");
  revalidatePath("/profile");
  return { error: null };
}

export async function deleteEntry(entryId: string, path: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("watch_entries").delete().eq("id", entryId).eq("user_id", user.id);
  revalidatePath(path);
  revalidatePath("/");
  revalidatePath("/profile");
}
