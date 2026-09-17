"use client";

import { useCallback, useEffect, useState } from "react";
import { CompanionChat, type DiarySummary } from "@/components/record/CompanionChat";
import { RichTextEditor, stripHtml } from "@/components/record/RichTextEditor";
import { Jellyfish } from "@/components/jellyfish/Jellyfish";
import { Button } from "@/components/ui/Button";
import { Masthead, SectionHead, Tag } from "@/components/ui/Chrome";
import { useJellyfish } from "@/store/useJellyfish";
import type { ChatTurn } from "@/lib/companion";

type Mode = "select" | "solo" | "companion";

type Entry = {
  date: string;
  mode: string;
  content: string;
  mood: string | null;
  highlights: string | null;
  updatedAt: string;
};

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function RecordPage() {
  const jellyName = useJellyfish((s) => s.name);
  const [mode, setMode] = useState<Mode>("select");
  const [date, setDate] = useState(todayKey());
  const [entry, setEntry] = useState<Entry | null>(null);
  const [html, setHtml] = useState("");
  const [saving, setSaving] = useState<"idle" | "saving" | "saved">("idle");
  const [recent, setRecent] = useState<Entry[]>([]);
  const [summary, setSummary] = useState<DiarySummary | null>(null);

  const loadRecent = useCallback(() => {
    fetch("/api/diary")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setRecent(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadRecent();
  }, [loadRecent]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/diary?date=${date}`)
      .then((r) => r.json())
      .then((data: Entry | null) => {
        if (cancelled) return;
        setEntry(data);
        setHtml(data?.mode === "solo" ? data.content : "");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [date]);

  async function saveSolo() {
    setSaving("saving");
    await fetch("/api/diary", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, mode: "solo", content: html }),
    });
    setSaving("saved");
    loadRecent();
    setTimeout(() => setSaving("idle"), 1800);
  }

  async function saveSummary(next: DiarySummary, transcript: ChatTurn[]) {
    setSummary(next);
    await fetch("/api/diary", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: todayKey(),
        mode: "companion",
        content: next.entry,
        mood: next.mood,
        highlights: next.highlights,
        transcript,
      }),
    });
    loadRecent();
  }

  return (
    <>
      <Masthead
        crumb="Record"
        right={
          mode !== "select" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setMode("select");
                setSummary(null);
              }}
            >
              Switch mode
            </Button>
          )
        }
      />

      <main className="mx-auto w-full max-w-[1240px] flex-1 px-5 sm:px-8">
        {mode === "select" && (
          <ModeSelect jellyName={jellyName} onPick={setMode} recent={recent} />
        )}

        {mode === "solo" && (
          <section className="mx-auto max-w-[68ch] py-9">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-3">
              <div className="flex items-center gap-3">
                <span className="label">Entry for</span>
                <input
                  type="date"
                  value={date}
                  max={todayKey()}
                  onChange={(e) => setDate(e.target.value)}
                  className="metric border-b border-rule-strong bg-transparent text-[14px] text-ink focus:border-accent focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-4">
                {saving === "saved" && <span className="label text-accent">Saved</span>}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={saveSolo}
                  disabled={saving === "saving"}
                >
                  {saving === "saving" ? "Saving…" : "Save entry"}
                </Button>
              </div>
            </div>

            {entry?.mode === "companion" && (
              <p className="mt-3 border-l-2 border-signal pl-3 text-[13px] text-ink-2">
                This day already has a companion entry. Saving here replaces it.
              </p>
            )}

            <div className="mt-5">
              <RichTextEditor html={html} onChange={setHtml} />
            </div>
          </section>
        )}

        {mode === "companion" && (
          <section className="mx-auto max-w-[68ch] py-9">
            {summary ? (
              <SummaryView summary={summary} onWriteMore={() => setSummary(null)} />
            ) : (
              <>
                <SectionHead title={`Talk it through with ${jellyName}`} />
                <p className="pt-3 text-[15px] text-ink-2">
                  When you&apos;re done, ending the session turns this into
                  today&apos;s entry.
                </p>
                <div className="mt-5">
                  <CompanionChat onSummary={saveSummary} />
                </div>
              </>
            )}
          </section>
        )}
      </main>
    </>
  );
}

function ModeSelect({
  jellyName,
  onPick,
  recent,
}: {
  jellyName: string;
  onPick: (mode: Mode) => void;
  recent: Entry[];
}) {
  return (
    <>
      <section className="border-b border-rule py-12">
        <p className="label">Record</p>
        <h1 className="display mt-4 text-[clamp(2.5rem,6vw,4rem)] text-ink">
          How do you want
          <br />
          to get it down?
        </h1>
      </section>

      <section className="grid grid-cols-1 border-b border-rule md:grid-cols-2">
        <button
          onClick={() => onPick("solo")}
          className="group border-rule px-1 py-10 text-left transition-colors hover:bg-paper-2 md:border-r md:pr-10"
        >
          <span className="label">01 · No AI</span>
          <h2 className="display mt-3 text-[32px] text-ink transition-colors group-hover:text-accent">
            Write it myself
          </h2>
          <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-ink-2">
            Pick a date, get a clean page and a blinking cursor. Nothing reads it
            but you.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-[14px] font-medium text-ink">
            <span className="border-b border-ink pb-0.5 transition-colors group-hover:border-accent group-hover:text-accent">
              Open the journal
            </span>
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </span>
        </button>

        <button
          onClick={() => onPick("companion")}
          className="group px-1 py-10 text-left transition-colors hover:bg-paper-2 md:pl-10"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="label">02 · With {jellyName}</span>
              <h2 className="display mt-3 text-[32px] text-ink transition-colors group-hover:text-accent">
                Talk it through
              </h2>
            </div>
            <Jellyfish size={64} mood="idle" className="shrink-0 text-ink" />
          </div>
          <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-ink-2">
            Easier than a blank page. The conversation becomes the entry when
            you&apos;re done.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-[14px] font-medium text-ink">
            <span className="border-b border-ink pb-0.5 transition-colors group-hover:border-accent group-hover:text-accent">
              Start talking
            </span>
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </span>
        </button>
      </section>

      {recent.length > 0 && (
        <section className="py-9">
          <SectionHead
            title="Past entries"
            aside={<span className="label">{recent.length} kept</span>}
          />
          <table className="w-full">
            <thead>
              <tr className="label border-b border-rule">
                <th className="py-2 text-left font-normal">Date</th>
                <th className="py-2 text-left font-normal">Entry</th>
                <th className="py-2 text-right font-normal">Mood</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((e) => (
                <tr
                  key={e.date}
                  className="group cursor-pointer border-b border-rule transition-colors hover:bg-paper-2"
                  onClick={() => onPick("solo")}
                >
                  <td className="metric py-3 pr-4 align-top text-[13px] whitespace-nowrap text-ink">
                    {e.date}
                  </td>
                  <td className="max-w-0 truncate py-3 pr-4 text-[14px] text-ink-2">
                    {stripHtml(e.content).slice(0, 110) || "Empty entry"}
                  </td>
                  <td className="py-3 text-right align-top">
                    {e.mood ? <Tag>{e.mood}</Tag> : <span className="label">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}

function SummaryView({
  summary,
  onWriteMore,
}: {
  summary: DiarySummary;
  onWriteMore: () => void;
}) {
  return (
    <div className="rise">
      <div className="flex items-baseline justify-between gap-3 border-b border-rule pb-2">
        <span className="label">Saved as today&apos;s entry</span>
        <Tag tone="accent">{summary.mood}</Tag>
      </div>

      <p className="mt-6 text-[17px] leading-[1.75] whitespace-pre-line text-ink">
        {summary.entry}
      </p>

      {summary.highlights.length > 0 && (
        <div className="mt-8">
          <p className="label border-b border-rule pb-2">Highlights</p>
          <ul>
            {summary.highlights.map((h) => (
              <li
                key={h}
                className="border-b border-rule py-2.5 text-[14px] text-ink-2"
              >
                {h}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button variant="secondary" size="sm" onClick={onWriteMore} className="mt-6">
        Keep talking
      </Button>
    </div>
  );
}
