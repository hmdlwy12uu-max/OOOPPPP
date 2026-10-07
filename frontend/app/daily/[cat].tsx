import { useMemo } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@react-native-vector-icons/feather";

import { ScreenHeader } from "@/src/components/ScreenHeader";
import { CATEGORY_META, getDailyAdhkar, type DailyCategory, type DailyDhikr } from "@/src/content/daily";
import { bumpCount, resetCounts, toggleFavorite, useCategoryCounts, useIsFavorite } from "@/src/stores";
import { makeStyles, useTheme } from "@/src/theme";
import { showToast } from "@/src/toast";
import { fonts, radius, ROW, rtlText, spacing, toArabicDigits } from "@/src/ui";

// Morning / evening adhkar with a tap counter per dhikr (progress saved per day).
export default function DailyAdhkarScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { cat: raw } = useLocalSearchParams<{ cat: string }>();
  const cat: DailyCategory = raw === "evening" ? "evening" : "morning";
  const meta = CATEGORY_META[cat];
  const items = useMemo(() => getDailyAdhkar(cat), [cat]);
  const counts = useCategoryCounts(cat);
  const done = items.filter((d) => (counts[d.id] ?? 0) >= d.count).length;
  const total = items.reduce((s, d) => s + d.count, 0);
  const progress = items.reduce((s, d) => s + Math.min(d.count, counts[d.id] ?? 0), 0);

  return (
    <View style={styles.screen} testID={`daily-${cat}-screen`}>
      <ScreenHeader title={meta.title} subtitle={meta.subtitle} />
      <View style={styles.progressCard}>
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={styles.progressText}>
            {toArabicDigits(String(done))} من {toArabicDigits(String(items.length))} ذكرًا · {toArabicDigits(String(progress))}/{toArabicDigits(String(total))}
          </Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.round((progress / total) * 100)}%` }]} />
          </View>
        </View>
        <Pressable onPress={() => resetCounts(cat)} style={styles.reset} hitSlop={8} testID="daily-reset">
          <Feather name="rotate-ccw" size={16} color={colors.brandPrimary} />
          <Text style={styles.resetText}>إعادة</Text>
        </Pressable>
      </View>
      <FlatList
        data={items}
        keyExtractor={(d) => d.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: insets.bottom + 100 }}
        renderItem={({ item, index }) => <DhikrItem cat={cat} d={item} index={index} count={counts[item.id] ?? 0} />}
        ListFooterComponent={<Text style={styles.credit}>المصدر: حصن المسلم من أذكار الكتاب والسنة</Text>}
      />
    </View>
  );
}

function DhikrItem({ cat, d, index, count }: { cat: DailyCategory; d: DailyDhikr; index: number; count: number }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const finished = count >= d.count;
  const favId = `daily-${d.id}`;
  const fav = useIsFavorite(favId);

  const onTap = () => {
    if (finished) return;
    const next = bumpCount(cat, d.id, d.count);
    Haptics.impactAsync(next >= d.count ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };
  const onFav = () => {
    const added = toggleFavorite({ id: favId, type: "dhikr", title: CATEGORY_META[cat].title, text: d.text, route: `/daily/${cat}` });
    showToast(added ? "أُضيف إلى المفضلة" : "أُزيل من المفضلة");
  };

  return (
    <Pressable onPress={onTap} style={[styles.card, finished && styles.cardDone]} testID={`daily-item-${d.id}`}>
      <View style={styles.top}>
        <View style={styles.numWrap}>
          <Text style={styles.num}>{toArabicDigits(String(index + 1))}</Text>
        </View>
        <Text style={styles.source} numberOfLines={1}>{d.source}</Text>
        <Pressable onPress={onFav} hitSlop={10} style={styles.favBtn} testID={`daily-fav-${d.id}`}>
          <Feather name="heart" size={18} color={fav ? colors.error : colors.muted} />
        </Pressable>
      </View>
      <Text style={styles.text}>{d.text}</Text>
      {d.virtue ? <Text style={styles.virtue}>{d.virtue}</Text> : null}
      <View style={styles.bottom}>
        <View style={[styles.counter, finished && styles.counterDone]} testID={`daily-counter-${d.id}`}>
          {finished ? <Feather name="check" size={16} color={colors.onBrandPrimary} /> : null}
          <Text style={[styles.counterText, finished && { color: colors.onBrandPrimary }]}>
            {toArabicDigits(String(count))} / {toArabicDigits(String(d.count))}
          </Text>
        </View>
        <Text style={styles.hint}>{finished ? "تم بحمد الله" : "اضغط على البطاقة للعدّ"}</Text>
      </View>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  progressCard: {
    flexDirection: ROW,
    alignItems: "center",
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressText: { ...rtlText, fontFamily: fonts.textMedium, fontSize: 13, color: colors.onSurfaceSecondary },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.surfaceTertiary, overflow: "hidden", flexDirection: ROW },
  fill: { height: 6, backgroundColor: colors.brandPrimary },
  reset: { flexDirection: ROW, alignItems: "center", gap: 4, minHeight: 40, paddingHorizontal: spacing.sm },
  resetText: { fontFamily: fonts.textBold, fontSize: 13, color: colors.brandPrimary },
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardDone: { borderColor: colors.brandSecondary, opacity: 0.85 },
  top: { flexDirection: ROW, alignItems: "center", gap: spacing.sm },
  numWrap: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: colors.brandPrimary, alignItems: "center", justifyContent: "center" },
  num: { fontFamily: fonts.textBold, fontSize: 12, color: colors.brandPrimary },
  source: { ...rtlText, flex: 1, fontFamily: fonts.text, fontSize: 12, color: colors.muted },
  favBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  text: { ...rtlText, fontFamily: fonts.display, fontSize: 22, lineHeight: 42, color: colors.onSurface },
  virtue: { ...rtlText, fontFamily: fonts.text, fontSize: 12, lineHeight: 19, color: colors.onSurfaceTertiary },
  bottom: { flexDirection: ROW, alignItems: "center", gap: spacing.md },
  counter: {
    flexDirection: ROW,
    alignItems: "center",
    gap: spacing.xs,
    minHeight: 40,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.brandPrimary,
  },
  counterDone: { backgroundColor: colors.brandPrimary },
  counterText: { fontFamily: fonts.textBold, fontSize: 15, color: colors.brandPrimary },
  hint: { ...rtlText, flex: 1, fontFamily: fonts.text, fontSize: 12, color: colors.muted },
  credit: { fontFamily: fonts.text, fontSize: 11, color: colors.muted, textAlign: "center", marginTop: spacing.md },
}));
