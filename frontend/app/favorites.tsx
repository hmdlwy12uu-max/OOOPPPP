import { FlatList, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@react-native-vector-icons/feather";

import { InfoBanner } from "@/src/components/InfoBanner";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { toggleFavorite, useFavorites, type FavType } from "@/src/stores";
import { makeStyles, useTheme } from "@/src/theme";
import { fonts, radius, ROW, rtlText, spacing } from "@/src/ui";

const TYPE_LABEL: Record<FavType, string> = { ayah: "آية", dua: "دعاء", hadith: "حديث", dhikr: "ذكر", name: "اسم من أسماء الله" };

export default function FavoritesScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const favs = useFavorites();

  return (
    <View style={styles.screen} testID="favorites-screen">
      <ScreenHeader title="المفضلة" subtitle={`${favs.length} عنصرًا محفوظًا`} />
      <FlatList
        data={favs}
        keyExtractor={(f) => f.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: insets.bottom + 100 }}
        ListEmptyComponent={
          <InfoBanner
            testID="favorites-empty"
            icon="alert-circle"
            title="لا توجد عناصر بعد"
            body="اضغط على القلب في أي دعاء أو حديث، أو اضغط مطولًا على آية في المصحف لحفظها هنا."
          />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => item.route && router.push(item.route as never)}
            style={styles.card}
            testID={`fav-item-${item.id}`}
          >
            <View style={styles.top}>
              <Text style={styles.type}>{TYPE_LABEL[item.type]}</Text>
              <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
              <Pressable onPress={() => toggleFavorite(item)} hitSlop={10} style={styles.remove} testID={`fav-remove-${item.id}`}>
                <Feather name="trash-2" size={18} color={colors.muted} />
              </Pressable>
            </View>
            <Text style={styles.text} numberOfLines={6}>{item.text}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  card: { backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm, borderWidth: 1, borderColor: colors.border },
  top: { flexDirection: ROW, alignItems: "center", gap: spacing.sm },
  type: { fontFamily: fonts.textBold, fontSize: 11, color: colors.onBrandTertiary, backgroundColor: colors.brandTertiary, paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.sm, overflow: "hidden" },
  title: { ...rtlText, flex: 1, fontFamily: fonts.textBold, fontSize: 14, color: colors.brandPrimary },
  remove: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  text: { ...rtlText, fontFamily: fonts.display, fontSize: 19, lineHeight: 36, color: colors.onSurface },
}));
