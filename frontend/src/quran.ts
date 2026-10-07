// Quran text: Tanzil Project, Uthmani v1.1 (tanzil.net) — CC BY 3.0, verbatim, verified at build time
// (6236 ayahs). The basmala is kept verbatim per surah in `basmala` and shown as a header.
import { storage } from "./utils/storage";

export type Surah = { n: number; name: string; en: string; type: string; ayahs: string[]; basmala?: string };

let cache: Surah[] | null = null;
export function getSurahs(): Surah[] {
  if (!cache) cache = (require("../assets/quran/quran-uthmani.json") as { surahs: Surah[] }).surahs;
  return cache;
}
export const getSurah = (n: number) => getSurahs()[n - 1];
export const TOTAL_AYAHS = 6236;

export const TANZIL_CREDIT = "نص المصحف: مشروع تنزيل (tanzil.net) — الرسم العثماني، نسخة موثّقة دون أي تعديل";

// Strip tashkeel/Quranic marks so "الفاتحة" matches "ٱلْفَاتِحَةِ".
export function normalizeArabic(s: string) {
  return s
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "")
    .replace(/[ٱأإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .trim();
}

export type AyahHit = { surah: number; ayah: number; text: string };
// Full-text search across all 6236 ayahs (diacritics-insensitive). Capped for UI speed.
export function searchAyahs(q: string, limit = 60): AyahHit[] {
  const nq = normalizeArabic(q);
  if (nq.length < 2) return [];
  const hits: AyahHit[] = [];
  for (const s of getSurahs()) {
    for (let i = 0; i < s.ayahs.length; i++) {
      if (normalizeArabic(s.ayahs[i]).includes(nq)) {
        hits.push({ surah: s.n, ayah: i + 1, text: s.ayahs[i] });
        if (hits.length >= limit) return hits;
      }
    }
  }
  return hits;
}

export type Reciter = { id: string; name: string; slug: string; path?: string };
// Streams from mp3quran.net CDN (verified URLs); `path` differs for some archives.
export const RECITERS: Reciter[] = [
  { id: "sudais", name: "عبدالرحمن السديس", slug: "abdulrahman-sudais" },
  { id: "shuraim", name: "سعود الشريم", slug: "saud-shuraim" },
  { id: "maher", name: "ماهر المعيقلي", slug: "maher-muaiqly" },
  { id: "afasy", name: "مشاري العفاسي", slug: "mishary-alafasy" },
  { id: "husary", name: "محمود خليل الحصري", slug: "mahmoud-husary" },
  { id: "minshawi", name: "محمد صديق المنشاوي", slug: "muhammad-minshawi" },
  { id: "abdulbasit", name: "عبدالباسط عبدالصمد", slug: "abdulbasit-abdulsamad", path: "r3" },
  { id: "dosari", name: "ياسر الدوسري", slug: "yasser-dosari" },
  { id: "ajmi", name: "أحمد العجمي", slug: "ahmad-ajmi" },
  { id: "ghamdi", name: "سعد الغامدي", slug: "saad-ghamdi" },
  { id: "qatami", name: "ناصر القطامي", slug: "nasser-qatami" },
  { id: "abbad", name: "فارس عباد", slug: "fares-abbad" },
  { id: "baleela", name: "بندر بليلة", slug: "bandar-baleela" },
  { id: "shatri", name: "أبو بكر الشاطري", slug: "abubakr-shatri" },
  { id: "banna", name: "محمود علي البنا", slug: "mahmoud-banna" },
];
export const getReciter = (id: string) => RECITERS.find((r) => r.id === id) ?? RECITERS[0];

export const surahAudioUrl = (r: Reciter, n: number) =>
  `https://cdn.mp3quran.net/audio/${r.slug}/${r.path ?? "r1"}/${String(n).padStart(3, "0")}.mp3`;

const K = "tidhkar.quran.";
export async function getLastRead() {
  const [s, a] = await Promise.all([storage.getItem(K + "surah", 0), storage.getItem(K + "ayah", 1)]);
  return s ? { surah: Number(s), ayah: Number(a) || 1 } : null;
}
export const saveLastRead = (surah: number, ayah: number) =>
  Promise.all([storage.setItem(K + "surah", surah), storage.setItem(K + "ayah", ayah)]);
export const getReciterId = async () => String((await storage.getItem(K + "reciter", "sudais")) ?? "sudais");
export const saveReciterId = (id: string) => storage.setItem(K + "reciter", id);

// Reader font size (Quran script), persisted.
export const FONT_SIZES = [22, 26, 30, 34, 38] as const;
export const getFontSize = async () => Number((await storage.getItem(K + "fontSize", 26)) ?? 26);
export const saveFontSize = (v: number) => storage.setItem(K + "fontSize", v);
