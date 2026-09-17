export const MOOD_OPTIONS = [
  { value: "calm", label: "Calm", emoji: "🌊" },
  { value: "anxious", label: "Anxious", emoji: "🌪️" },
  { value: "energized", label: "Energized", emoji: "⚡" },
  { value: "low", label: "Low", emoji: "🌫️" },
  { value: "focused", label: "Focused", emoji: "🧭" },
] as const;

export type Mood = (typeof MOOD_OPTIONS)[number]["value"];

const MOOD_MUSIC: Record<Mood, { blurb: string; query: string }> = {
  calm: {
    blurb: "Gentle instrumentals and lo-fi to keep the water still.",
    query: "calm lofi chill",
  },
  anxious: {
    blurb: "Slow-tempo, grounding tracks to ease the swell.",
    query: "calming ambient anxiety relief",
  },
  energized: {
    blurb: "Upbeat tracks to ride the momentum.",
    query: "upbeat energy motivation",
  },
  low: {
    blurb: "Warm, comforting songs for a gentler current.",
    query: "comfort mellow feel better",
  },
  focused: {
    blurb: "Steady instrumentals, no lyrics to pull you off course.",
    query: "deep focus instrumental",
  },
};

export function getMoodMeta(mood: string) {
  return MOOD_OPTIONS.find((m) => m.value === mood) ?? MOOD_OPTIONS[0];
}

/**
 * Placeholder for the Spotify Web API recommendation call: today it just
 * links out to a mood-matched search since that needs no API credentials.
 * Swap the return for a real `/recommendations` call once Spotify OAuth
 * (SPOTIFY_CLIENT_ID/SECRET) is configured.
 */
export function getMoodMusic(mood: string) {
  const entry = MOOD_MUSIC[mood as Mood] ?? MOOD_MUSIC.calm;
  return {
    ...entry,
    spotifySearchUrl: `https://open.spotify.com/search/${encodeURIComponent(entry.query)}`,
  };
}
