export default function BatikPattern({
  className = "",
  opacity = 0.08,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <svg
      className={className}
      style={{ opacity }}
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="parang"
          width="60"
          height="60"
          patternTransform="rotate(45)"
          patternUnits="userSpaceOnUse"
        >
          <rect width="60" height="60" fill="transparent" />
          <path
            d="M0 30 Q15 10 30 30 T60 30"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
          />
          <circle cx="0" cy="30" r="3" fill="currentColor" />
          <circle cx="30" cy="30" r="3" fill="currentColor" />
          <circle cx="60" cy="30" r="3" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#parang)" />
    </svg>
  );
}
