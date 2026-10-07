import { useDeferredValue, useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@react-native-vector-icons/feather";

import { ScreenHeader } from "@/src/components/ScreenHeader";
import { getSurah, searchAyahs } from "@/src/quran";
import { makeStyles, useTheme } from "@/src/theme";
import { fonts, radius, ROW, rtlText, spacing, toArabicDigits } from "@/src/ui";

// Full-text search across all ayahs (works offline — the mushaf is bundled).
export default function SearchScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [q, setQ] = useState("");
  const dq = useDeferredValue(q);
  const hits = useMemo(() => searchAyahs(dq), [dq]);

  return (
    <View style={styles.screen} testID="search-screen">
      <ScreenHeader title="البحث في القرآن" subtitle="ابحث بكلمة أو جزء من آية (دون تشكيل)" />
      <View style={styles.search}>
        <Feather name="search" size={18} color={colors.muted} />
        <TextInput
          value={q}
          onChangeText={setQ}
          autoFocus
          placeholder="مثال: الصبر، رحمة، ولا تهنوا"
          placeholderTextColor={colors.muted}
          style={styles.input}
          testID="ayah-search-input"
          returnKeyType="search"
        />
        {q ? (
          <Pressable onPress={() => setQ("")} hitSlop={12} testID="ayah-search-clear">
            <Feather name="x" size={18} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
      {dq.trim().length >= 2 ? (
        <Text style={styles.count} testID="ayah-search-count">
          {hits.length ? `${toArabicDigits(String(hits.length))} نتيجة${hits.length >= 60 ? " (أول ٦٠)" : ""}` : "لا توجد نتائج"}
        </Text>
      ) : null}
      <FlatList
        data={hits}
        keyExtractor={(h) => `${h.surah}:${h.ayah}`}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm, paddingBottom: insets.bottom + 100 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: "/surah/[id]", params: { id: String(item.surah), ayah: String(item.ayah) } })}
            style={styles.row}
            testID={`ayah-hit-${item.surah}-${item.ayah}`}
          >
            <Text style={styles.ayah}>{item.text}</Text>
            <Text style={styles.ref}>
              سورة {getSurah(item.surah).name} · الآية {toArabicDigits(String(item.ayah))}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  search: {
    flexDirection: ROW,
    alignItems: "center",
    gap: spacing.sm,
    height: 48,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: { ...rtlText, flex: 1, height: 48, fontFamily: fonts.text, fontSize: 15, color: colors.onSurface },
  count: { ...rtlText, fontFamily: fonts.text, fontSize: 12, color: colors.muted, paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  row: { backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, padding: spacing.lg, gap: spacing.xs, borderWidth: 1, borderColor: colors.divider },
  ayah: { ...rtlText, fontFamily: fonts.quran, fontSize: 20, lineHeight: 40, color: colors.onSurface },
  ref: { ...rtlText, fontFamily: fonts.textMedium, fontSize: 12, color: colors.brandPrimary },
}));
