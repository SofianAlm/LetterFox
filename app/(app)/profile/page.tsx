import { createClient } from "@/lib/supabase/server";
import { initials, avatarColor as hashAvatarColor } from "@/lib/avatar-color";
import { formatRating } from "@/lib/ratings";
import { formatFullDate } from "@/lib/date";
import { PasswordForm } from "@/components/PasswordForm";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import { SignOutButton } from "@/components/SignOutButton";
import { TopPicksEditor } from "@/components/TopPicksEditor";
import type { Tables } from "@/lib/database.types";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profileRows }, { data: myEntries }, { data: myPicks }] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, avatar_color, created_at")
      .eq("id", user.id)
      .limit(1)
      .returns<{ display_name: string; avatar_color: string | null; created_at: string }[]>(),
    supabase
      .from("watch_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("watched_on", { ascending: false })
      .returns<Tables<"watch_entries">[]>(),
    supabase
      .from("top_picks")
      .select("*")
      .eq("user_id", user.id)
      .returns<Tables<"top_picks">[]>(),
  ]);
  const profile = profileRows?.[0];
  const displayName = profile?.display_name ?? user.email ?? "?";
  const avatarColor = profile?.avatar_color ?? hashAvatarColor(displayName);

  const entries = myEntries ?? [];
  const filmCount = entries.filter((e) => e.media_type === "movie").length;
  const seriesCount = entries.filter((e) => e.media_type === "tv").length;
  const rated = entries.filter((e) => e.rating !== null);
  const avgGiven = rated.length
    ? rated.reduce((sum, e) => sum + e.rating!, 0) / rated.length
    : null;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[320px_1fr] md:items-start">
      <div className="rounded-2xl border border-border bg-bg-elev p-7 text-center">
        <div
          className="mx-auto flex h-[88px] w-[88px] items-center justify-center rounded-full font-display text-[26px] font-extrabold text-[oklch(20%_0.03_0)]"
          style={{ background: avatarColor }}
        >
          {initials(displayName)}
        </div>
        <h2 className="mt-4 text-lg font-bold">{displayName}</h2>
        <p className="mt-1 text-[13.5px] text-text-faint">{user.email}</p>
        {profile?.created_at && (
          <p className="mt-2.5 text-xs text-text-faint">
            Membre depuis {formatFullDate(profile.created_at.slice(0, 10))}
          </p>
        )}

        <div className="mt-6 flex border-t border-border pt-5">
          <div className="flex-1">
            <div className="font-display text-xl font-extrabold">{filmCount}</div>
            <div className="mt-0.5 text-[11.5px] text-text-faint">Films</div>
          </div>
          <div className="flex-1">
            <div className="font-display text-xl font-extrabold">{seriesCount}</div>
            <div className="mt-0.5 text-[11.5px] text-text-faint">Entrées séries</div>
          </div>
          <div className="flex-1">
            <div className="font-display text-xl font-extrabold text-accent">
              {formatRating(avgGiven)}
            </div>
            <div className="mt-0.5 text-[11.5px] text-text-faint">Note moy.</div>
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-5">
          <SignOutButton />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-border bg-bg-elev p-7">
          <h3 className="mb-5 text-[15.5px] font-bold">Mon profil</h3>
          <ProfileEditForm displayName={displayName} avatarColor={avatarColor} />
        </div>

        <div className="rounded-2xl border border-border bg-bg-elev p-7">
          <h3 className="mb-1 text-[15.5px] font-bold">Mon top 3</h3>
          <p className="mb-5 text-[13px] text-text-faint">
            Choisis tes 3 films et tes 3 séries préférés parmi ce que tu as déjà vu.
          </p>
          <TopPicksEditor entries={entries} picks={myPicks ?? []} />
        </div>

        <div className="rounded-2xl border border-border bg-bg-elev p-7">
          <h3 className="mb-5 text-[15.5px] font-bold">Sécurité</h3>
          <PasswordForm />
        </div>
      </div>
    </div>
  );
}
