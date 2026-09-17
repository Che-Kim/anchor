"use client";

import { useState } from "react";
import { useJellyfish } from "@/store/useJellyfish";

export function JellyfishNamePill() {
  const name = useJellyfish((s) => s.name);
  const rename = useJellyfish((s) => s.rename);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  function commit() {
    rename(draft);
    setEditing(false);
    setDraft("");
  }

  if (editing) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          commit();
        }}
        className="flex items-center gap-2"
      >
        <span className="label hidden sm:inline">Companion</span>
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          maxLength={18}
          placeholder={name}
          className="h-8 w-28 rounded-[2px] border border-ink bg-transparent px-2 text-[13px] text-ink placeholder:text-ink-3 focus:outline-none"
        />
      </form>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="group flex items-center gap-2 text-[13px] text-ink-2 transition-colors hover:text-ink"
      title="Rename your companion"
    >
      <span className="label hidden sm:inline">Companion</span>
      <span className="border-b border-transparent font-medium text-ink transition-colors group-hover:border-accent group-hover:text-accent">
        {name}
      </span>
    </button>
  );
}
