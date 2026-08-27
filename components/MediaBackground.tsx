"use client";

import { useEffect } from "react";

export type MediaContext = "movie" | "tv" | "all";

export function useMediaBackground(media: MediaContext) {
  useEffect(() => {
    const root = document.documentElement;
    if (media === "tv") root.setAttribute("data-media", "tv");
    else root.removeAttribute("data-media");
    return () => root.removeAttribute("data-media");
  }, [media]);
}

export function MediaBackground({ media }: { media: MediaContext }) {
  useMediaBackground(media);
  return null;
}
