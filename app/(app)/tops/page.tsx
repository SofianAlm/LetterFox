import { redirect } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { initials, avatarColor as hashAvatarColor } from "@/lib/avatar-color";
import { posterUrl } from "@/lib/tmdb-image";
import type { Tables } from "@/lib/database.types";

type Profile = { id: string; display_name: string; avatar_color: string | null };
type Pick = Tables<"top_picks">;

function PickSlot({ pick, rank }: { pick: Pick | undefined; rank: number }) {
  const poster = pick ? posterUrl(pick.poster_path, "w154") : null;
  return (
    <div>
      <div className="relative aspect-[2/3] overflow-hidden rounded-[10px] bg-bg-elev-2 shadow-lg">
        {poster ? (
          <Image src={poster} alt="" fill sizes="160px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-faint">
            <span className="font-display text-lg font-extrabold">#{rank}</span>
          </div>
        )}
      </div>
      {pick && (
        <h4 className="mt-2 line-clamp-2 text-[12px] font-bold leading-tight">{pick.title}</h4>
      )}
    </div>
  );
}

function PersonCard({ profile, picks }: { profile: Profile; picks: Pick[] }) {
  const moviePicks = picks.filter((p) => p.media_type === "movie").sort((a, b) => a.rank - b.rank);
  const seriesPicks = picks.filter((p) => p.media_type === "tv").sort((a, b) => a.rank - b.rank);

  return (
    <div className="rounded-2xl border border-border bg-bg-elev p-7">
      <div className="mb-6 flex items-center gap-3">
        <span
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full font-display text-[13px] font-extrabold text-[oklch(20%_0.03_0)]"
          style={{ background: profile.avatar_color ?? hashAvatarColor(profile.display_name) }}
        >
          {initials(profile.display_name)}
        </span>
        <h2 className="text-[16px] font-bold">{profile.display_name}</h2>
      </div>

      {moviePicks.length === 0 && seriesPicks.length === 0 ? (
        <p className="text-sm text-text-faint">Pas encore de top 3.</p>
      ) : (
        <div className="flex flex-col gap-6">
          <div>
            <p className="mb-3 text-[12.5px] font-bold uppercase tracking-wide text-blue">
              Films
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((rank) => (
                <PickSlot key={rank} rank={rank} pick={moviePicks.find((p) => p.rank === rank)} />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-[12.5px] font-bold uppercase tracking-wide text-purple">
              Séries
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((rank) => (
                <PickSlot key={rank} rank={rank} pick={seriesPicks.find((p) => p.rank === rank)} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default async function TopsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profiles }, { data: picks }] = await Promise.all([
    supabase.from("profiles").select("id, display_name, avatar_color").order("display_name"),
    supabase.from("top_picks").select("*").returns<Pick[]>(),
  ]);

  return (
    <div className="mx-auto max-w-[1240px] px-6 pb-24 pt-10 sm:px-10">
      <h1 className="mb-8 font-display text-[28px] font-bold">Tops</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {(profiles ?? []).map((profile) => (
          <PersonCard
            key={profile.id}
            profile={profile}
            picks={(picks ?? []).filter((p) => p.user_id === profile.id)}
          />
        ))}
      </div>
    </div>
  );
}
