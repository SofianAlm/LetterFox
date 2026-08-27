"use client";

import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "./icons";

const STORAGE_KEY = "letterfox-theme";

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<"dark" | "light" | null>(null);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "light" ? "light" : "dark");
  }, []);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
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
      aria-label="Changer de thème"
      className={`flex items-center justify-center rounded-lg border border-border-strong bg-bg-elev-2 text-text-muted hover:text-text ${className ?? "h-9 w-9"}`}
    >
      {theme === "light" ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
    </button>
  );
}
