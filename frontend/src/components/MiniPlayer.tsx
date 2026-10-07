import { ActivityIndicator, Platform, Pressable, Text, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@react-native-vector-icons/feather";

import { stopSound, togglePause, useAudioLoading, useNowPlaying, usePaused } from "../audio";
import { usesNativeTabs } from "../navigation";
import { makeStyles, useTheme } from "../theme";
import { fonts, radius, ROW, rtlText, spacing } from "../ui";

export const TAB_BAR_HEIGHT = Platform.OS === "web" ? 64 : 56;
const TAB_ROUTES = new Set(["/", "/index", "/quran", "/adhkar", "/library", "/settings"]);

// Global "now playing" bar: audio keeps going while the user moves between screens.
export function MiniPlayer() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const now = useNowPlaying();
  const paused = usePaused();
  const loading = useAudioLoading();
  const pathname = usePathname();
  const router = useRouter();

  if (!now || pathname.startsWith("/surah/")) return null;
  const onTab = TAB_ROUTES.has(pathname);
  const bottom = onTab && !usesNativeTabs ? TAB_BAR_HEIGHT + insets.bottom + spacing.sm : insets.bottom + spacing.sm;

  return (
    <Animated.View entering={FadeInDown} exiting={FadeOutDown} style={[styles.wrap, { bottom }]} testID="mini-player">
      <Pressable onPress={() => now.route && router.push(now.route as never)} style={styles.bar} disabled={!now.route}>
        <Pressable onPress={togglePause} style={styles.btn} hitSlop={8} testID="mini-player-toggle">
          {loading ? <ActivityIndicator color={colors.onBrandPrimary} /> : <Feather name={paused ? "play" : "pause"} size={20} color={colors.onBrandPrimary} />}
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>{now.title}</Text>
          {now.subtitle ? <Text style={styles.sub} numberOfLines={1}>{now.subtitle}</Text> : null}
        </View>
        <Pressable onPress={stopSound} style={styles.close} hitSlop={8} testID="mini-player-stop">
          <Feather name="x" size={20} color={colors.muted} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const useStyles = makeStyles((colors) => ({
  wrap: { position: "absolute", left: spacing.md, right: spacing.md, zIndex: 50 },
  bar: {
    flexDirection: ROW,
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.sm,
    paddingRight: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceTertiary,
    borderWidth: 1,
    borderColor: colors.brandPrimary,
  },
  btn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.brandPrimary, alignItems: "center", justifyContent: "center" },
  close: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  title: { ...rtlText, fontFamily: fonts.textBold, fontSize: 14, color: colors.onSurface },
  sub: { ...rtlText, fontFamily: fonts.text, fontSize: 12, color: colors.muted },
}));
