/** The coin mark, drawn in the same 1.75 stroke as the shared icon set. */
export function Coin({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5.5" opacity={0.55} />
      <path d="M12 9.5v5" />
    </svg>
  );
}

export const coins = (n: number) => `${n} ${n === 1 ? "coin" : "coins"}`;
