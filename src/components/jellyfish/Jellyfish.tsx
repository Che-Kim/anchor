export type JellyMood = "idle" | "happy" | "thinking" | "sleepy";

// Hang from the low point of each scallop so they read as part of the bell.
const TENTACLES = [
  { d: "M23,55 q7,9 0,17 q-7,7 -1,13", w: 3, delay: "0s" },
  { d: "M41,56 q-7,11 0,20 q7,9 1,16", w: 3.5, delay: "0.45s" },
  { d: "M59,56 q7,11 0,20 q-7,9 -1,15", w: 3.5, delay: "0.9s" },
  { d: "M77,55 q-7,9 0,17 q7,7 1,12", w: 3, delay: "0.25s" },
];

/** Simple line-drawn jellyfish — rounded bell, scalloped hem, short curling
 *  tentacles. Stroke only, so it inherits currentColor. */
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
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={`drift ${className}`}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {TENTACLES.map((t) => (
          <path
            key={t.d}
            className="sway"
            style={{ animationDelay: t.delay }}
            d={t.d}
            strokeWidth={t.w}
          />
        ))}

        {/* bell: dome + scalloped hem, filled so tentacles tuck behind it */}
        <path
          d="M14,50 C14,14 86,14 86,50 q-9,9 -18,0 q-9,9 -18,0 q-9,9 -18,0 q-9,9 -18,0 Z"
          strokeWidth={3.5}
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
      <g stroke={ink} strokeWidth={3} strokeLinecap="round" fill="none">
        <path d="M35,36 q4,-5 8,0" />
        <path d="M57,36 q4,-5 8,0" />
        <path d="M44,43 q6,5 12,0" strokeWidth={2.6} />
      </g>
    );
  }

  if (mood === "sleepy") {
    return (
      <g stroke={ink} strokeWidth={3} strokeLinecap="round" fill="none">
        <path d="M35,38 q4,4 8,0" />
        <path d="M57,38 q4,4 8,0" />
      </g>
    );
  }

  if (mood === "thinking") {
    return (
      <g fill={ink}>
        <circle cx="39" cy="37" r="3" />
        <circle cx="61" cy="37" r="3" />
        <path
          d="M45,45 h10"
          stroke={ink}
          strokeWidth={2.6}
          strokeLinecap="round"
        />
      </g>
    );
  }

  return (
    <g fill={ink}>
      <circle cx="39" cy="37" r="3.2" />
      <circle cx="61" cy="37" r="3.2" />
      <path
        d="M44,44 q6,4 12,0"
        stroke={ink}
        strokeWidth={2.6}
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}

/** Wordmark glyph — same shape, simplified for small sizes. */
export function JellyMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3,12 C3,5.5 21,5.5 21,12 q-2.25,2.2 -4.5,0 q-2.25,2.2 -4.5,0 q-2.25,2.2 -4.5,0 q-2.25,2.2 -4.5,0 Z" />
      <path d="M7.5,14 q1.8,2.4 0,4.6" />
      <path d="M12,14.5 q-1.8,2.6 0,5" />
      <path d="M16.5,14 q1.8,2.4 0,4.6" />
    </svg>
  );
}
