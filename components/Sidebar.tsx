"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, FilmIcon, TvIcon, BookmarkIcon, TrophyIcon, LogInIcon } from "./icons";
import { initials, avatarColor as hashAvatarColor } from "@/lib/avatar-color";
import { VERSION } from "@/lib/version";

const LINKS = [
  { href: "/", label: "Derniers visionnages", icon: HomeIcon },
  { href: "/films", label: "Films", icon: FilmIcon },
  { href: "/series", label: "Séries", icon: TvIcon },
  { href: "/watchlist", label: "À voir", icon: BookmarkIcon },
  { href: "/tops", label: "Tops", icon: TrophyIcon },
];

export function Sidebar({
  displayName,
  avatarColor,
}: {
  displayName: string | null;
  avatarColor: string | null;
}) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-[232px] flex-col border-r border-border bg-bg px-4 py-6 md:flex">
      <div className="flex items-center gap-2 px-2">
        <Link href="/" className="flex min-w-0 flex-1 items-center gap-2">
          <span className="text-xl leading-none">🎬</span>
          <span className="font-display text-[17px] font-extrabold tracking-tight">LetterFox</span>
        </Link>
        <span className="flex-shrink-0 rounded-full bg-bg-elev-2 px-2 py-0.5 text-[10px] font-bold text-text-faint">
          {VERSION}
        </span>
      </div>

      <nav className="mt-8 flex flex-col gap-1">
        {LINKS.map((link) => {
          const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-[14px] font-semibold ${
                active
                  ? "border-border-strong bg-bg-elev text-text"
                  : "border-transparent text-text-muted hover:text-text"
              }`}
            >
              <Icon className="h-[18px] w-[18px] flex-shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      {displayName ? (
        <Link
          href="/profile"
          className={`flex items-center gap-2.5 rounded-lg border px-2.5 py-2.5 text-[13.5px] font-semibold ${
            pathname.startsWith("/profile")
              ? "border-border-strong bg-bg-elev text-text"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          <span
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full font-display text-[11px] font-extrabold text-[oklch(20%_0.03_0)]"
            style={{ background: avatarColor ?? hashAvatarColor(displayName) }}
          >
            {initials(displayName)}
          </span>
          <span className="truncate">{displayName}</span>
        </Link>
      ) : (
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2.5 text-[13.5px] font-bold text-on-accent"
        >
          <LogInIcon className="h-[16px] w-[16px]" />
          Se connecter
        </Link>
      )}

      <footer className="site-footer mt-4 px-2">
        © {new Date().getFullYear()} · made by <span className="footer-brand">Skalrow</span>
      </footer>
    </aside>
  );
}
