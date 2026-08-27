import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";
import { MobileMenu } from "@/components/MobileMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { RefreshButton } from "@/components/RefreshButton";

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
    <div className="min-h-screen">
      <Sidebar displayName={displayName} avatarColor={avatarColor} />
      <MobileMenu displayName={displayName} avatarColor={avatarColor} />
      <div className="fixed right-4 top-4 z-20 flex items-center gap-2">
        <RefreshButton className="h-8 w-8" />
        <ThemeToggle className="h-8 w-14" />
      </div>
      <div className="pt-14 md:pl-[232px]">{children}</div>
    </div>
  );
}
