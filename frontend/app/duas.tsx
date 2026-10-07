import { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ContentCard } from "@/src/components/ContentCard";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { DUA_CATS, DUAS } from "@/src/content/duas";
import { makeStyles, useTheme } from "@/src/theme";
import { fonts, radius, ROW, spacing } from "@/src/ui";

export default function DuasScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [cat, setCat] = useState<string | null>(null);
  const list = useMemo(() => (cat ? DUAS.filter((d) => d.cat === cat) : DUAS), [cat]);

  return (
    <View style={styles.screen} testID="duas-screen">
      <ScreenHeader title="الأدعية" subtitle="من القرآن الكريم والسنة الصحيحة" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={{ flexGrow: 0 }}>
        {[null, ...DUA_CATS].map((c) => {
          const sel = c === cat;
          return (
            <Pressable key={c ?? "all"} onPress={() => setCat(c)} style={[styles.chip, sel && styles.chipSel]} testID={`dua-cat-${c ?? "all"}`}>
              <Text style={[styles.chipText, sel && { color: colors.onBrandPrimary }]}>{c ?? "الكل"}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <FlatList
        data={list}
        keyExtractor={(d) => d.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: insets.bottom + 100 }}
        renderItem={({ item }) => (
          <ContentCard id={item.id} favType="dua" title={item.title} text={item.text} source={item.source} route="/duas" />
        )}
      />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  chips: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, flexDirection: ROW },
  chip: {
    height: 36,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSecondary,
  },
  chipSel: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  chipText: { fontFamily: fonts.textMedium, fontSize: 13, color: colors.onSurfaceSecondary },
}));
