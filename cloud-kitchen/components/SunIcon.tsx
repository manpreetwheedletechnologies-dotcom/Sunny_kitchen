export default function SunIcon({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <g stroke="#F6B93B" strokeWidth="5" strokeLinecap="round">
        <line x1="50" y1="2" x2="50" y2="14" />
        <line x1="50" y1="86" x2="50" y2="98" />
        <line x1="2" y1="50" x2="14" y2="50" />
        <line x1="86" y1="50" x2="98" y2="50" />
        <line x1="16" y1="16" x2="24" y2="24" />
        <line x1="76" y1="76" x2="84" y2="84" />
        <line x1="84" y1="16" x2="76" y2="24" />
        <line x1="24" y1="76" x2="16" y2="84" />
      </g>
      <circle cx="50" cy="50" r="26" fill="#F6B93B" />
      <circle cx="41" cy="45" r="3.2" fill="#1E4B36" />
      <circle cx="59" cy="45" r="3.2" fill="#1E4B36" />
      <path
        d="M39 57 Q50 66 61 57"
        fill="none"
        stroke="#1E4B36"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
