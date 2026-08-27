import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";
import { MobileTabBar } from "@/components/MobileTabBar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName: string | null = null;
  let avatarColor: string | null = null;
  if (user) {
    const { data: profileRows } = await supabase
      .from("profiles")
      .select("display_name, avatar_color")
      .eq("id", user.id)
      .limit(1)
      .returns<{ display_name: string; avatar_color: string | null }[]>();
    displayName = profileRows?.[0]?.display_name ?? user.email ?? "?";
    avatarColor = profileRows?.[0]?.avatar_color ?? null;
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Sidebar displayName={displayName} avatarColor={avatarColor} />
      <div className="md:pl-[232px]">{children}</div>
      <MobileTabBar displayName={displayName} />
    </div>
  );
}
