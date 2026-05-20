/** Beiza mark — Circle directory cards only. Path coordinates are locked; do not edit. */
type BeizaCircleMarkProps = {
  size?: number;
  className?: string;
};

export function BeizaCircleMark({ size = 20, className }: BeizaCircleMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      aria-hidden
      className={className}
    >
      <rect width="512" height="512" fill="#080808" />
      <path
        d="M 365.2,256.0 A 109.2,109.2 0 1,1 289.8,152.1"
        fill="none"
        stroke="#E6A817"
        strokeWidth="56.3"
        strokeLinecap="round"
      />
      <circle cx="365.0" cy="173.8" r="27.3" fill="#E6A817" />
    </svg>
  );
}
