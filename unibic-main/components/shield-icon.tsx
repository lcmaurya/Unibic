export function ShieldIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="47"
      height="47"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Shield shape - rounded top, pointed bottom */}
      <path
        d="M16 3L6 7.5V14C6 21 10.5 27.5 16 29C21.5 27.5 26 21 26 14V7.5L16 3Z"
        fill="url(#shieldGradient)"
        stroke="#C9A24D"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />

      {/* Glossy highlight for premium finish */}
      <path
        d="M16 3L6 7.5V14C6 17 7.2 20 9.5 22.5C11 21 13 18.5 14.5 15.5L16 3Z"
        fill="url(#glossHighlight)"
        opacity="0.25"
      />

      {/* White checkmark centered inside shield */}
      <path
        d="M12 16L14.5 18.5L20 12"
        stroke="white"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      <defs>
        <linearGradient id="shieldGradient" x1="16" y1="3" x2="16" y2="29" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E7F43" />
          <stop offset="100%" stopColor="#166534" />
        </linearGradient>
        <linearGradient id="glossHighlight" x1="10" y1="3" x2="10" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}
