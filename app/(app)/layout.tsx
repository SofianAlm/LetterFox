import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { MobileTabBar } from "@/components/MobileTabBar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profileRows } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .limit(1)
    .returns<{ display_name: string }[]>();
  const profile = profileRows?.[0];

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Navbar displayName={profile?.display_name ?? user.email ?? "?"} />
      {children}
      <MobileTabBar />
    </div>
  );
}
