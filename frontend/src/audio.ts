import { useSyncExternalStore } from "react";
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";

import { SOUNDS, type SoundId } from "./adhkar";
import { cachedRemote } from "./downloads";
import { getVoice } from "./voice";

export type NowPlaying = { title: string; subtitle?: string; route?: string };

// One module-level player: only one audio item plays at a time (dhikr, recitation, narration).
let player: AudioPlayer | null = null;
let playingId: string | null = null;
let nowPlaying: NowPlaying | null = null;
let loading = false;
let paused = false;
let inBackgroundMode = false; // true for Quran/narration (keeps playing when the app is backgrounded)
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function setPlaying(id: string | null, isLoading = false, meta: NowPlaying | null = null) {
  playingId = id;
  loading = isLoading;
  paused = false;
  nowPlaying = id ? meta : null;
  emit();
}

export function stopSound() {
  if (player) {
    try {
      player.pause();
      player.remove();
    } catch {}
    player = null;
  }
  setPlaying(null);
}

async function playSource(
  key: string,
  source: number | { uri: string },
  background: boolean,
  onFinish?: () => void,
  meta: NowPlaying | null = null,
) {
  try {
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false, shouldPlayInBackground: background });
    stopSound();
    const p = createAudioPlayer(source);
    player = p;
    inBackgroundMode = background;
    setPlaying(key, typeof source !== "number", meta);
    p.addListener("playbackStatusUpdate", (s) => {
      if (player !== p) return;
      if (loading && s.playing) setPlaying(key, false, meta);
      if (s.didJustFinish) {
        stopSound();
        onFinish?.();
      }
    });
    p.play();
    return true;
  } catch (e) {
    console.warn("[audio] playback failed", key, e);
    setPlaying(null);
    return false;
  }
}

// Called when the app goes to background: short dhikr clips stop, recitation/narration keeps playing.
export function stopForegroundOnly() {
  if (player && !inBackgroundMode) stopSound();
}

// Bundled dhikr sound (default voice, always offline).
export function playSound(id: SoundId) {
  return playSource(id, SOUNDS[id], false);
}

const API = process.env.EXPO_PUBLIC_BACKEND_URL;

// Dhikr in the user's chosen voice: bundled for the default voice, otherwise generated & cached from the API.
export async function playDhikr(id: SoundId, meta?: NowPlaying) {
  const voice = await getVoice();
  if (voice === "onyx") return playSource(id, SOUNDS[id], false, undefined, meta ?? null);
  setPlaying(id, true, meta ?? null);
  try {
    const uri = await cachedRemote(`${API}/api/audio/${id}.wav?voice=${voice}`, `dhikr-${voice}-${id}.wav`);
    if (playingId !== id) return false; // user cancelled while downloading
    return playSource(id, { uri }, false, undefined, meta ?? null);
  } catch (e) {
    console.warn("[audio] dhikr voice failed, falling back", e);
    return playSource(id, SOUNDS[id], false, undefined, meta ?? null);
  }
}

// Narrate long content (duas, hadith, stories) with the chosen voice. Generated server-side, cached locally.
export async function narrate(key: string, text: string, meta: NowPlaying) {
  const voice = await getVoice();
  setPlaying(key, true, meta);
  try {
    const res = await fetch(`${API}/api/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice }),
    });
    if (!res.ok) throw new Error(`tts ${res.status}`);
    const { url } = (await res.json()) as { url: string };
    const uri = await cachedRemote(`${API}${url}`, `narr-${url.split("/").slice(-2).join("-")}`);
    if (playingId !== key) return false;
    return playSource(key, { uri }, true, undefined, meta);
  } catch (e) {
    console.warn("[audio] narration failed", e);
    if (playingId === key) setPlaying(null);
    return false;
  }
}

// Streamed/local recitation (Quran); keeps playing with the screen locked in native builds.
export function playUri(key: string, uri: string, onFinish?: () => void, meta?: NowPlaying) {
  return playSource(key, { uri }, true, onFinish, meta ?? null);
}

export function togglePause() {
  if (!player) return;
  if (paused) player.play();
  else player.pause();
  paused = !paused;
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export const usePaused = () => useSyncExternalStore(subscribe, () => paused, () => paused);
export const usePlayingId = () => useSyncExternalStore(subscribe, () => playingId, () => playingId);
export const useAudioLoading = () => useSyncExternalStore(subscribe, () => loading, () => loading);
export const useNowPlaying = () => useSyncExternalStore(subscribe, () => nowPlaying, () => nowPlaying);
