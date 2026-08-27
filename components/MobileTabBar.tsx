"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Accueil" },
  { href: "/films", label: "Films" },
  { href: "/series", label: "Séries" },
  { href: "/profile", label: "Profil" },
];

export function MobileTabBar() {
  const pathname = usePathname();
  return (
    <div className="fixed inset-x-0 bottom-0 z-10 flex border-t border-border bg-bg/95 px-2 pb-3.5 pt-2.5 backdrop-blur md:hidden">
      {TABS.map((tab) => {
        const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-1 flex-col items-center gap-1 text-[10.5px] font-bold ${
              active ? "text-purple" : "text-text-faint"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
