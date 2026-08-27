import { LoginForm } from "@/components/LoginForm";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      <ThemeToggle className="fixed right-5 top-5 z-20 h-8 w-14" />
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden border-r border-border bg-bg-elev p-14 lg:flex">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 100% at 15% 10%, oklch(40% 0.1 292 / 0.32), transparent 55%), radial-gradient(90% 90% at 85% 90%, oklch(38% 0.1 250 / 0.28), transparent 55%)",
          }}
        />
        <div className="relative flex items-center gap-2.5">
          <span className="text-2xl leading-none">🎬</span>
          <span className="font-display text-xl font-extrabold">LetterFox</span>
        </div>
        <div className="relative max-w-md">
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight">
            Le ciné-club
            <br />
            privé de la bande.
          </h1>
        </div>
        <div className="relative text-sm text-text-faint">© 2026 LetterFox — accès privé</div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="text-xl leading-none">🎬</span>
            <span className="font-display text-lg font-extrabold">LetterFox</span>
          </div>
          <div className="mb-5 text-xs font-extrabold uppercase tracking-wide text-text-faint">
            Connexion
          </div>
          <LoginForm />
          <p className="mt-7 text-center text-xs text-text-faint">
            Accès privé — sur invitation uniquement.
          </p>
        </div>
      </div>
    </div>
  );
}
