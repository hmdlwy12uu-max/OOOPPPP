import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, BackHandler, FlatList, Platform, Pressable, ScrollView, Text, View, type ViewToken } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@react-native-vector-icons/feather";

import { playUri, stopSound, togglePause, useAudioLoading, usePaused, usePlayingId } from "@/src/audio";
import { Ornament } from "@/src/components/Ornament";
import { deleteSurahDownload, downloadSurah, surahSource, useDownloading, useDownloads } from "@/src/downloads";
import { FONT_SIZES, getFontSize, getReciterId, getSurah, RECITERS, saveFontSize, saveLastRead, saveReciterId } from "@/src/quran";
import { addHistory, markSurahRead, toggleFavorite, useFavorites, useKhatma } from "@/src/stores";
import { makeStyles, useTheme } from "@/src/theme";
import { showToast } from "@/src/toast";
import { alpha, fonts, radius, ROW, spacing, toArabicDigits } from "@/src/ui";

export default function SurahReader() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { id, ayah, reciter: reciterParam, autoplay } = useLocalSearchParams<{ id: string; ayah?: string; reciter?: string; autoplay?: string }>();
  const n = Math.min(114, Math.max(1, Number(id) || 1));
  const surah = getSurah(n);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<string>>(null);
  const [reciterId, setReciterId] = useState(reciterParam || "sudais");
  const [fontSize, setFontSize] = useState(26);
  const playingId = usePlayingId();
  const loading = useAudioLoading();
  const key = `quran-${n}-${reciterId}`;
  const isMine = playingId === key;
  const pausedState = usePaused();
  const paused = isMine && pausedState;
  const downloads = useDownloads();
  const downloading = useDownloading();
  const favs = useFavorites();
  const khatma = useKhatma();
  const isRead = khatma.readSurahs.includes(n);
  const isDownloaded = downloads.has(`${reciterId}-${n}`);
  const isDownloading = downloading.has(`${reciterId}-${n}`);
  const autoplayed = useRef(false);

  useEffect(() => {
    (reciterParam ? Promise.resolve(reciterParam) : getReciterId()).then((rid) => {
      setReciterId(rid);
      if (autoplay === "1" && !autoplayed.current) {
        autoplayed.current = true;
        startPlayback(rid);
      }
    });
    getFontSize().then(setFontSize);
    saveLastRead(n, Number(ayah) || 1);
    const sub = BackHandler.addEventListener("hardwareBackPress", () => false);
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, ayah]);

  useEffect(() => {
    const target = Number(ayah) - 1;
    if (target > 0) {
      const t = setTimeout(() => listRef.current?.scrollToIndex({ index: target, animated: false, viewPosition: 0 }), 300);
      return () => clearTimeout(t);
    }
  }, [ayah]);

  const onViewable = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const first = viewableItems.find((v) => v.isViewable && v.index != null);
    if (first?.index != null) saveLastRead(n, first.index + 1);
  }).current;

  const reciter = RECITERS.find((r) => r.id === reciterId) ?? RECITERS[0];

  const startPlayback = (rid: string) => {
    const r = RECITERS.find((x) => x.id === rid) ?? RECITERS[0];
    const src = surahSource(r, n);
    addHistory(n, r.id);
    playUri(`quran-${n}-${r.id}`, src.uri, () => markSurahRead(n), {
      title: `سورة ${surah.name}`,
      subtitle: `${r.name}${src.local ? " · دون اتصال" : ""}`,
      route: `/surah/${n}`,
    });
  };
  const onPlay = () => (isMine ? togglePause() : startPlayback(reciterId));
  const chooseReciter = (rid: string) => {
    setReciterId(rid);
    saveReciterId(rid);
    if (playingId?.startsWith(`quran-${n}-`)) startPlayback(rid);
  };

  const onDownload = async () => {
    if (Platform.OS === "web") return showToast("التنزيل متاح في التطبيق فقط");
    if (isDownloaded) {
      deleteSurahDownload(reciterId, n);
      return showToast("حُذفت النسخة المحفوظة");
    }
    try {
      await downloadSurah(reciter, n);
      showToast("تم الحفظ دون اتصال", `سورة ${surah.name} · ${reciter.name}`);
    } catch {
      showToast("تعذر التنزيل", "تحقق من الاتصال بالإنترنت");
    }
  };

  const changeFont = (dir: 1 | -1) => {
    const i = Math.max(0, Math.min(FONT_SIZES.length - 1, FONT_SIZES.indexOf(fontSize as (typeof FONT_SIZES)[number]) + dir));
    setFontSize(FONT_SIZES[i]);
    saveFontSize(FONT_SIZES[i]);
  };

  const favAyah = (index: number) => {
    const fid = `ayah-${n}-${index + 1}`;
    const added = toggleFavorite({ id: fid, type: "ayah", title: `سورة ${surah.name} · الآية ${toArabicDigits(String(index + 1))}`, text: surah.ayahs[index], route: `/surah/${n}?ayah=${index + 1}` });
    showToast(added ? "حُفظت الآية في المفضلة" : "أُزيلت الآية من المفضلة");
  };

  const toggleRead = () => {
    markSurahRead(n, !isRead);
    showToast(isRead ? "أُلغي تعليم السورة" : "تم تعليم السورة كمقروءة", isRead ? undefined : "تقدّمت ختمتك بارك الله فيك");
  };

  return (
    <View style={styles.screen} testID="surah-reader">
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} style={styles.back} testID="surah-back-button" hitSlop={8}>
          <Feather name="chevron-right" size={26} color={colors.brandPrimary} />
        </Pressable>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={styles.title} testID="surah-title">سُورَةُ {surah.name}</Text>
          <Text style={styles.sub}>
            {surah.type} · {toArabicDigits(String(surah.ayahs.length))} آية
          </Text>
        </View>
        <View style={styles.tools}>
          <Pressable onPress={() => changeFont(-1)} style={styles.tool} hitSlop={6} testID="font-smaller">
            <Text style={[styles.toolText, { fontSize: 13 }]}>أ-</Text>
          </Pressable>
          <Pressable onPress={() => changeFont(1)} style={styles.tool} hitSlop={6} testID="font-larger">
            <Text style={[styles.toolText, { fontSize: 18 }]}>أ+</Text>
          </Pressable>
          <Pressable onPress={toggleRead} style={styles.tool} hitSlop={6} testID="surah-mark-read">
            <Feather name={isRead ? "check-circle" : "circle"} size={20} color={isRead ? colors.success : colors.muted} />
          </Pressable>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={surah.ayahs}
        keyExtractor={(_, i) => String(i)}
        initialNumToRender={15}
        windowSize={11}
        extraData={`${fontSize}-${favs.length}`}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        onScrollToIndexFailed={(info) =>
          setTimeout(() => listRef.current?.scrollToIndex({ index: info.index, animated: false }), 250)
        }
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 190 + insets.bottom }}
        ListHeaderComponent={
          <View style={styles.banner}>
            <Ornament width={160} />
            {surah.basmala ? (
              <Text style={styles.basmala} testID="surah-basmala">{surah.basmala}</Text>
            ) : null}
            <Text style={styles.hint}>اضغط مطولًا على أي آية لحفظها في المفضلة</Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const fav = favs.some((f) => f.id === `ayah-${n}-${index + 1}`);
          return (
            <Pressable onLongPress={() => favAyah(index)} delayLongPress={350} style={[styles.ayahRow, fav && styles.ayahFav]} testID={`ayah-${index + 1}`}>
              <Text style={[styles.ayah, { fontSize, lineHeight: fontSize * 2.3 }]}>
                {item}
                <Text style={[styles.marker, { fontSize: fontSize - 4 }]}>{` ﴿${toArabicDigits(String(index + 1))}﴾`}</Text>
              </Text>
              {fav ? <Feather name="heart" size={14} color={colors.error} style={{ alignSelf: "flex-start" }} /> : null}
            </Pressable>
          );
        }}
      />

      <View style={[styles.player, { paddingBottom: insets.bottom + spacing.md }]} testID="quran-player">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {RECITERS.map((r) => {
            const sel = r.id === reciterId;
            return (
              <Pressable key={r.id} onPress={() => chooseReciter(r.id)} style={[styles.chip, sel && styles.chipSel]} testID={`reciter-chip-${r.id}`}>
                <Text style={[styles.chipText, sel && { color: colors.onBrandPrimary }]}>{r.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={styles.playerRow}>
          <Pressable onPress={onPlay} style={styles.playBtn} testID="quran-play-button">
            {isMine && loading ? (
              <ActivityIndicator color={colors.onBrandPrimary} />
            ) : (
              <Feather name={isMine && !paused ? "pause" : "play"} size={24} color={colors.onBrandPrimary} />
            )}
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.playerTitle}>{isMine ? (loading ? "جارٍ التحميل..." : paused ? "متوقف مؤقتًا" : "يتلو الآن") : "استمع للسورة"}</Text>
            <Text style={styles.playerSub}>
              بصوت الشيخ {reciter.name}
              {isDownloaded ? " · محفوظة دون اتصال" : ""}
            </Text>
          </View>
          <Pressable onPress={onDownload} style={styles.stopBtn} testID="quran-download-button" hitSlop={8} disabled={isDownloading}>
            {isDownloading ? (
              <ActivityIndicator size="small" color={colors.brandPrimary} />
            ) : (
              <Feather name={isDownloaded ? "check" : "download"} size={18} color={isDownloaded ? colors.success : colors.brandPrimary} />
            )}
          </Pressable>
          {isMine ? (
            <Pressable onPress={stopSound} style={styles.stopBtn} testID="quran-stop-button" hitSlop={8}>
              <Feather name="square" size={18} color={colors.brandPrimary} />
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: ROW,
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.surface,
  },
  back: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  tools: { flexDirection: ROW, alignItems: "center" },
  tool: { width: 36, height: 44, alignItems: "center", justifyContent: "center" },
  toolText: { fontFamily: fonts.textBold, color: colors.brandPrimary },
  title: { fontFamily: fonts.quran, fontSize: 24, lineHeight: 44, color: colors.brandPrimary },
  sub: { fontFamily: fonts.text, fontSize: 12, color: colors.muted },
  banner: { paddingVertical: spacing.xl, gap: spacing.md, alignItems: "center" },
  basmala: { fontFamily: fonts.quran, fontSize: 26, lineHeight: 56, color: colors.brandPrimary, textAlign: "center" },
  hint: { fontFamily: fonts.text, fontSize: 11, color: colors.muted },
  ayahRow: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.divider, gap: spacing.xs },
  ayahFav: { backgroundColor: alpha(colors.brandPrimary, 0.08), borderRadius: radius.sm, paddingHorizontal: spacing.sm },
  ayah: { fontFamily: fonts.quran, color: colors.onSurface, textAlign: "right", writingDirection: "rtl" },
  marker: { fontFamily: fonts.quran, color: colors.brandPrimary },
  player: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: spacing.md,
    gap: spacing.md,
    backgroundColor: alpha(colors.surfaceSecondary, 0.98),
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  chips: { gap: spacing.sm, paddingHorizontal: spacing.lg, flexDirection: ROW },
  chip: {
    flexShrink: 0,
    height: 36,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  chipSel: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  chipText: { fontFamily: fonts.textMedium, fontSize: 13, color: colors.onSurfaceSecondary },
  playerRow: { flexDirection: ROW, alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg },
  playBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.brandPrimary, alignItems: "center", justifyContent: "center" },
  stopBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: colors.brandPrimary, alignItems: "center", justifyContent: "center" },
  playerTitle: { fontFamily: fonts.textBold, fontSize: 15, color: colors.onSurface, textAlign: "right" },
  playerSub: { fontFamily: fonts.text, fontSize: 12, color: colors.muted, textAlign: "right" },
}));
