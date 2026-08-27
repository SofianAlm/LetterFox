"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export type UpdatePasswordState = { error: string | null; success: boolean };

export async function updatePassword(
  _prev: UpdatePasswordState,
  formData: FormData,
): Promise<UpdatePasswordState> {
  const newPassword = String(formData.get("new_password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");

  if (newPassword.length < 8) {
    return { error: "Le mot de passe doit faire au moins 8 caractères.", success: false };
  }
  if (newPassword !== confirm) {
    return { error: "Les deux mots de passe ne correspondent pas.", success: false };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: "Impossible de mettre à jour le mot de passe.", success: false };

  return { error: null, success: true };
}
