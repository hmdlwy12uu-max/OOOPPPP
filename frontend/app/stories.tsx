import { FlatList, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@react-native-vector-icons/feather";

import { ScreenHeader } from "@/src/components/ScreenHeader";
import { STORIES } from "@/src/content/stories";
import { usePlayingId } from "@/src/audio";
import { makeStyles, useTheme } from "@/src/theme";
import { fonts, radius, ROW, rtlText, spacing } from "@/src/ui";

export default function StoriesScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const playing = usePlayingId();

  return (
    <View style={styles.screen} testID="stories-screen">
      <ScreenHeader title="قصص الأنبياء" subtitle="سرد موجز من القرآن والسنة · بالصوت" />
      <FlatList
        data={STORIES}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: insets.bottom + 100 }}
        renderItem={({ item }) => {
          const active = playing === `story-${item.id}`;
          return (
            <Pressable
              onPress={() => router.push({ pathname: "/story/[id]", params: { id: item.id } })}
              style={({ pressed }) => [styles.card, pressed && { backgroundColor: colors.surfaceTertiary }]}
              testID={`story-${item.id}`}
            >
              <View style={styles.icon}>
                <Feather name={active ? "volume-2" : "book-open"} size={20} color={colors.brandPrimary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.prophet}>{item.prophet}</Text>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.summary} numberOfLines={2}>{item.summary}</Text>
              </View>
              <Feather name="chevron-left" size={20} color={colors.muted} />
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  card: {
    flexDirection: ROW,
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surfaceTertiary, alignItems: "center", justifyContent: "center" },
  prophet: { ...rtlText, fontFamily: fonts.displayBold, fontSize: 20, color: colors.brandPrimary },
  title: { ...rtlText, fontFamily: fonts.textBold, fontSize: 14, color: colors.onSurface },
  summary: { ...rtlText, fontFamily: fonts.text, fontSize: 12, lineHeight: 18, color: colors.muted, marginTop: 2 },
}));
