// Voice for reminders, duas and stories. Mirrors backend tts_service.VOICES so the picker works offline.
import { useSyncExternalStore } from "react";

import { storage } from "./utils/storage";

export type Voice = { id: string; name: string; desc: string };
export const VOICES: Voice[] = [
  { id: "onyx", name: "صوت الإمام", desc: "عميق وخاشع (الافتراضي، يعمل دون إنترنت)" },
  { id: "echo", name: "صوت هادئ", desc: "رجالي دافئ ومتزن" },
  { id: "ash", name: "صوت واضح", desc: "رجالي واضح النبرة" },
  { id: "fable", name: "صوت القاصّ", desc: "مناسب للقصص والسرد" },
  { id: "sage", name: "صوت رقيق", desc: "ناعم ومريح" },
  { id: "nova", name: "صوت لطيف", desc: "نسائي رقيق" },
];

const KEY = "tidhkar.voice";
let current = "onyx";
let hydrated = false;
const listeners = new Set<() => void>();

export async function getVoice() {
  if (!hydrated) {
    hydrated = true;
    const v = String((await storage.getItem(KEY, "onyx")) ?? "onyx");
    if (VOICES.some((x) => x.id === v)) current = v;
    listeners.forEach((l) => l());
  }
  return current;
}
export function setVoice(id: string) {
  current = id;
  hydrated = true;
  storage.setItem(KEY, id);
  listeners.forEach((l) => l());
}
export function useVoice() {
  void getVoice();
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => current,
  );
}
