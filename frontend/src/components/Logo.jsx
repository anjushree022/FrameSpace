
export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="38" height="38" viewBox="0 0 32 32" aria-hidden="true">
        <rect
          width="32"
          height="32"
          rx="9"
          fill="rgb(var(--logo-accent))"
        />
        <path
          d="M9 14V9h5M18 9h5v5M23 18v5h-5M14 23H9v-5"
          fill="none"
          stroke="rgb(var(--paper))"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <span className="text-[1.35rem] font-semibold tracking-tight text-ink">
        FrameSpace
      </span>
    </span>
  );
}
