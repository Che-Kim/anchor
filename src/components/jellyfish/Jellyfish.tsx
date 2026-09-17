export type JellyMood = "idle" | "happy" | "thinking" | "sleepy";

const TENTACLES = [
  { x: 26, d: "M26,58 C22,72 30,80 25,96 C21,110 27,116 24,126", w: 1, delay: "0s" },
  { x: 38, d: "M38,62 C34,78 42,88 37,104 C33,118 39,124 36,134", w: 1.25, delay: "0.5s" },
  { x: 50, d: "M50,64 C47,82 55,92 50,110 C46,124 51,130 49,140", w: 1, delay: "1s" },
  { x: 62, d: "M62,64 C65,82 57,92 62,110 C66,124 61,130 63,138", w: 1.25, delay: "0.3s" },
  { x: 74, d: "M74,62 C78,78 70,88 75,104 C79,116 74,122 76,130", w: 1, delay: "0.8s" },
  { x: 86, d: "M86,58 C90,72 82,80 87,96 C90,108 85,114 87,124", w: 1, delay: "0.15s" },
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
      height={size * 1.2}
      viewBox="0 0 112 146"
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

        {/* oral arms — shorter, denser */}
        <path d="M44,58 C42,70 47,76 44,86" strokeWidth={2} opacity={0.75} />
        <path d="M56,60 C55,72 58,78 56,90" strokeWidth={2} opacity={0.75} />
        <path d="M68,58 C70,70 65,76 68,86" strokeWidth={2} opacity={0.75} />

        {/* bell */}
        <path
          d="M8,54 C8,22 104,22 104,54 C104,60 99,64 94,60 C88,55 82,63 76,59 C70,55 63,63 56,59 C49,55 42,63 35,59 C30,55 24,60 18,60 C13,64 8,60 8,54 Z"
          strokeWidth={1.75}
          fill="var(--paper)"
        />

        {/* engraving hatch — kept clear of the dome, which peaks at y=30 */}
        <g strokeWidth={0.75} opacity={0.4}>
          <path d="M24,51 C25,45 27,42 30,40" />
          <path d="M36,52 C36,44 37,39 40,36" />
          <path d="M56,52 L56,34" />
          <path d="M76,52 C76,44 75,39 72,36" />
          <path d="M88,51 C87,45 85,42 82,40" />
        </g>

        <path d="M8,54 C8,22 104,22 104,54" strokeWidth={1.75} />
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
        <path d="M42,44 q3.5,-4.5 7,0" />
        <path d="M63,44 q3.5,-4.5 7,0" />
      </g>
    );
  }
  if (mood === "sleepy") {
    return (
      <g stroke={ink} strokeWidth={1.75} strokeLinecap="round" fill="none">
        <path d="M42,46 q3.5,4 7,0" />
        <path d="M63,46 q3.5,4 7,0" />
      </g>
    );
  }
  if (mood === "thinking") {
    return (
      <g fill={ink}>
        <circle cx="45.5" cy="45" r="2" />
        <circle cx="66.5" cy="45" r="2" />
        <path
          d="M50,53 h10"
          stroke={ink}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </g>
    );
  }

  return (
    <g fill={ink}>
      <ellipse cx="50" cy="56" rx="3.6" ry="4.2" />
      <ellipse cx="70" cy="56" rx="3.6" ry="4.2" />
      <circle cx="51.3" cy="54.5" r="1.3" fill="white" />
      <circle cx="71.3" cy="54.5" r="1.3" fill="white" />
      <path
        d="M55,65 q5,4 10,0"
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
