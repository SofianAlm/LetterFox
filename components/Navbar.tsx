"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FoxLogo } from "./FoxLogo";
import { initials, avatarColor } from "@/lib/avatar-color";

const LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/films", label: "Films" },
  { href: "/series", label: "Séries" },
];

export function Navbar({ displayName }: { displayName: string }) {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-border bg-bg/90 px-6 backdrop-blur sm:px-10">
      <Link href="/" className="flex items-center gap-2.5">
        <FoxLogo className="h-[26px] w-[26px]" />
        <span className="font-display text-[19px] font-extrabold tracking-tight">LetterFox</span>
      </Link>
      <div className="hidden items-center gap-1 md:flex">
        {LINKS.map((link) => {
          const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                active ? "bg-bg-elev-2 text-text" : "text-text-muted"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
      <Link
        href="/profile"
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full font-display text-[13px] font-extrabold text-[oklch(20%_0.03_0)]"
        style={{ background: avatarColor(displayName) }}
      >
        {initials(displayName)}
      </Link>
    </div>
  );
}
