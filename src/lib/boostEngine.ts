export type ActivityKind = "indoor" | "outdoor";

export type Activity = {
  id: string;
  kind: ActivityKind;
  title: string;
  blurb: string;
  minutes: number;
  tag: string;
  /** Paced-breathing activities drive the guided ring instead of a plain timer. */
  breathing?: { inhale: number; hold: number; exhale: number };
  /** Used for the YouTube lookup (indoor) or a map search (outdoor). */
  query: string;
  /** Intensity this suits: higher = better when the user is more loaded. */
  suitsLoad: number;
};

export const ACTIVITIES: Activity[] = [
  {
    id: "box-breathing",
    kind: "indoor",
    title: "Box breathing",
    blurb: "Four counts in, four hold, four out. The fastest way down from a spike.",
    minutes: 4,
    tag: "Breathing",
    breathing: { inhale: 4, hold: 4, exhale: 4 },
    query: "guided box breathing 4 minutes",
    suitsLoad: 3,
  },
  {
    id: "physiological-sigh",
    kind: "indoor",
    title: "Long-exhale reset",
    blurb: "Double inhale, slow exhale. Built for the middle of a bad afternoon.",
    minutes: 3,
    tag: "Breathing",
    breathing: { inhale: 4, hold: 2, exhale: 8 },
    query: "physiological sigh breathing exercise",
    suitsLoad: 3,
  },
  {
    id: "desk-stretch",
    kind: "indoor",
    title: "Neck & shoulder release",
    blurb: "For the ache that builds after a few hours hunched at a laptop.",
    minutes: 8,
    tag: "Stretch",
    query: "guided neck and shoulder stretch at desk 8 minutes",
    suitsLoad: 2,
  },
  {
    id: "study-yoga",
    kind: "indoor",
    title: "Study-break yoga",
    blurb: "Low effort, no mat needed, gets blood back into your legs.",
    minutes: 15,
    tag: "Movement",
    query: "yoga for students study break 15 minutes",
    suitsLoad: 1,
  },
  {
    id: "body-scan",
    kind: "indoor",
    title: "Body scan",
    blurb: "Lie down and work top to bottom. Good when your head won't stop.",
    minutes: 10,
    tag: "Mindfulness",
    query: "guided body scan meditation 10 minutes",
    suitsLoad: 3,
  },
  {
    id: "shake-out",
    kind: "indoor",
    title: "Two-minute shake out",
    blurb: "Stand up, shake everything loose. Undignified, works anyway.",
    minutes: 2,
    tag: "Movement",
    query: "2 minute shake out stress release exercise",
    suitsLoad: 2,
  },
  {
    id: "walk-no-audio",
    kind: "outdoor",
    title: "Walk with nothing in your ears",
    blurb: "No podcast, no music. Twenty minutes of your own thoughts unaccompanied.",
    minutes: 20,
    tag: "Walk",
    query: "walking trails near me",
    suitsLoad: 2,
  },
  {
    id: "morning-light",
    kind: "outdoor",
    title: "Get light on your face",
    blurb: "Outside, phone in your pocket, ten minutes. Helps tonight's sleep more than it sounds like it should.",
    minutes: 10,
    tag: "Reset",
    query: "parks near me",
    suitsLoad: 3,
  },
  {
    id: "find-water",
    kind: "outdoor",
    title: "Go find water",
    blurb: "A creek, a lake, the river. Somewhere the view isn't a wall.",
    minutes: 30,
    tag: "Explore",
    query: "lakes and creeks near me",
    suitsLoad: 1,
  },
  {
    id: "block-loop",
    kind: "outdoor",
    title: "Loop the block",
    blurb: "One lap between work blocks. Short enough that you'll actually do it.",
    minutes: 10,
    tag: "Walk",
    query: "walking route near me",
    suitsLoad: 3,
  },
  {
    id: "green-sit",
    kind: "outdoor",
    title: "Sit somewhere green",
    blurb: "Not a productive sit. Just a sit, on grass, doing nothing.",
    minutes: 20,
    tag: "Rest",
    query: "green space park near me",
    suitsLoad: 2,
  },
  {
    id: "no-destination",
    kind: "outdoor",
    title: "Go somewhere with no destination",
    blurb: "Bike or bus, pick a direction, turn around when you feel like it.",
    minutes: 45,
    tag: "Explore",
    query: "scenic bike routes near me",
    suitsLoad: 1,
  },
];

