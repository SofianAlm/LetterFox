"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
