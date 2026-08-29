"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserIcon, FilmIcon, TvIcon, ShieldIcon } from "./icons";

export function ProfileTabs({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const tabs = [
    { href: "/profile", label: "Mon profil", icon: UserIcon },
    { href: "/profile/films", label: "Mes films", icon: FilmIcon },
    { href: "/profile/series", label: "Mes séries", icon: TvIcon },
    ...(isAdmin ? [{ href: "/profile/admin", label: "Admin", icon: ShieldIcon }] : []),
  ];

  return (
    <div className="mb-8 grid grid-cols-2 gap-1.5 rounded-2xl border border-border bg-bg-elev-2 p-1.5 sm:flex sm:w-fit sm:gap-1 sm:rounded-full sm:p-1">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[12.5px] font-bold sm:flex-shrink-0 sm:justify-start sm:rounded-full sm:px-4 sm:py-2 sm:text-[13px] ${
              active ? "bg-accent text-on-accent" : "text-text-muted"
            }`}
          >
            <Icon className="h-[15px] w-[15px] flex-shrink-0" />
            <span className="truncate">{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
