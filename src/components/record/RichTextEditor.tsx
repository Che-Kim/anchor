"use client";

import { useEffect, useRef } from "react";

const TOOLS = [
  { cmd: "bold", label: "B", title: "Bold", className: "font-semibold" },
  { cmd: "italic", label: "I", title: "Italic", className: "italic" },
  { cmd: "underline", label: "U", title: "Underline", className: "underline" },
  { cmd: "formatBlock:h3", label: "H", title: "Heading", className: "" },
  { cmd: "insertUnorderedList", label: "—", title: "Bullet list", className: "" },
] as const;

export function RichTextEditor({
  html,
  onChange,
  placeholder = "How did today actually go?",
}: {
  html: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const lastLoaded = useRef<string | null>(null);

  // Only write incoming HTML into the DOM for a genuinely different document —
  // doing it per keystroke would reset the caret.
  useEffect(() => {
    const el = ref.current;
    if (!el || lastLoaded.current === html) return;
    lastLoaded.current = html;
    if (el.innerHTML !== html) el.innerHTML = html;
  }, [html]);

  function exec(cmd: string) {
    const [name, arg] = cmd.split(":");
    ref.current?.focus();
    document.execCommand(name, false, arg);
    emit();
  }

  function emit() {
    const el = ref.current;
    if (!el) return;
    lastLoaded.current = el.innerHTML;
    onChange(el.innerHTML);
  }

  const isEmpty = !html || html === "<br>" || html === "<div><br></div>";

  return (
    <div className="border-t border-rule">
      <div className="flex items-center gap-1 border-b border-rule py-1.5">
        {TOOLS.map((tool) => (
          <button
            key={tool.cmd}
            type="button"
            title={tool.title}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec(tool.cmd)}
            className={`h-7 w-7 rounded-[2px] text-[13px] text-ink-3 transition-colors hover:bg-paper-2 hover:text-ink ${tool.className}`}
          >
            {tool.label}
          </button>
        ))}
      </div>

      <div className="relative">
        {isEmpty && (
          <p className="pointer-events-none absolute py-5 text-[16px] text-ink-3/55">
            {placeholder}
          </p>
        )}
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Journal entry"
          onInput={emit}
          onBlur={emit}
          className="min-h-[24rem] py-5 text-[16px] leading-[1.75] text-ink focus:outline-none [&_h3]:mt-4 [&_h3]:mb-1 [&_h3]:font-display [&_h3]:text-[20px] [&_li]:ml-5 [&_ul]:list-disc"
          style={{ maxWidth: "62ch" }}
        />
      </div>
    </div>
  );
}

export function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
