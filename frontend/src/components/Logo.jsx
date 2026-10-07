export default function Logo({ size = 32, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="AI Learner logo"
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#logo-gradient)" />
      <path d="M24 19 L47 32 L24 45 Z" fill="#ffffff" />
      <path
        d="M49 11 L51.4 17.1 57.5 19.5 51.4 21.9 49 28 46.6 21.9 40.5 19.5 46.6 17.1 Z"
        fill="#ffffff"
        fillOpacity="0.9"
      />
    </svg>
  );
}
