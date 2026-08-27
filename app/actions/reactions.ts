"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { REACTION_EMOJIS, type ReactionEmoji } from "@/lib/reactions";

export async function toggleReaction(entryId: string, emoji: ReactionEmoji, path: string) {
  if (!REACTION_EMOJIS.includes(emoji)) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existingRows } = await supabase
    .from("reactions")
    .select("id")
    .eq("watch_entry_id", entryId)
    .eq("user_id", user.id)
    .eq("emoji", emoji)
    .limit(1)
    .returns<{ id: string }[]>();

  if (existingRows?.[0]) {
    await supabase.from("reactions").delete().eq("id", existingRows[0].id);
  } else {
    await supabase
      .from("reactions")
      .insert({ watch_entry_id: entryId, user_id: user.id, emoji })
      .select("id");
  }

  revalidatePath(path);
}
