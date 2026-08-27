"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, FilmIcon, TvIcon, BookmarkIcon, UserIcon, LogInIcon } from "./icons";

export function MobileTabBar({ displayName }: { displayName: string | null }) {
  const pathname = usePathname();

  const tabs = [
    { href: "/", label: "Accueil", icon: HomeIcon },
    { href: "/films", label: "Films", icon: FilmIcon },
    { href: "/series", label: "Séries", icon: TvIcon },
    { href: "/watchlist", label: "À voir", icon: BookmarkIcon },
    displayName
      ? { href: "/profile", label: "Profil", icon: UserIcon }
      : { href: "/login", label: "Connexion", icon: LogInIcon },
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 z-10 flex border-t border-border bg-bg/95 px-1 pb-3.5 pt-2.5 backdrop-blur md:hidden">
      {tabs.map((tab) => {
        const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-1 flex-col items-center gap-1 text-[9.5px] font-bold ${
              active ? "text-purple" : "text-text-faint"
            }`}
          >
            <Icon className="h-[18px] w-[18px]" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
