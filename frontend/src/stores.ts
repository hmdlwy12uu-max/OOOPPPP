// Small persisted stores shared across screens: favorites, khatma progress, listening history.
// Each is a module-level store (useSyncExternalStore) hydrated once from AsyncStorage.
import { useSyncExternalStore } from "react";

import { getSurahs, TOTAL_AYAHS } from "./quran";
import { storage } from "./utils/storage";

function createStore<T>(key: string, initial: T) {
  let state = initial;
  let hydrated = false;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());
  const hydrate = async () => {
    if (hydrated) return;
    hydrated = true;
    const raw = await storage.getItem<string>(key, "");
    if (raw) {
      try {
        state = JSON.parse(String(raw)) as T;
        emit();
      } catch {}
    }
  };
  const set = (next: T) => {
    state = next;
    emit();
    storage.setItem(key, JSON.stringify(next));
  };
  const use = () => {
    void hydrate();
    return useSyncExternalStore(
      (l) => {
        listeners.add(l);
        return () => listeners.delete(l);
      },
      () => state,
      () => state,
    );
  };
  return { get: () => state, set, use, hydrate };
}

// ---------- Favorites ----------
export type FavType = "ayah" | "dua" | "hadith" | "dhikr" | "name";
export type Favorite = { id: string; type: FavType; title: string; text: string; route?: string; ts: number };

const favStore = createStore<Favorite[]>("tidhkar.favorites", []);
export const useFavorites = favStore.use;
export const isFavorite = (id: string) => favStore.get().some((f) => f.id === id);
export function toggleFavorite(f: Omit<Favorite, "ts">) {
  const cur = favStore.get();
  if (cur.some((x) => x.id === f.id)) {
    favStore.set(cur.filter((x) => x.id !== f.id));
    return false;
  }
  favStore.set([{ ...f, ts: Date.now() }, ...cur]);
  return true;
}
export function useIsFavorite(id: string) {
  return favStore.use().some((f) => f.id === id);
}

// ---------- Khatma (Quran completion tracking) ----------
export type Khatma = { readSurahs: number[]; startedAt: number; targetDays: number; completions: number };
const khatmaStore = createStore<Khatma>("tidhkar.khatma", { readSurahs: [], startedAt: Date.now(), targetDays: 30, completions: 0 });
export const useKhatma = khatmaStore.use;
export const hydrateKhatma = khatmaStore.hydrate;

export function khatmaStats(k: Khatma) {
  const surahs = getSurahs();
  const readAyahs = k.readSurahs.reduce((sum, n) => sum + (surahs[n - 1]?.ayahs.length ?? 0), 0);
  const pct = Math.min(100, Math.round((readAyahs / TOTAL_AYAHS) * 100));
  const days = Math.max(1, Math.ceil((Date.now() - k.startedAt) / 86400000));
  const remainingDays = Math.max(1, k.targetDays - days + 1);
  const dailyTarget = Math.ceil((TOTAL_AYAHS - readAyahs) / remainingDays);
  return { readAyahs, pct, days, remainingDays, dailyTarget, done: k.readSurahs.length >= 114 };
}
export function markSurahRead(n: number, read = true) {
  const k = khatmaStore.get();
  const has = k.readSurahs.includes(n);
  if (read && !has) khatmaStore.set({ ...k, readSurahs: [...k.readSurahs, n].sort((a, b) => a - b) });
  if (!read && has) khatmaStore.set({ ...k, readSurahs: k.readSurahs.filter((x) => x !== n) });
}
export function setKhatmaTarget(targetDays: number) {
  khatmaStore.set({ ...khatmaStore.get(), targetDays });
}
export function restartKhatma(completed: boolean) {
  const k = khatmaStore.get();
  khatmaStore.set({ readSurahs: [], startedAt: Date.now(), targetDays: k.targetDays, completions: k.completions + (completed ? 1 : 0) });
}

// ---------- Listening history ----------
export type HistoryItem = { surah: number; reciterId: string; ts: number };
const histStore = createStore<HistoryItem[]>("tidhkar.history", []);
export const useHistory = histStore.use;
export function addHistory(surah: number, reciterId: string) {
  const cur = histStore.get().filter((h) => !(h.surah === surah && h.reciterId === reciterId));
  histStore.set([{ surah, reciterId, ts: Date.now() }, ...cur].slice(0, 50));
}
export const clearHistory = () => histStore.set([]);

// ---------- Daily counters (morning/evening adhkar) ----------
export type DayCounts = { date: string; counts: Record<string, number> };
export const todayKey = () => new Date().toISOString().slice(0, 10);
const countsStore = createStore<Record<string, DayCounts>>("tidhkar.dailyCounts", {});
export function useCategoryCounts(cat: string) {
  const all = countsStore.use();
  const d = all[cat];
  return d && d.date === todayKey() ? d.counts : {};
}
export function bumpCount(cat: string, id: string, max: number) {
  const all = countsStore.get();
  const d = all[cat] && all[cat].date === todayKey() ? all[cat] : { date: todayKey(), counts: {} };
  const next = Math.min(max, (d.counts[id] ?? 0) + 1);
  countsStore.set({ ...all, [cat]: { date: d.date, counts: { ...d.counts, [id]: next } } });
  return next;
}
export function resetCounts(cat: string) {
  const all = countsStore.get();
  countsStore.set({ ...all, [cat]: { date: todayKey(), counts: {} } });
}
