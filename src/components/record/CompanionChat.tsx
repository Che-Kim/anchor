"use client";

import { useEffect, useRef, useState } from "react";
import { Jellyfish } from "@/components/jellyfish/Jellyfish";
import { useJellyfish } from "@/store/useJellyfish";
import type { ChatTurn } from "@/lib/companion";

export type DiarySummary = {
  mood: string;
  highlights: string[];
  entry: string;
};

export function CompanionChat({
  onSummary,
}: {
  onSummary: (summary: DiarySummary, transcript: ChatTurn[]) => void;
}) {
  const jellyName = useJellyfish((s) => s.name);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [ending, setEnding] = useState(false);
  const [scripted, setScripted] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({
      top: scroller.current.scrollHeight,
      behavior: "smooth",
    });
  }, [turns, thinking]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || thinking) return;

    const next: ChatTurn[] = [...turns, { role: "user", content: text }];
    setTurns(next);
    setDraft("");
    setThinking(true);

    try {
      const res = await fetch("/api/companion/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, jellyName }),
      });
      const data = await res.json();
      if (data.scripted) setScripted(true);
      setTurns([
        ...next,
        {
          role: "assistant",
          content: data.reply ?? "I lost my train of thought there. Say that again?",
        },
      ]);
    } catch {
      setTurns([
        ...next,
        { role: "assistant", content: "I can't reach you right now. Try again in a moment?" },
      ]);
    } finally {
      setThinking(false);
    }
  }

  async function endSession() {
    if (turns.filter((t) => t.role === "user").length === 0) return;
    setEnding(true);
    try {
      const res = await fetch("/api/companion/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: turns }),
      });
      const data = await res.json();
      onSummary(
        {
          mood: data.mood ?? "reflective",
          highlights: data.highlights ?? [],
          entry: data.entry ?? "",
        },
        turns,
      );
    } finally {
      setEnding(false);
    }
  }

  const hasSpoken = turns.some((t) => t.role === "user");

  return (
    <div className="flex flex-col border-t border-rule">
      <div
        ref={scroller}
        className="flex max-h-[26rem] min-h-72 flex-col gap-5 overflow-y-auto py-5"
      >
        <div className="flex items-start gap-3">
          <Jellyfish size={40} mood="idle" className="shrink-0 text-ink" />
          <Bubble from="assistant">
            Hey. How did today actually go? Start anywhere, I&apos;ll keep up.
          </Bubble>
        </div>

        {turns.map((turn, i) =>
          turn.role === "user" ? (
            <div key={i} className="flex justify-end">
              <Bubble from="user">{turn.content}</Bubble>
            </div>
          ) : (
            <div key={i} className="flex items-start gap-3">
              <Jellyfish size={40} mood="idle" className="shrink-0 text-ink" />
              <Bubble from="assistant">{turn.content}</Bubble>
            </div>
          ),
        )}

        {thinking && (
          <div className="flex items-start gap-3">
            <Jellyfish size={40} mood="thinking" className="shrink-0 text-ink" />
            <div className="flex items-center gap-1 py-2">
              {[0, 1, 2].map((d) => (
                <span
                  key={d}
                  className="h-1 w-1 animate-bounce rounded-full bg-ink-3"
                  style={{ animationDelay: `${d * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={send}
        className="flex items-center gap-3 border-t border-rule py-3"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Tell ${jellyName} about your day…`}
          className="h-9 flex-1 border-b border-rule-strong bg-transparent text-[15px] text-ink placeholder:text-ink-3/60 focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={!draft.trim() || thinking}
          className="h-9 shrink-0 rounded-[2px] bg-ink px-4 text-[13px] font-medium text-paper transition-colors hover:bg-ink-2 disabled:opacity-40"
        >
          Send
        </button>
      </form>

      <div className="flex items-center justify-between gap-3 border-t border-rule py-3">
        <p className="label normal-case tracking-normal">
          {scripted
            ? "Running offline replies. Add ANTHROPIC_API_KEY for the real companion."
            : "Ending the session writes this up as today's entry."}
        </p>
        <button
          onClick={endSession}
          disabled={!hasSpoken || ending}
          className="h-9 shrink-0 rounded-[2px] bg-ink px-4 text-[13px] font-medium text-paper transition-colors hover:bg-ink-2 disabled:opacity-40"
        >
          {ending ? "Writing it up…" : "End session"}
        </button>
      </div>
    </div>
  );
}

function Bubble({
  from,
  children,
}: {
  from: "user" | "assistant";
  children: React.ReactNode;
}) {
  if (from === "user") {
    return (
      <p className="max-w-[78%] rounded-[2px] bg-ink px-4 py-2.5 text-[15px] leading-relaxed text-paper">
        {children}
      </p>
    );
  }
  return (
    <p className="max-w-[78%] border-l-2 border-rule-strong pl-4 text-[15px] leading-relaxed text-ink">
      {children}
    </p>
  );
}
