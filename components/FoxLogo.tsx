export function FoxLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
      <path d="M4 6 L11 13 L11 4 Z" fill="var(--color-purple)" />
      <path d="M24 6 L17 13 L17 4 Z" fill="var(--color-purple)" />
      <path
        d="M14 10c6 0 9 5 9 9 0 4.5-4.5 6-9 6s-9-1.5-9-6c0-4 3-9 9-9Z"
        fill="var(--color-purple)"
      />
      <circle cx="10.5" cy="18" r="1.3" fill="var(--color-bg)" />
      <circle cx="17.5" cy="18" r="1.3" fill="var(--color-bg)" />
      <path d="M12.5 21 14 22.6 15.5 21Z" fill="var(--color-bg)" />
    </svg>
  );
}
