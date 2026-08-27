// Hues reserved for content type (film = 250, série = 292) are excluded on
// purpose so a person's avatar is never confused with a rating pill's color.
export const AVATAR_HUES = [45, 165, 20, 95, 340, 130, 10, 200] as const;

export const AVATAR_SWATCHES = AVATAR_HUES.map((hue) => `oklch(78% 0.13 ${hue})`);

export function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const hue = AVATAR_HUES[hash % AVATAR_HUES.length];
  return `oklch(78% 0.13 ${hue})`;
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
