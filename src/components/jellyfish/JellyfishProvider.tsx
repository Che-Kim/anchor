"use client";

import { useEffect } from "react";
import { useJellyfish } from "@/store/useJellyfish";
import { usePlanStore } from "@/store/usePlanStore";

export function JellyfishProvider() {
  useEffect(() => {
    void useJellyfish.persist.rehydrate();
    void usePlanStore.persist.rehydrate();
  }, []);

  return null;
}
