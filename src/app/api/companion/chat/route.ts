import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { consumeCompanionCall, readVisitorId, withVisitor } from "@/lib/visitor";
import {
  COMPANION_MODEL,
  companionSystemPrompt,
  getAnthropic,
  scriptedReply,
  type ChatTurn,
} from "@/lib/companion";

export async function POST(request: NextRequest) {
  // Read once, up front: every return below has to carry the cookie, or the
  // visitor gets a fresh identity next request — losing their entries and
  // resetting their place against the daily cap.
  const visitorId = readVisitorId(request);
  const send = (body: unknown, init?: ResponseInit) =>
    withVisitor(NextResponse.json(body, init), visitorId);

  const { messages, jellyName } = (await request.json()) as {
    messages?: ChatTurn[];
    jellyName?: string;
  };

  const turns = (messages ?? []).filter((m) => m.content?.trim());
  const name = jellyName?.trim() || "Jelli";

  if (turns.length === 0) {
    return send({ error: "No messages" }, { status: 400 });
  }

  const client = getAnthropic();
  if (!client) {
    return send({ reply: scriptedReply(turns), scripted: true });
  }

  const { allowed } = await consumeCompanionCall(visitorId);
  if (!allowed) {
    return send({
      reply:
        "I've hit my limit of talking for today — the demo caps how much I can say per visitor. Everything else still works.",
      limited: true,
    });
  }

  try {
    const response = await client.messages.create({
      model: COMPANION_MODEL,
      max_tokens: 1024,
      system: companionSystemPrompt(name),
      // Conversational turns don't benefit from deep reasoning, and low effort
      // keeps replies fast enough to feel like a chat.
      output_config: { effort: "low" },
      messages: turns.map((t) => ({ role: t.role, content: t.content })),
    });

    if (response.stop_reason === "refusal") {
      return send({
        reply:
          "I don't think I'm the right one to carry that with you — please reach out to someone who can help properly.",
        refused: true,
      });
    }

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    return send({ reply: text || scriptedReply(turns) });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return send({ error: "Rate limited — give it a moment." }, { status: 429 });
    }
    if (error instanceof Anthropic.AuthenticationError) {
      return send({ reply: scriptedReply(turns), scripted: true });
    }
    if (error instanceof Anthropic.APIError) {
      return send(
        { error: `Companion unavailable (${error.status})` },
        { status: 502 },
      );
    }
    throw error;
  }
}
