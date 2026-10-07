import { FlatList, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@react-native-vector-icons/feather";

import { InfoBanner } from "@/src/components/InfoBanner";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { getReciter, getSurah } from "@/src/quran";
import { clearHistory, useHistory } from "@/src/stores";
import { makeStyles, useTheme } from "@/src/theme";
import { fonts, radius, ROW, rtlText, spacing } from "@/src/ui";

function ago(ts: number) {
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 1) return "الآن";
  if (m < 60) return `قبل ${m} دقيقة`;
  const h = Math.round(m / 60);
  if (h < 24) return `قبل ${h} ساعة`;
  return `قبل ${Math.round(h / 24)} يوم`;
}

export default function HistoryScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const items = useHistory();

  return (
    <View style={styles.screen} testID="history-screen">
      <ScreenHeader title="سجل الاستماع" subtitle="آخر السور التي استمعت إليها" />
      <FlatList
        data={items}
        keyExtractor={(h) => `${h.surah}-${h.reciterId}`}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm, paddingBottom: insets.bottom + 100 }}
        ListEmptyComponent={<InfoBanner testID="history-empty" icon="alert-circle" title="السجل فارغ" body="شغّل أي سورة من المصحف وستظهر هنا لتعود إليها بسهولة." />}
        ListFooterComponent={
          items.length ? (
            <Pressable onPress={clearHistory} style={styles.clear} testID="history-clear">
              <Feather name="trash-2" size={16} color={colors.muted} />
              <Text style={styles.clearText}>مسح السجل</Text>
            </Pressable>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: "/surah/[id]", params: { id: String(item.surah), reciter: item.reciterId, autoplay: "1" } })}
            style={styles.row}
            testID={`history-${item.surah}-${item.reciterId}`}
          >
            <View style={styles.icon}>
              <Feather name="play" size={18} color={colors.brandPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>سورة {getSurah(item.surah).name}</Text>
              <Text style={styles.meta}>بصوت {getReciter(item.reciterId).name} · {ago(item.ts)}</Text>
            </View>
            <Feather name="chevron-left" size={20} color={colors.muted} />
          </Pressable>
        )}
      />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  row: { flexDirection: ROW, alignItems: "center", gap: spacing.md, minHeight: 68, paddingHorizontal: spacing.lg, borderRadius: radius.md, backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.divider },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceTertiary, alignItems: "center", justifyContent: "center" },
  name: { ...rtlText, fontFamily: fonts.displayBold, fontSize: 19, color: colors.onSurface },
  meta: { ...rtlText, fontFamily: fonts.text, fontSize: 12, color: colors.muted },
  clear: { flexDirection: ROW, alignItems: "center", justifyContent: "center", gap: spacing.xs, minHeight: 44, marginTop: spacing.md },
  clearText: { fontFamily: fonts.textMedium, fontSize: 13, color: colors.muted },
}));
