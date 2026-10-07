import { FlatList, Pressable, Switch, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@react-native-vector-icons/feather";

import { ADHKAR, type Dhikr } from "@/src/adhkar";
import { useRouter } from "expo-router";

import { playDhikr, stopSound, usePlayingId } from "@/src/audio";
import { InfoBanner } from "@/src/components/InfoBanner";
import { PatternHeader } from "@/src/components/PatternHeader";
import { usesNativeTabs } from "@/src/navigation";
import { useSettings } from "@/src/settings";
import { makeStyles, useTheme } from "@/src/theme";
import { alpha, fonts, radius, ROW, rtlText, spacing } from "@/src/ui";

export default function AdhkarScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomChrome = usesNativeTabs ? insets.bottom : 0;
  const { settings, toggleDhikr } = useSettings();
  const playing = usePlayingId();
  const count = settings.enabledIds.length;
  const router = useRouter();

  return (
    <View style={styles.screen} testID="adhkar-screen">
      <PatternHeader
        testID="adhkar-header"
        title="الأذكار"
        subtitle={`${count} من ${ADHKAR.length} مفعّلة · تتناوب كل ${settings.interval} دقيقة`}
      />
      <FlatList
        data={ADHKAR}
        keyExtractor={(d) => d.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: bottomChrome + 100 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ gap: spacing.md }}>
            <View style={styles.daily}>
              <Pressable onPress={() => router.push("/daily/morning")} style={styles.dailyBtn} testID="adhkar-morning">
                <Feather name="sun" size={18} color={colors.brandPrimary} />
                <Text style={styles.dailyText}>أذكار الصباح</Text>
              </Pressable>
              <Pressable onPress={() => router.push("/daily/evening")} style={styles.dailyBtn} testID="adhkar-evening">
                <Feather name="moon" size={18} color={colors.brandPrimary} />
                <Text style={styles.dailyText}>أذكار المساء</Text>
              </Pressable>
            </View>
          {count === 0 ? (
            <InfoBanner
              testID="adhkar-empty"
              icon="alert-circle"
              title="لا توجد أذكار مفعّلة"
              body="فعّل ذكرًا واحدًا على الأقل ليصلك التذكير الدوري."
            />
          ) : null}
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(70 * index).duration(400)}>
            <DhikrCard
              dhikr={item}
              index={index}
              enabled={settings.enabledIds.includes(item.id)}
              playing={playing === item.id}
              onToggle={() => toggleDhikr(item.id)}
            />
          </Animated.View>
        )}
      />
    </View>
  );
}

type CardProps = { dhikr: Dhikr; index: number; enabled: boolean; playing: boolean; onToggle: () => void };

function DhikrCard({ dhikr, index, enabled, playing, onToggle }: CardProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={[styles.card, !enabled && { opacity: 0.6 }]} testID={`dhikr-card-${dhikr.id}`}>
      <View style={styles.top}>
        <View style={styles.numWrap}>
          <Text style={styles.num}>{index + 1}</Text>
        </View>
        <Text style={styles.title}>{dhikr.title}</Text>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: colors.surfaceTertiary, true: colors.brandSecondary }}
          thumbColor={enabled ? colors.brandPrimary : colors.muted}
          testID={`dhikr-toggle-${dhikr.id}`}
        />
      </View>
      <Text style={styles.text}>{dhikr.text}</Text>
      <View style={styles.bottom}>
        <Text style={styles.virtue} numberOfLines={2}>{dhikr.virtue}</Text>
        <Pressable
          onPress={() => (playing ? stopSound() : playDhikr(dhikr.id, { title: dhikr.title, subtitle: dhikr.text }))}
          style={({ pressed }) => [styles.play, playing && styles.playActive, pressed && { transform: [{ scale: 0.96 }] }]}
          testID={`dhikr-play-${dhikr.id}`}
        >
          <Feather name={playing ? "pause" : "volume-2"} size={16} color={playing ? colors.onBrandPrimary : colors.brandPrimary} />
          <Text style={[styles.playText, playing && { color: colors.onBrandPrimary }]}>{playing ? "إيقاف" : "استمع"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  daily: { flexDirection: ROW, gap: spacing.md },
  dailyBtn: { flex: 1, flexDirection: ROW, alignItems: "center", justifyContent: "center", gap: spacing.sm, minHeight: 52, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.brandPrimary, backgroundColor: alpha(colors.brandPrimary, 0.08) },
  dailyText: { fontFamily: fonts.textBold, fontSize: 15, color: colors.brandPrimary },
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  top: { flexDirection: ROW, alignItems: "center", gap: spacing.md },
  numWrap: {
    width: 30,
    height: 30,
    transform: [{ rotate: "45deg" }],
    borderWidth: 1,
    borderColor: colors.brandPrimary,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  num: { transform: [{ rotate: "-45deg" }], fontFamily: fonts.textBold, fontSize: 13, color: colors.brandPrimary },
  title: { ...rtlText, flex: 1, fontFamily: fonts.textBold, fontSize: 15, color: colors.onSurfaceSecondary },
  text: { ...rtlText, fontFamily: fonts.displayBold, fontSize: 28, lineHeight: 52, color: colors.onSurface },
  bottom: { flexDirection: ROW, alignItems: "center", gap: spacing.md },
  virtue: { ...rtlText, flex: 1, fontFamily: fonts.text, fontSize: 12, lineHeight: 18, color: colors.muted },
  play: {
    flexDirection: ROW,
    alignItems: "center",
    gap: spacing.xs,
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.brandPrimary,
    backgroundColor: alpha(colors.brandPrimary, 0.08),
  },
  playActive: { backgroundColor: colors.brandPrimary },
  playText: { fontFamily: fonts.textBold, fontSize: 14, color: colors.brandPrimary },
}));
