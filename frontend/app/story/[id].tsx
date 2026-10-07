import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@react-native-vector-icons/feather";

import { narrate, stopSound, togglePause, useAudioLoading, usePaused, usePlayingId } from "@/src/audio";
import { Ornament } from "@/src/components/Ornament";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { STORIES } from "@/src/content/stories";
import { makeStyles, useTheme } from "@/src/theme";
import { useVoice, VOICES } from "@/src/voice";
import { fonts, radius, ROW, rtlText, spacing } from "@/src/ui";

export default function StoryScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const story = STORIES.find((s) => s.id === id) ?? STORIES[0];
  const key = `story-${story.id}`;
  const playing = usePlayingId() === key;
  const loading = useAudioLoading() && playing;
  const paused = usePaused() && playing;
  const voiceId = useVoice();
  const voice = VOICES.find((v) => v.id === voiceId) ?? VOICES[0];

  const onPlay = () => {
    if (playing) return loading ? stopSound() : togglePause();
    narrate(key, `${story.prophet}. ${story.title}. ${story.body.join(" ")}`, {
      title: story.prophet,
      subtitle: story.title,
      route: `/story/${story.id}`,
    });
  };

  return (
    <View style={styles.screen} testID="story-screen">
      <ScreenHeader title={story.prophet} subtitle={story.title} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: insets.bottom + 120 }}>
        <View style={{ alignItems: "center" }}>
          <Ornament width={160} />
        </View>
        {story.body.map((p, i) => (
          <Text key={i} style={styles.para}>{p}</Text>
        ))}
        <Text style={styles.refs}>المراجع: {story.refs}</Text>
      </ScrollView>
      <View style={[styles.player, { paddingBottom: insets.bottom + spacing.md }]}>
        <Pressable onPress={onPlay} style={styles.playBtn} testID="story-play">
          {loading ? <ActivityIndicator color={colors.onBrandPrimary} /> : <Feather name={playing && !paused ? "pause" : "play"} size={24} color={colors.onBrandPrimary} />}
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.playerTitle}>{loading ? "جارٍ تحضير الصوت..." : playing ? (paused ? "متوقف مؤقتًا" : "يُقرأ الآن") : "استمع للقصة"}</Text>
          <Text style={styles.playerSub}>{voice.name} · يمكنك تغييره من الإعدادات</Text>
        </View>
        {playing ? (
          <Pressable onPress={stopSound} style={styles.stopBtn} hitSlop={8} testID="story-stop">
            <Feather name="square" size={18} color={colors.brandPrimary} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  para: { ...rtlText, fontFamily: fonts.display, fontSize: 20, lineHeight: 38, color: colors.onSurface },
  refs: { ...rtlText, fontFamily: fonts.text, fontSize: 12, color: colors.muted, lineHeight: 18 },
  player: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: ROW,
    alignItems: "center",
    gap: spacing.md,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  playBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.brandPrimary, alignItems: "center", justifyContent: "center" },
  stopBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: colors.brandPrimary, alignItems: "center", justifyContent: "center" },
  playerTitle: { ...rtlText, fontFamily: fonts.textBold, fontSize: 15, color: colors.onSurface },
  playerSub: { ...rtlText, fontFamily: fonts.text, fontSize: 12, color: colors.muted },
  chip: { borderRadius: radius.pill },
}));
