"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { AVATAR_SWATCHES } from "@/lib/avatar-color";

export type UpdateProfileState = { error: string | null; success: boolean };

export async function updateProfile(
  _prev: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté.", success: false };

  const displayName = String(formData.get("display_name") ?? "").trim();
  const avatarColor = String(formData.get("avatar_color") ?? "");

  if (!displayName) return { error: "Le nom affiché est obligatoire.", success: false };
  if (!(AVATAR_SWATCHES as string[]).includes(avatarColor)) {
    return { error: "Couleur invalide.", success: false };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName, avatar_color: avatarColor })
    .eq("id", user.id);

  if (error) return { error: "Impossible de mettre à jour le profil.", success: false };

  revalidatePath("/", "layout");
  return { error: null, success: true };
}
