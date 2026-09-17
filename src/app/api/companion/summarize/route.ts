import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { consumeCompanionCall, readVisitorId, withVisitor } from "@/lib/visitor";
import {
  COMPANION_MODEL,
  getAnthropic,
  scriptedSummary,
  type ChatTurn,
} from "@/lib/companion";

const DiarySummarySchema = z.object({
  mood: z.string(),
  highlights: z.array(z.string()),
  entry: z.string(),
});

export async function POST(request: NextRequest) {
  const visitorId = readVisitorId(request);
  const send = (body: unknown, init?: ResponseInit) =>
    withVisitor(NextResponse.json(body, init), visitorId);

  const { messages } = (await request.json()) as { messages?: ChatTurn[] };
  const turns = (messages ?? []).filter((m) => m.content?.trim());

  if (turns.length === 0) {
    return send({ error: "Nothing to summarize" }, { status: 400 });
  }

  const client = getAnthropic();
  if (!client) {
    return send({ ...scriptedSummary(turns), scripted: true });
  }

  const { allowed } = await consumeCompanionCall(visitorId);
  if (!allowed) {
    return send({ ...scriptedSummary(turns), limited: true });
  }

  const transcript = turns
    .map((t) => `${t.role === "user" ? "Them" : "You"}: ${t.content}`)
    .join("\n");

  try {
    const response = await client.messages.parse({
      model: COMPANION_MODEL,
      max_tokens: 4000,
      system: [
        "You turn an end-of-day conversation into that person's diary entry.",
        "Write `entry` in first person, as if they wrote it themselves: past tense, 2 short paragraphs at most, plain language, no headings, no em dashes.",
        "Only include what they actually said. Never invent events, names or feelings.",
        "`mood` is one lowercase word. `highlights` is 2-4 short factual phrases drawn from the conversation.",
      ].join("\n"),
      messages: [
        { role: "user", content: `Here is tonight's conversation.\n\n${transcript}` },
      ],
      output_config: { format: zodOutputFormat(DiarySummarySchema) },
    });

    const parsed = response.parsed_output;
    if (!parsed) {
      return send({ ...scriptedSummary(turns), scripted: true });
    }
    return send(parsed);
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      return send({ ...scriptedSummary(turns), scripted: true });
    }
    throw error;
  }
}
