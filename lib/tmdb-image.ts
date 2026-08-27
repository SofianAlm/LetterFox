// Pure helper, safe to import from both Server and Client Components.
export function posterUrl(
  path: string | null,
  size: "w92" | "w154" | "w342" | "w500" = "w154",
): string | null {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
