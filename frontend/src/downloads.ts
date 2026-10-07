// Offline storage for recitations and generated voices (expo-file-system). Web falls back to streaming.
import { useSyncExternalStore } from "react";
import { Platform } from "react-native";
import { Directory, File, Paths } from "expo-file-system";

import { surahAudioUrl, type Reciter } from "./quran";

const native = Platform.OS !== "web";
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
let downloaded = new Set<string>(); // "reciterId-n"
let inflight = new Set<string>();
let hydrated = false;

function offlineDir() {
  const d = new Directory(Paths.document, "offline");
  if (!d.exists) d.create({ intermediates: true, idempotent: true });
  return d;
}
function cacheDir() {
  const d = new Directory(Paths.cache, "voices");
  if (!d.exists) d.create({ intermediates: true, idempotent: true });
  return d;
}

const surahKey = (reciterId: string, n: number) => `${reciterId}-${n}`;
const surahFile = (reciterId: string, n: number) => new File(offlineDir(), `quran-${surahKey(reciterId, n)}.mp3`);

export function hydrateDownloads() {
  if (hydrated || !native) return;
  hydrated = true;
  try {
    const next = new Set<string>();
    for (const item of offlineDir().list()) {
      const m = /^quran-(.+)-(\d+)\.mp3$/.exec(item.name);
      if (m && item instanceof File) next.add(surahKey(m[1], Number(m[2])));
    }
    downloaded = next;
    emit();
  } catch (e) {
    console.warn("[downloads] list failed", e);
  }
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
export function useDownloads() {
  hydrateDownloads();
  return useSyncExternalStore(subscribe, () => downloaded, () => downloaded);
}
export function useDownloading() {
  return useSyncExternalStore(subscribe, () => inflight, () => inflight);
}
export const isSurahDownloaded = (reciterId: string, n: number) => downloaded.has(surahKey(reciterId, n));

// Local file URI if downloaded, else the streaming URL.
export function surahSource(r: Reciter, n: number) {
  if (native && isSurahDownloaded(r.id, n)) return { uri: surahFile(r.id, n).uri, local: true };
  return { uri: surahAudioUrl(r, n), local: false };
}

export async function downloadSurah(r: Reciter, n: number) {
  if (!native) throw new Error("التنزيل متاح في التطبيق فقط");
  const key = surahKey(r.id, n);
  if (downloaded.has(key) || inflight.has(key)) return;
  inflight = new Set(inflight).add(key);
  emit();
  try {
    const f = surahFile(r.id, n);
    if (f.exists) f.delete();
    await File.downloadFileAsync(surahAudioUrl(r, n), f);
    downloaded = new Set(downloaded).add(key);
  } finally {
    inflight = new Set([...inflight].filter((k) => k !== key));
    emit();
  }
}

export function deleteSurahDownload(reciterId: string, n: number) {
  if (!native) return;
  try {
    const f = surahFile(reciterId, n);
    if (f.exists) f.delete();
  } catch {}
  downloaded = new Set([...downloaded].filter((k) => k !== surahKey(reciterId, n)));
  emit();
}

export function listDownloads() {
  return [...downloaded].map((k) => {
    const i = k.lastIndexOf("-");
    const reciterId = k.slice(0, i);
    const n = Number(k.slice(i + 1));
    let size = 0;
    try {
      size = surahFile(reciterId, n).size ?? 0;
    } catch {}
    return { reciterId, n, size };
  });
}

export function clearAllDownloads() {
  for (const d of listDownloads()) deleteSurahDownload(d.reciterId, d.n);
}

// Generic cached fetch for generated voices (dhikr / narration). Returns a playable URI.
export async function cachedRemote(url: string, name: string): Promise<string> {
  if (!native) return url;
  const f = new File(cacheDir(), name);
  if (f.exists && (f.size ?? 0) > 0) return f.uri;
  try {
    if (f.exists) f.delete();
    await File.downloadFileAsync(url, f);
    return f.uri;
  } catch (e) {
    console.warn("[downloads] cache failed, streaming", e);
    return url;
  }
}
export const isCached = (name: string) => {
  if (!native) return false;
  try {
    return new File(cacheDir(), name).exists;
  } catch {
    return false;
  }
};

export function formatBytes(b: number) {
  if (b > 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} م.ب`;
  return `${Math.max(1, Math.round(b / 1024))} ك.ب`;
}