export type BoostContext = {
  focusMinutes: number;
  hardCount: number;
  unscheduledCount: number;
  recentStress: number | null;
  entriesThisWeek: number;
};

export type LoadLevel = "light" | "balanced" | "heavy";

export type BoostReading = {
  load: LoadLevel;
  score: number;
  headline: string;
  signals: string[];
  narration: string;
};

export function readContext(ctx: BoostContext): BoostReading {
  // Each signal carries the score it contributed, so the narration can quote
  // the one that actually drove the verdict rather than whichever came first.
  const weighted: { text: string; weight: number }[] = [];

  const focusHours = ctx.focusMinutes / 60;
  if (focusHours >= 6) {
    weighted.push({ text: `${focusHours.toFixed(1)} focus hours scheduled`, weight: 2 });
  } else if (focusHours >= 3) {
    weighted.push({ text: `${focusHours.toFixed(1)} focus hours scheduled`, weight: 1 });
  } else if (focusHours > 0) {
    weighted.push({ text: `a light ${focusHours.toFixed(1)}h on the schedule`, weight: 0 });
  }

  if (ctx.hardCount >= 2) {
    weighted.push({ text: `${ctx.hardCount} hard tasks back to back`, weight: 2 });
  } else if (ctx.hardCount === 1) {
    weighted.push({ text: "one heavy task in the mix", weight: 1 });
  }

  if (ctx.unscheduledCount > 0) {
    weighted.push({
      text: `${ctx.unscheduledCount} task${ctx.unscheduledCount === 1 ? "" : "s"} that wouldn't fit`,
      weight: 1,
    });
  }

  if (ctx.recentStress !== null) {
    if (ctx.recentStress >= 4) {
      weighted.push({ text: `stress at ${ctx.recentStress}/5 last check-in`, weight: 2 });
    } else if (ctx.recentStress >= 3) {
      weighted.push({ text: `stress sitting at ${ctx.recentStress}/5`, weight: 1 });
    } else {
      weighted.push({ text: `stress low at ${ctx.recentStress}/5`, weight: 0 });
    }
  }

  if (ctx.entriesThisWeek >= 3) {
    weighted.push({ text: `${ctx.entriesThisWeek} diary entries this week`, weight: 0 });
  }

  const score = weighted.reduce((sum, s) => sum + s.weight, 0);
  const signals = weighted.map((s) => capitalize(s.text));
  const load: LoadLevel = score >= 4 ? "heavy" : score >= 2 ? "balanced" : "light";

  const driver = [...weighted].sort((a, b) => b.weight - a.weight)[0]?.text ?? "";

  const headline =
    load === "heavy"
      ? "Today's a lot. Start small."
      : load === "balanced"
        ? "Manageable, but don't run it straight through."
        : "You've got room today.";

  const narration =
    weighted.length === 0
      ? "I don't have much to go on yet — plan a day or check in and I'll tailor this. Until then, here's what usually helps."
      : load === "heavy"
        ? `I looked at your day and what stands out is ${driver}. When it's stacked like that, the short things are the ones you'll actually finish — so I've put those first.`
        : load === "balanced"
          ? `Your day reads as workable, with ${driver}. A real break between blocks is what keeps it that way.`
          : `Nothing's screaming at you today — ${driver}. Good day to take the longer option.`;

  return { load, score, headline, signals, narration };
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function pickActivities(reading: BoostReading, kind: ActivityKind) {
  const target = reading.load === "heavy" ? 3 : reading.load === "balanced" ? 2 : 1;

  return ACTIVITIES.filter((a) => a.kind === kind)
    .map((a) => ({ activity: a, fit: -Math.abs(a.suitsLoad - target) }))
    .sort((a, b) => b.fit - a.fit || a.activity.minutes - b.activity.minutes)
    .map((entry) => entry.activity);
}

export function mapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
}

export function youtubeSearchUrl(query: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}
