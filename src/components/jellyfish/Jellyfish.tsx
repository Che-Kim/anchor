export type JellyMood = "idle" | "happy" | "thinking" | "sleepy";

const TENTACLES = [
  { x: 26, d: "M26,58 C24,66 28,71 25,81 C23,89 27,93 25,99", w: 1, delay: "0s" },
  { x: 41, d: "M41,62 C39,72 43,78 40,87 C38,96 42,99 40,105", w: 1.25, delay: "0.5s" },
  { x: 56, d: "M56,64 C54,75 59,81 56,92 C54,100 57,104 55,110", w: 1, delay: "1s" },
  { x: 71, d: "M71,62 C73,72 69,78 72,87 C74,94 71,98 72,103", w: 1.25, delay: "0.3s" },
  { x: 86, d: "M86,58 C88,66 84,71 87,81 C88,88 85,92 87,98", w: 1, delay: "0.8s" },
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

        {/* bell — ~15% bigger than the tentacles were sized for */}
        <path
          d="M12,50 C12,-13 100,-13 100,50 C100,57 95,62 91,57 C85,51 79,60 73,56 C69,51 62,60 56,56 C50,51 45,60 39,56 C35,51 30,57 25,57 C22,62 17,57 12,50 Z"
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
        <path d="M40,24 q4,-4.5 8,0" />
        <path d="M64,24 q4,-4.5 8,0" />
      </g>
    );
  }
  if (mood === "sleepy") {
    return (
      <g stroke={ink} strokeWidth={1.75} strokeLinecap="round" fill="none">
        <path d="M40,26 q4,4 8,0" />
        <path d="M64,26 q4,4 8,0" />
      </g>
    );
  }
  if (mood === "thinking") {
    return (
      <g fill={ink}>
        <circle cx="44" cy="25" r="2" />
        <circle cx="68" cy="25" r="2" />
        <path
          d="M49,33 h11"
          stroke={ink}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </g>
    );
  }

  return (
    <g fill={ink}>
      <ellipse cx="44" cy="26" rx="3.6" ry="4.2" />
      <ellipse cx="68" cy="26" rx="3.6" ry="4.2" />
      <circle cx="45.3" cy="24.5" r="1.3" fill="white" />
      <circle cx="69.3" cy="24.5" r="1.3" fill="white" />
      <path
        d="M50,35 q6,4 11,0"
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
