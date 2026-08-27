import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateAccountForm } from "@/components/CreateAccountForm";
import { BackfillGenresButton } from "@/components/BackfillGenresButton";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profileRows } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .limit(1)
    .returns<{ is_admin: boolean }[]>();
  if (!profileRows?.[0]?.is_admin) redirect("/profile");

  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("display_name, is_admin")
    .order("display_name")
    .returns<{ display_name: string; is_admin: boolean }[]>();

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-border bg-bg-elev p-7">
        <h3 className="mb-1 text-[15.5px] font-bold">Catégories des films &amp; séries</h3>
        <p className="mb-5 text-[13px] text-text-faint">
          Récupère la catégorie (comédie, thriller…) sur TMDB pour tous les films et séries déjà
          ajoutés qui n&rsquo;en ont pas encore.
        </p>
        <BackfillGenresButton />
      </div>

      <div className="rounded-2xl border border-border bg-bg-elev p-7">
        <h3 className="mb-1 text-[15.5px] font-bold">Créer un compte</h3>
        <p className="mb-5 text-[13px] text-text-faint">
          Crée un compte pour un nouveau membre de la bande — il pourra changer son mot de passe
          ensuite depuis son profil.
        </p>
        <CreateAccountForm />
      </div>

      {allProfiles && allProfiles.length > 0 && (
        <div className="rounded-2xl border border-border bg-bg-elev p-7">
          <h3 className="mb-4 text-[15.5px] font-bold">Comptes existants</h3>
          <div className="flex flex-wrap gap-2">
            {allProfiles.map((p) => (
              <span
                key={p.display_name}
                className="rounded-full bg-bg-elev-2 px-3.5 py-1.5 text-xs font-semibold text-text-muted"
              >
                {p.display_name}
                {p.is_admin && <span className="ml-1.5 text-accent">· admin</span>}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
