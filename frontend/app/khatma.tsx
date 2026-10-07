import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@react-native-vector-icons/feather";

import { ScreenHeader } from "@/src/components/ScreenHeader";
import { getSurahs } from "@/src/quran";
import { khatmaStats, markSurahRead, restartKhatma, setKhatmaTarget, useKhatma } from "@/src/stores";
import { makeStyles, useTheme } from "@/src/theme";
import { showToast } from "@/src/toast";
import { fonts, radius, ROW, rtlText, spacing, toArabicDigits } from "@/src/ui";

const TARGETS = [30, 60, 90];

export default function KhatmaScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const k = useKhatma();
  const s = khatmaStats(k);
  const surahs = getSurahs();
  const nextSurah = surahs.find((x) => !k.readSurahs.includes(x.n));

  const onRestart = () => {
    const go = () => {
      restartKhatma(s.done);
      showToast(s.done ? "تقبّل الله، ختمة مباركة!" : "بدأت ختمة جديدة");
    };
    Alert.alert(s.done ? "بدء ختمة جديدة" : "إعادة الختمة", "سيُعاد ضبط السور المقروءة.", [
      { text: "إلغاء", style: "cancel" },
      { text: "تأكيد", style: "destructive", onPress: go },
    ]);
  };

  return (
    <View style={styles.screen} testID="khatma-screen">
      <ScreenHeader title="ختمة القرآن" subtitle={k.completions ? `أتممت ${toArabicDigits(String(k.completions))} ختمة من قبل` : "تابع تقدّمك في ختم المصحف"} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: insets.bottom + 100 }}>
        <View style={styles.hero}>
          <Text style={styles.pct}>{toArabicDigits(String(s.pct))}٪</Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${s.pct}%` }]} />
          </View>
          <Text style={styles.heroSub}>
            {toArabicDigits(String(s.readAyahs))} من ٦٢٣٦ آية · {toArabicDigits(String(k.readSurahs.length))} من ١١٤ سورة
          </Text>
          <View style={styles.statsRow}>
            <Stat label="اليوم" value={toArabicDigits(String(s.days))} />
            <Stat label="المتبقي (يوم)" value={toArabicDigits(String(s.remainingDays))} />
            <Stat label="آيات/يوم" value={toArabicDigits(String(s.dailyTarget))} />
          </View>
        </View>

        {s.done ? (
          <Pressable onPress={onRestart} style={styles.primary} testID="khatma-new">
            <Feather name="award" size={18} color={colors.onBrandPrimary} />
            <Text style={styles.primaryText}>تقبّل الله! ابدأ ختمة جديدة</Text>
          </Pressable>
        ) : nextSurah ? (
          <Pressable onPress={() => router.push({ pathname: "/surah/[id]", params: { id: String(nextSurah.n) } })} style={styles.primary} testID="khatma-continue">
            <Feather name="book-open" size={18} color={colors.onBrandPrimary} />
            <Text style={styles.primaryText}>تابع: سورة {nextSurah.name}</Text>
          </Pressable>
        ) : null}

        <Text style={styles.label}>هدف الختمة</Text>
        <View style={styles.chips}>
          {TARGETS.map((t) => {
            const sel = k.targetDays === t;
            return (
              <Pressable key={t} onPress={() => setKhatmaTarget(t)} style={[styles.chip, sel && styles.chipSel]} testID={`khatma-target-${t}`}>
                <Text style={[styles.chipText, sel && { color: colors.onBrandPrimary }]}>{toArabicDigits(String(t))} يومًا</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>السور · اضغط لتعليم السورة كمقروءة</Text>
        <View style={styles.grid}>
          {surahs.map((x) => {
            const read = k.readSurahs.includes(x.n);
            return (
              <Pressable key={x.n} onPress={() => markSurahRead(x.n, !read)} style={[styles.cell, read && styles.cellRead]} testID={`khatma-surah-${x.n}`}>
                <Text style={[styles.cellText, read && { color: colors.onBrandPrimary }]}>{toArabicDigits(String(x.n))}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable onPress={onRestart} style={styles.secondary} testID="khatma-restart">
          <Feather name="rotate-ccw" size={16} color={colors.brandPrimary} />
          <Text style={styles.secondaryText}>إعادة الختمة من البداية</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const styles = useStyles();
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  hero: { backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.md, borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  pct: { fontFamily: fonts.displayBold, fontSize: 56, lineHeight: 70, color: colors.brandPrimary },
  track: { alignSelf: "stretch", height: 10, borderRadius: 5, backgroundColor: colors.surfaceTertiary, overflow: "hidden", flexDirection: ROW },
  fill: { height: 10, backgroundColor: colors.brandPrimary },
  heroSub: { fontFamily: fonts.text, fontSize: 13, color: colors.muted, textAlign: "center" },
  statsRow: { flexDirection: ROW, gap: spacing.md, alignSelf: "stretch" },
  stat: { flex: 1, alignItems: "center", padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.surfaceTertiary },
  statValue: { fontFamily: fonts.textBold, fontSize: 18, color: colors.onSurface },
  statLabel: { fontFamily: fonts.text, fontSize: 11, color: colors.muted },
  primary: { flexDirection: ROW, alignItems: "center", justifyContent: "center", gap: spacing.sm, minHeight: 52, borderRadius: radius.pill, backgroundColor: colors.brandPrimary },
  primaryText: { fontFamily: fonts.textBold, fontSize: 16, color: colors.onBrandPrimary },
  label: { ...rtlText, fontFamily: fonts.textMedium, fontSize: 13, color: colors.onSurfaceTertiary },
  chips: { flexDirection: ROW, gap: spacing.sm },
  chip: { flex: 1, height: 40, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.borderStrong, alignItems: "center", justifyContent: "center", backgroundColor: colors.surfaceSecondary },
  chipSel: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  chipText: { fontFamily: fonts.textMedium, fontSize: 14, color: colors.onSurfaceSecondary },
  grid: { flexDirection: ROW, flexWrap: "wrap", gap: 6 },
  cell: { width: "9.4%", aspectRatio: 1, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  cellRead: { backgroundColor: colors.brandSecondary, borderColor: colors.brandSecondary },
  cellText: { fontFamily: fonts.textMedium, fontSize: 11, color: colors.onSurfaceSecondary },
  secondary: { flexDirection: ROW, alignItems: "center", justifyContent: "center", gap: spacing.sm, minHeight: 48, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.brandPrimary },
  secondaryText: { fontFamily: fonts.textBold, fontSize: 14, color: colors.brandPrimary },
}));
