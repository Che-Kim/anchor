export type JellyMood = "idle" | "happy" | "thinking" | "sleepy";

/**
 * The whole silhouette — dome, hem, and all three tentacles — is one
 * unbroken path: apex → down the left side → dip/rise through each
 * tentacle → up the right side → back to the apex. No fill, so the body
 * is just the outline and the face floats in the open space inside it.
 * The dome stays flat and wide and the tentacles hang well below it —
 * a rounder dome or shorter tentacles read as a ghost, not a jellyfish.
 */
const BODY_PATH =
  "M50,8" +
  "C30,8 8,18 8,42" + // apex → left base (flat, wide dome)
  "C10,44 16,44 20,44" + // left base → tentacle 1 entry
  "C15,58 10,72 12,90" + // tentacle 1 entry → tip (splays left)
  "C16,80 22,62 30,46" + // tentacle 1 tip → exit
  "C36,44 40,44 44,46" + // tentacle 1 exit → tentacle 2 entry
  "C46,60 48,76 50,90" + // tentacle 2 entry → tip (hangs straight)
  "C52,76 54,60 56,46" + // tentacle 2 tip → exit
  "C60,44 64,44 70,46" + // tentacle 2 exit → tentacle 3 entry
  "C78,62 84,80 88,90" + // tentacle 3 entry → tip (splays right)
  "C90,72 85,58 80,44" + // tentacle 3 tip → exit
  "C84,44 90,44 92,42" + // tentacle 3 exit → right base
  "C92,18 70,8 50,8" + // right base → apex
  "Z";

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
        d={BODY_PATH}
        stroke="currentColor"
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Face mood={mood} />
    </svg>
  );
}

function Face({ mood }: { mood: JellyMood }) {
  const ink = "currentColor";

  if (mood === "happy") {
    return (
      <g stroke={ink} strokeWidth={3} strokeLinecap="round" fill="none">
        <path d="M37,22 q4,-5 8,0" />
        <path d="M55,22 q4,-5 8,0" />
        <path d="M43,30 q7,5 14,0" strokeWidth={2.6} />
      </g>
    );
  }

  if (mood === "sleepy") {
    return (
      <g stroke={ink} strokeWidth={3} strokeLinecap="round" fill="none">
        <path d="M37,24 q4,4 8,0" />
        <path d="M55,24 q4,4 8,0" />
      </g>
    );
  }

  if (mood === "thinking") {
    return (
      <g fill={ink}>
        <circle cx="41" cy="23" r="3" />
        <circle cx="59" cy="23" r="3" />
        <path
          d="M44,31 h12"
          stroke={ink}
          strokeWidth={2.6}
          strokeLinecap="round"
        />
      </g>
    );
  }

  return (
    <g fill={ink}>
      <circle cx="41" cy="23" r="3.2" />
      <circle cx="59" cy="23" r="3.2" />
      <path
        d="M43,30 q7,4 14,0"
        stroke={ink}
        strokeWidth={2.6}
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}

/** Wordmark glyph — same idea, fewer wiggles so it holds up at 24px. */
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
      <path d="M12,2.5 C8,2.5 4,5 4,10.5 C4,13.5 5.5,16 7,17.5 C8,18.5 8.5,16.5 9,14 C9.5,17 10.5,19.5 11.5,21.5 C12.5,19.5 13.5,17 14,14 C14.5,16.5 15,18.5 16,17.5 C17.5,16 19,13.5 19,10.5 C19,5 16,2.5 12,2.5 Z" />
    </svg>
  );
}
