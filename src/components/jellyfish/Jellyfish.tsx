export type JellyMood = "idle" | "happy" | "thinking" | "sleepy";

const TENTACLES = [
  { x: 26, d: "M26,58 C24,66 28,71 25,81 C23,89 27,93 25,99", w: 1, delay: "0s" },
  { x: 38, d: "M38,62 C36,72 40,78 37,87 C35,96 39,99 37,105", w: 1.25, delay: "0.5s" },
  { x: 50, d: "M50,64 C48,75 53,81 50,92 C48,100 51,104 49,110", w: 1, delay: "1s" },
  { x: 62, d: "M62,64 C64,75 59,81 62,92 C64,100 61,104 63,108", w: 1.25, delay: "0.3s" },
  { x: 74, d: "M74,62 C76,72 72,78 75,87 C77,94 74,98 75,103", w: 1, delay: "0.8s" },
  { x: 86, d: "M86,58 C88,66 84,71 87,81 C88,88 85,92 87,98", w: 1, delay: "0.15s" },
];

/** Engraved-plate jellyfish. Stroke only — inherits currentColor. */
export function Jellyfish({
  size = 120,
  mood = "idle",
  className = "",
}: {
  size?: number;
  mood?: JellyMood;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size * 1.1}
      viewBox="0 0 112 124"
      fill="none"
      className={`drift ${className}`}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {TENTACLES.map((t) => (
          <path
            key={t.x}
            className="sway"
            style={{ animationDelay: t.delay }}
            d={t.d}
            strokeWidth={t.w}
            opacity={0.55}
          />
        ))}

        {/* bell — widened to give the face more room */}
        <path
          d="M2,54 C2,22 110,22 110,54 C110,60 104,64 99,60 C92,55 85,63 78,59 C72,55 64,63 56,59 C48,55 40,63 32,59 C27,55 20,60 13,60 C8,64 2,60 2,54 Z"
          strokeWidth={1.75}
          fill="var(--paper)"
        />
      </g>

      <Face mood={mood} />
    </svg>
  );
}

function Face({ mood }: { mood: JellyMood }) {
  const ink = "currentColor";

  if (mood === "happy") {
    return (
      <g stroke={ink} strokeWidth={1.75} strokeLinecap="round" fill="none">
        <path d="M40,37 q4,-4.5 8,0" />
        <path d="M64,37 q4,-4.5 8,0" />
      </g>
    );
  }
  if (mood === "sleepy") {
    return (
      <g stroke={ink} strokeWidth={1.75} strokeLinecap="round" fill="none">
        <path d="M40,39 q4,4 8,0" />
        <path d="M64,39 q4,4 8,0" />
      </g>
    );
  }
  if (mood === "thinking") {
    return (
      <g fill={ink}>
        <circle cx="44" cy="38" r="2" />
        <circle cx="68" cy="38" r="2" />
        <path
          d="M49,46 h11"
          stroke={ink}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </g>
    );
  }

  return (
    <g fill={ink}>
      <ellipse cx="49" cy="49" rx="3.6" ry="4.2" />
      <ellipse cx="72" cy="49" rx="3.6" ry="4.2" />
      <circle cx="50.3" cy="47.5" r="1.3" fill="white" />
      <circle cx="73.3" cy="47.5" r="1.3" fill="white" />
      <path
        d="M55,58 q6,4 11,0"
        stroke={ink}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}

/** Wordmark glyph — same idea, simplified for small sizes. */
export function JellyMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M2.5,11 C2.5,5 21.5,5 21.5,11 C21.5,12.4 20.2,13.2 19,12.2 C17.6,11 16.2,12.8 14.8,11.8 C13.4,10.8 11.8,12.6 10.2,11.6 C8.8,10.8 7.2,12.4 5.8,12.2 C4.4,13.2 2.5,12.4 2.5,11 Z" />
      <path d="M8,13 C7.4,16 9,17.5 8,21" />
      <path d="M12,13.5 C11.6,17 13,18.5 12,22" />
      <path d="M16,13 C16.6,16 15,17.5 16,21" />
    </svg>
  );
}
