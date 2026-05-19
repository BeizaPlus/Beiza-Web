type MiniTreePreviewProps = {
  memberCount: number;
  className?: string;
};

/** Minimal SVG tree silhouette for public directory cards. */
export function MiniTreePreview({ memberCount, className }: MiniTreePreviewProps) {
  const nodes = Math.min(Math.max(memberCount, 3), 8);

  return (
    <svg
      viewBox="0 0 120 80"
      className={className}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1="60" y1="72" x2="60" y2="42" stroke="#2a2a2a" strokeWidth="1.5" />
      <line x1="60" y1="48" x2="30" y2="58" stroke="#2a2a2a" strokeWidth="1.2" />
      <line x1="60" y1="48" x2="90" y2="58" stroke="#2a2a2a" strokeWidth="1.2" />
      {Array.from({ length: nodes }).map((_, i) => {
        const angle = (i / nodes) * Math.PI * 2;
        const cx = 60 + Math.cos(angle) * (18 + (i % 3) * 8);
        const cy = 28 + Math.sin(angle) * 12 + (i % 2) * 6;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={i === 0 ? 5 : 4}
            fill={i === 0 ? "#E6A817" : "#333333"}
            stroke="#1a1a1a"
            strokeWidth="0.5"
          />
        );
      })}
    </svg>
  );
}
