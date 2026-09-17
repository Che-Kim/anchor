import { create } from "zustand";
import { persist } from "zustand/middleware";

export const DEFAULT_JELLY_NAME = "Jelli";

type JellyfishState = {
  name: string;
  hasNamed: boolean;
  rename: (next: string) => void;
};

export const useJellyfish = create<JellyfishState>()(
  persist(
    (set) => ({
      name: DEFAULT_JELLY_NAME,
      hasNamed: false,
      rename: (next) =>
        set({ name: next.trim() || DEFAULT_JELLY_NAME, hasNamed: true }),
    }),
    {
      name: "anchor-jellyfish",
      // Rehydrated manually after mount so SSR and first client render agree.
      skipHydration: true,
    },
  ),
);
