import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@react-native-vector-icons/feather";

import { ScreenHeader } from "@/src/components/ScreenHeader";
import { NAMES } from "@/src/content/names";
import { normalizeArabic } from "@/src/quran";
import { toggleFavorite, useFavorites } from "@/src/stores";
import { makeStyles, useTheme } from "@/src/theme";
import { fonts, radius, ROW, rtlText, spacing, toArabicDigits } from "@/src/ui";

export default function NamesScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState("");
  const favs = useFavorites();
  const list = useMemo(() => {
    const nq = normalizeArabic(q);
    return nq ? NAMES.filter((n) => normalizeArabic(n.name).includes(nq) || n.meaning.includes(nq)) : NAMES;
  }, [q]);

  return (
    <View style={styles.screen} testID="names-screen">
      <ScreenHeader title="أسماء الله الحسنى" subtitle="«إن لله تسعة وتسعين اسمًا من أحصاها دخل الجنة»" />
      <View style={styles.search}>
        <Feather name="search" size={18} color={colors.muted} />
        <TextInput value={q} onChangeText={setQ} placeholder="ابحث عن اسم أو معنى" placeholderTextColor={colors.muted} style={styles.input} testID="names-search" />
      </View>
      <FlatList
        data={list}
        keyExtractor={(n) => String(n.n)}
        numColumns={2}
        columnWrapperStyle={{ gap: spacing.md, flexDirection: ROW }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: insets.bottom + 100 }}
        renderItem={({ item }) => {
          const id = `name-${item.n}`;
          const fav = favs.some((f) => f.id === id);
          return (
            <Pressable
              onLongPress={() => toggleFavorite({ id, type: "name", title: item.name, text: item.meaning, route: "/names" })}
              style={styles.card}
              testID={`name-${item.n}`}
            >
              <View style={styles.top}>
                <Text style={styles.num}>{toArabicDigits(String(item.n))}</Text>
                {fav ? <Feather name="heart" size={14} color={colors.error} /> : null}
              </View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meaning}>{item.meaning}</Text>
            </Pressable>
          );
        }}
        ListFooterComponent={<Text style={styles.hint}>اضغط مطولًا على أي اسم لإضافته إلى المفضلة</Text>}
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
    height: 46,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: { ...rtlText, flex: 1, height: 46, fontFamily: fonts.text, fontSize: 15, color: colors.onSurface },
  card: {
    flex: 1,
    minHeight: 120,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "flex-end",
  },
  top: { flexDirection: ROW, alignItems: "center", gap: spacing.xs, alignSelf: "stretch", justifyContent: "space-between" },
  num: { fontFamily: fonts.textBold, fontSize: 12, color: colors.muted },
  name: { ...rtlText, fontFamily: fonts.ruqaa, fontSize: 26, lineHeight: 44, color: colors.brandPrimary },
  meaning: { ...rtlText, fontFamily: fonts.text, fontSize: 12, lineHeight: 18, color: colors.onSurfaceTertiary },
  hint: { fontFamily: fonts.text, fontSize: 11, color: colors.muted, textAlign: "center", marginTop: spacing.md },
}));
