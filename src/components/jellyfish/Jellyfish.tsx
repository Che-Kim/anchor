export type JellyMood = "idle" | "happy" | "thinking" | "sleepy";

const STROKE = 2.25;

/** Dome + hem only — no fill, so the face floats in open space. Static;
 *  the tentacles below are what sway. */
const DOME_PATH =
  "M50,8" +
  "C30,8 10,18 10,42" +
  "C25,49 75,49 90,42" +
  "C90,18 70,8 50,8" +
  "Z";

/**
 * Each tentacle is a single curving stroke — not a loop — so a round
 * linecap gives it a soft, rounded tip instead of meeting itself in a
 * point. They start exactly on the dome's hem so the whole figure still
 * reads as one continuous drawing at rest; the seam is what lets each
 * one sway independently.
 */
const TENTACLES = [
  { d: "M25,44 C17,53 11,60 14,70 C16,77 19,79 16,85", delay: "0s" },
  { d: "M50,46 C46,56 54,64 50,74 C47,80 53,83 50,89", delay: "0.5s" },
  { d: "M75,44 C83,53 89,60 86,70 C84,77 81,79 84,85", delay: "0.25s" },
];

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
      <path
        d={DOME_PATH}
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {TENTACLES.map((t) => (
        <path
          key={t.d}
          className="sway"
          style={{ animationDelay: t.delay }}
          d={t.d}
          stroke="currentColor"
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
        />
      ))}
      <Face mood={mood} />
    </svg>
  );
}

function Face({ mood }: { mood: JellyMood }) {
  const ink = "currentColor";

  if (mood === "happy") {
    return (
      <g stroke={ink} strokeWidth={STROKE} strokeLinecap="round" fill="none">
        <path d="M37,22 q4,-5 8,0" />
        <path d="M55,22 q4,-5 8,0" />
        <path d="M43,30 q7,5 14,0" />
      </g>
    );
  }

  if (mood === "sleepy") {
    return (
      <g stroke={ink} strokeWidth={STROKE} strokeLinecap="round" fill="none">
        <path d="M37,24 q4,4 8,0" />
        <path d="M55,24 q4,4 8,0" />
      </g>
    );
  }

  if (mood === "thinking") {
    return (
      <g fill={ink}>
        <circle cx="41" cy="23" r="2.6" />
        <circle cx="59" cy="23" r="2.6" />
        <path d="M44,31 h12" stroke={ink} strokeWidth={STROKE} strokeLinecap="round" />
      </g>
    );
  }

  return (
    <g fill={ink}>
      <circle cx="41" cy="23" r="2.8" />
      <circle cx="59" cy="23" r="2.8" />
      <path
        d="M43,30 q7,4 14,0"
        stroke={ink}
        strokeWidth={STROKE}
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}

/** Wordmark glyph — same idea, simplified for legibility at 24px. */
export function JellyMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6,10 C6,4.5 18,4.5 18,10 C18,11.7 15.5,11.7 15.5,10" />
      <path d="M18,10 C21,11.7 21,12.5 21,12" />
      <path d="M6,10 C3,11.7 3,12.5 3,12" />
      <path d="M8,10.5 C7,13 5.5,15 7,18" />
      <path d="M12,11 C11,14 13,16 12,19" />
      <path d="M16,10.5 C17,13 18.5,15 17,18" />
    </svg>
  );
}
