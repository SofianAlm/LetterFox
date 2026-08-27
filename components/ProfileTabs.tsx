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
    <div className="mb-8 -mx-6 overflow-x-auto px-6 sm:-mx-10 sm:px-10">
      <div className="inline-flex gap-1 rounded-full border border-border bg-bg-elev-2 p-1">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-bold ${
                active ? "bg-accent text-on-accent" : "text-text-muted"
              }`}
            >
              <Icon className="h-[15px] w-[15px]" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
