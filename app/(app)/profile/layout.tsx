import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileTabs } from "@/components/ProfileTabs";

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: rows } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .limit(1)
    .returns<{ is_admin: boolean }[]>();
  const isAdmin = rows?.[0]?.is_admin ?? false;

  return (
    <div className="mx-auto max-w-[1000px] px-6 pb-24 pt-10 sm:px-10">
      <h1 className="mb-6 font-display text-[26px] font-bold">Profil</h1>
      <ProfileTabs isAdmin={isAdmin} />
      {children}
    </div>
  );
}
