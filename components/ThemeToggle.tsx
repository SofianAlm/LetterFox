"use client";

import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "./icons";

const STORAGE_KEY = "letterfox-theme";

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<"dark" | "light" | null>(null);
  const isLight = theme === "light";

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "light" ? "light" : "dark");
  }, []);

  function toggle() {
    const next = isLight ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage unavailable — theme just won't persist across visits.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={isLight}
      aria-label="Changer de thème"
      className={`relative flex items-center justify-between rounded-full border border-border-strong bg-bg-elev-2 px-[7px] ${className ?? "h-8 w-14"}`}
    >
      <MoonIcon className="h-3.5 w-3.5 flex-shrink-0 text-text-faint" />
      <SunIcon className="h-3.5 w-3.5 flex-shrink-0 text-text-faint" />
      <span
        className={`absolute top-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-on-accent shadow transition-[left] duration-200 ease-out ${
          isLight ? "left-[calc(100%-27px)]" : "left-[3px]"
        }`}
      >
        {isLight ? <SunIcon className="h-3.5 w-3.5" /> : <MoonIcon className="h-3.5 w-3.5" />}
      </span>
    </button>
  );
}
