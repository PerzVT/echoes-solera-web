const paths = {
  warning: <path d="M12 4.5L3.5 19h17zM12 10v4M12 16.8v.2" />,
  dot: <circle cx="12" cy="12" r="2.5" />,
  file: <path d="M6 3h8l4 4v14H6zM14 3v4h4" />,
} as const;

export type AppIconName = keyof typeof paths;

/** The three glyphs only the creator uses, on the brand icon grid (24px, 1.75 stroke, round caps). Every other icon comes from components/labs/Icon.tsx or its moving versions in components/labs/fx. */
export function AppIcon({ name, size = 20, className }: { name: AppIconName; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      data-icon={name}
    >
      {paths[name]}
    </svg>
  );
}
