import { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function isAdmin(
  supabase: SupabaseServerClient,
  userId: string | undefined,
): Promise<boolean> {
  if (!userId) return false;
  const { data } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .limit(1)
    .returns<{ is_admin: boolean }[]>();
  return data?.[0]?.is_admin ?? false;
}
