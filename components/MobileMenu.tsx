"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  FilmIcon,
  TvIcon,
  BookmarkIcon,
  TrophyIcon,
  LogInIcon,
  MenuIcon,
  CloseIcon,
} from "./icons";
import { initials, avatarColor as hashAvatarColor } from "@/lib/avatar-color";

const LINKS = [
  { href: "/", label: "Derniers visionnages", icon: HomeIcon },
  { href: "/films", label: "Films", icon: FilmIcon },
  { href: "/series", label: "Séries", icon: TvIcon },
  { href: "/watchlist", label: "À voir", icon: BookmarkIcon },
  { href: "/tops", label: "Tops", icon: TrophyIcon },
];

export function MobileMenu({
  displayName,
  avatarColor,
}: {
  displayName: string | null;
  avatarColor: string | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
        className="fixed left-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-border-strong bg-bg-elev-2 text-text-muted"
      >
        <MenuIcon className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-30" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <aside
            className="absolute inset-y-0 left-0 flex w-[260px] flex-col border-r border-border bg-bg px-4 py-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 px-2">
              <span className="text-xl leading-none">🎬</span>
              <span className="font-display text-[17px] font-extrabold tracking-tight">
                LetterFox
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer le menu"
                className="ml-auto flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-bg-elev-2 text-text-muted"
              >
                <CloseIcon className="h-3.5 w-3.5" />
              </button>
            </div>

            <nav className="mt-8 flex flex-col gap-1">
              {LINKS.map((link) => {
                const active =
                  link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-[14px] font-semibold ${
                      active
                        ? "border-border-strong bg-bg-elev text-text"
                        : "border-transparent text-text-muted"
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
                    : "border-transparent text-text-muted"
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
              © {new Date().getFullYear()} · made by{" "}
              <span className="footer-brand">Skalrow</span>
            </footer>
          </aside>
        </div>
      )}
    </div>
  );
}
