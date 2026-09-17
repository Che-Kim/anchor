import Anthropic from "@anthropic-ai/sdk";

export const COMPANION_MODEL = "claude-opus-5";

export const hasAnthropicKey = Boolean(
  process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN,
);

let client: Anthropic | null = null;

export function getAnthropic() {
  if (!hasAnthropicKey) return null;
  client ??= new Anthropic();
  return client;
}

export function companionSystemPrompt(jellyName: string) {
  return [
    `You are ${jellyName}, a jellyfish companion living inside Anchor — a planner and wellness app used by a university student.`,
    "You are talking with them at the end of their day so they can get it off their chest. You are a warm friend, not a therapist and not a coach.",
    "",
    "How to talk:",
    "- Keep replies to 2-4 sentences. This is a conversation, not an essay.",
    "- Reflect what they actually said before asking anything. Never open with a question every turn.",
    "- Ask at most one question, and only when it genuinely opens something up.",
    "- Do not give advice unless they ask for it. Do not tell them to see a professional for ordinary bad days.",
    "- Never say you are an AI or mention being a language model. You are a jellyfish.",
    "- No emoji unless they use them first. No bullet points. No headings.",
    "",
    "If they mention self-harm or being in danger, drop the persona's lightness, say plainly that you are worried, and point them to a crisis line.",
  ].join("\n");
}

export type ChatTurn = { role: "user" | "assistant"; content: string };

/**
 * Keeps the companion usable with no API key configured: reflective openers
 * chosen from what the user wrote, so the UI can be exercised end to end.
 */
export function scriptedReply(turns: ChatTurn[]): string {
  const lastUser = [...turns].reverse().find((t) => t.role === "user");
  const text = lastUser?.content.trim() ?? "";
  const userTurns = turns.filter((t) => t.role === "user").length;
  const lower = text.toLowerCase();

  if (userTurns <= 1) {
    return `That's a lot to be carrying into the evening. I'm listening — what part of it is still sitting with you?`;
  }
  if (/(tired|exhausted|drained|burnt|burned out)/.test(lower)) {
    return "Tired is its own kind of information — usually that you spent more than you had. You don't have to solve that tonight.";
  }
  if (/(stress|anxious|worried|nervous|overwhelm)/.test(lower)) {
    return "That sounds heavy, and it makes sense that it's loud right now. What would make tomorrow's version of this even slightly lighter?";
  }
  if (/(good|great|happy|proud|went well|finished|done)/.test(lower)) {
    return "I like hearing that. Those days deserve to be written down as carefully as the hard ones — what made it land well?";
  }
  if (userTurns >= 4) {
    return `I think you've said the important part. Whenever you're ready, hit End session and I'll write this up as today's entry.`;
  }
  return "I hear you. Say more about that — I've got time.";
}

export function scriptedSummary(turns: ChatTurn[]) {
  const said = turns
    .filter((t) => t.role === "user")
    .map((t) => t.content.trim())
    .filter(Boolean);

  return {
    mood: "reflective",
    highlights: said.slice(0, 3).map((s) => s.slice(0, 90)),
    entry:
      said.length > 0
        ? `Today, in their own words: ${said.join(" ")}`
        : "A quiet evening with not much said.",
  };
}
