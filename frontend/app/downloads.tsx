import { useState } from "react";
import { Alert, FlatList, Platform, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@react-native-vector-icons/feather";

import { InfoBanner } from "@/src/components/InfoBanner";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { clearAllDownloads, deleteSurahDownload, downloadSurah, formatBytes, listDownloads, useDownloading, useDownloads } from "@/src/downloads";
import { getReciter, getReciterId, getSurah, getSurahs } from "@/src/quran";
import { makeStyles, useTheme } from "@/src/theme";
import { showToast } from "@/src/toast";
import { fonts, radius, ROW, rtlText, spacing, toArabicDigits } from "@/src/ui";

// Offline manager: list / delete downloaded recitations, bulk-download short surahs.
export default function DownloadsScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  useDownloads();
  const inflight = useDownloading();
  const items = listDownloads().sort((a, b) => a.n - b.n);
  const total = items.reduce((s, d) => s + d.size, 0);
  const [bulk, setBulk] = useState(false);

  const downloadJuzAmma = async () => {
    if (Platform.OS === "web") return showToast("التنزيل متاح في التطبيق فقط");
    setBulk(true);
    const r = getReciter(await getReciterId());
    let ok = 0;
    for (const s of getSurahs().slice(77)) {
      try {
        await downloadSurah(r, s.n);
        ok++;
      } catch {}
    }
    setBulk(false);
    showToast("اكتمل التنزيل", `${toArabicDigits(String(ok))} سورة من جزء عمّ بصوت ${r.name}`);
  };

  const onClear = () =>
    Alert.alert("حذف كل التنزيلات", `سيتم تحرير ${formatBytes(total)}.`, [
      { text: "إلغاء", style: "cancel" },
      { text: "حذف", style: "destructive", onPress: clearAllDownloads },
    ]);

  return (
    <View style={styles.screen} testID="downloads-screen">
      <ScreenHeader title="التنزيلات" subtitle={items.length ? `${toArabicDigits(String(items.length))} سورة · ${formatBytes(total)}` : "لا توجد سور محفوظة بعد"} />
      <FlatList
        data={items}
        keyExtractor={(d) => `${d.reciterId}-${d.n}`}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm, paddingBottom: insets.bottom + 100 }}
        ListHeaderComponent={
          <View style={{ gap: spacing.md, marginBottom: spacing.md }}>
            <InfoBanner
              testID="downloads-info"
              icon="alert-circle"
              title="استمع دون إنترنت"
              body="من داخل أي سورة اضغط زر التنزيل بجانب القارئ لحفظها على جهازك. المصحف والأذكار والأدعية متاحة دائمًا دون اتصال."
            />
            <Pressable onPress={downloadJuzAmma} disabled={bulk || inflight.size > 0} style={[styles.primary, (bulk || inflight.size > 0) && { opacity: 0.6 }]} testID="downloads-juz-amma">
              <Feather name="download-cloud" size={18} color={colors.onBrandPrimary} />
              <Text style={styles.primaryText}>{bulk ? `جارٍ التنزيل... (${toArabicDigits(String(inflight.size))})` : "تنزيل جزء عمّ كاملًا بالقارئ الحالي"}</Text>
            </Pressable>
          </View>
        }
        ListFooterComponent={
          items.length ? (
            <Pressable onPress={onClear} style={styles.clear} testID="downloads-clear">
              <Feather name="trash-2" size={16} color={colors.error} />
              <Text style={styles.clearText}>حذف كل التنزيلات</Text>
            </Pressable>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.row} testID={`download-${item.reciterId}-${item.n}`}>
            <Pressable onPress={() => router.push({ pathname: "/surah/[id]", params: { id: String(item.n), reciter: item.reciterId, autoplay: "1" } })} style={styles.icon}>
              <Feather name="play" size={18} color={colors.brandPrimary} />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>سورة {getSurah(item.n).name}</Text>
              <Text style={styles.meta}>{getReciter(item.reciterId).name} · {formatBytes(item.size)}</Text>
            </View>
            <Pressable onPress={() => deleteSurahDownload(item.reciterId, item.n)} hitSlop={10} style={styles.del} testID={`download-delete-${item.n}`}>
              <Feather name="trash-2" size={18} color={colors.muted} />
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  primary: { flexDirection: ROW, alignItems: "center", justifyContent: "center", gap: spacing.sm, minHeight: 50, borderRadius: radius.pill, backgroundColor: colors.brandPrimary },
  primaryText: { fontFamily: fonts.textBold, fontSize: 14, color: colors.onBrandPrimary },
  row: { flexDirection: ROW, alignItems: "center", gap: spacing.md, minHeight: 64, paddingHorizontal: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.divider },
  icon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surfaceTertiary, alignItems: "center", justifyContent: "center" },
  name: { ...rtlText, fontFamily: fonts.displayBold, fontSize: 18, color: colors.onSurface },
  meta: { ...rtlText, fontFamily: fonts.text, fontSize: 12, color: colors.muted },
  del: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  clear: { flexDirection: ROW, alignItems: "center", justifyContent: "center", gap: spacing.xs, minHeight: 44, marginTop: spacing.md },
  clearText: { fontFamily: fonts.textMedium, fontSize: 13, color: colors.error },
}));
