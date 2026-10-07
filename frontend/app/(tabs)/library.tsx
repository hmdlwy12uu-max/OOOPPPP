import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@react-native-vector-icons/feather";

import { PatternHeader } from "@/src/components/PatternHeader";
import { usesNativeTabs } from "@/src/navigation";
import { khatmaStats, useFavorites, useKhatma } from "@/src/stores";
import { makeStyles, useTheme } from "@/src/theme";
import { fonts, radius, ROW, rtlText, spacing, toArabicDigits } from "@/src/ui";

type Tile = { href: Href; title: string; sub: string; icon: string; testID: string };

const TILES: Tile[] = [
  { href: "/daily/morning", title: "أذكار الصباح", sub: "٢٢ ذكرًا مع عدّاد", icon: "sun", testID: "lib-morning" },
  { href: "/daily/evening", title: "أذكار المساء", sub: "٢٢ ذكرًا مع عدّاد", icon: "moon", testID: "lib-evening" },
  { href: "/duas", title: "الأدعية", sub: "من القرآن والسنة", icon: "feather", testID: "lib-duas" },
  { href: "/hadith", title: "الأحاديث", sub: "أحاديث صحيحة مختارة", icon: "book", testID: "lib-hadith" },
  { href: "/stories", title: "قصص الأنبياء", sub: "٨ قصص بالصوت", icon: "users", testID: "lib-stories" },
  { href: "/names", title: "أسماء الله الحسنى", sub: "٩٩ اسمًا ومعانيها", icon: "star", testID: "lib-names" },
  { href: "/tasbih", title: "المسبحة", sub: "عدّاد التسبيح", icon: "circle", testID: "lib-tasbih" },
  { href: "/search", title: "البحث في القرآن", sub: "ابحث عن أي آية", icon: "search", testID: "lib-search" },
  { href: "/history", title: "سجل الاستماع", sub: "آخر ما استمعت إليه", icon: "clock", testID: "lib-history" },
  { href: "/downloads", title: "التنزيلات", sub: "السور المحفوظة دون اتصال", icon: "download", testID: "lib-downloads" },
];

export default function LibraryScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomChrome = usesNativeTabs ? insets.bottom : 0;
  const router = useRouter();
  const favs = useFavorites();
  const khatma = useKhatma();
  const stats = khatmaStats(khatma);

  return (
    <View style={styles.screen} testID="library-screen">
      <PatternHeader title="المكتبة" subtitle="أذكار وأدعية وأحاديث وقصص · كلها تعمل دون إنترنت" />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: bottomChrome + 100 }}>
        <View style={styles.rowCards}>
          <Pressable onPress={() => router.push("/khatma")} style={[styles.wide, { flex: 1 }]} testID="lib-khatma">
            <View style={styles.wideTop}>
              <Feather name="target" size={18} color={colors.brandPrimary} />
              <Text style={styles.wideTitle}>ختمة القرآن</Text>
            </View>
            <Text style={styles.big}>{toArabicDigits(String(stats.pct))}٪</Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${stats.pct}%` }]} />
            </View>
            <Text style={styles.wideSub}>{toArabicDigits(String(khatma.readSurahs.length))} من ١١٤ سورة</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/favorites")} style={[styles.wide, { flex: 1 }]} testID="lib-favorites">
            <View style={styles.wideTop}>
              <Feather name="heart" size={18} color={colors.error} />
              <Text style={styles.wideTitle}>المفضلة</Text>
            </View>
            <Text style={styles.big}>{toArabicDigits(String(favs.length))}</Text>
            <Text style={styles.wideSub}>آيات وأدعية وأحاديث محفوظة</Text>
          </Pressable>
        </View>

        <View style={styles.grid}>
          {TILES.map((t) => (
            <Pressable
              key={t.testID}
              onPress={() => router.push(t.href)}
              style={({ pressed }) => [styles.tile, pressed && { backgroundColor: colors.surfaceTertiary }]}
              testID={t.testID}
            >
              <View style={styles.tileIcon}>
                <Feather name={t.icon as never} size={22} color={colors.brandPrimary} />
              </View>
              <Text style={styles.tileTitle}>{t.title}</Text>
              <Text style={styles.tileSub} numberOfLines={1}>{t.sub}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  rowCards: { flexDirection: ROW, gap: spacing.md },
  wide: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  wideTop: { flexDirection: ROW, alignItems: "center", gap: spacing.sm },
  wideTitle: { ...rtlText, fontFamily: fonts.textBold, fontSize: 14, color: colors.onSurface },
  big: { ...rtlText, fontFamily: fonts.displayBold, fontSize: 32, color: colors.brandPrimary },
  wideSub: { ...rtlText, fontFamily: fonts.text, fontSize: 12, color: colors.muted },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.surfaceTertiary, overflow: "hidden", flexDirection: ROW },
  fill: { height: 6, backgroundColor: colors.brandPrimary },
  grid: { flexDirection: ROW, flexWrap: "wrap", gap: spacing.md },
  tile: {
    width: "47.5%",
    flexGrow: 1,
    minHeight: 120,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "flex-end",
  },
  tileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  tileTitle: { ...rtlText, fontFamily: fonts.textBold, fontSize: 15, color: colors.onSurface },
  tileSub: { ...rtlText, fontFamily: fonts.text, fontSize: 12, color: colors.muted },
}));
