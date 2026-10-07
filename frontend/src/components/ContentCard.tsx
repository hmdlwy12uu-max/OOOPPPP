import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";

import { narrate, stopSound, togglePause, useAudioLoading, usePaused, usePlayingId } from "../audio";
import { toggleFavorite, useIsFavorite, type FavType } from "../stores";
import { makeStyles, useTheme } from "../theme";
import { fonts, radius, ROW, rtlText, spacing } from "../ui";
import { showToast } from "../toast";

type Props = {
  id: string;
  favType: FavType;
  title: string;
  text: string;
  source?: string;
  meta?: string;
  route?: string;
  textSize?: number;
};

// Card for a dua / hadith: text + source + favorite + narration (chosen voice).
export function ContentCard({ id, favType, title, text, source, meta, route, textSize = 22 }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const fav = useIsFavorite(id);
  const playing = usePlayingId() === id;
  const loading = useAudioLoading() && playing;
  const paused = usePaused() && playing;

  const onFav = () => {
    const added = toggleFavorite({ id, type: favType, title, text, route });
    showToast(added ? "أُضيف إلى المفضلة" : "أُزيل من المفضلة", title);
  };
  const onPlay = () => {
    if (playing) return loading ? stopSound() : togglePause();
    narrate(id, text, { title, subtitle: meta ?? source, route });
  };

  return (
    <View style={styles.card} testID={`content-card-${id}`}>
      <View style={styles.top}>
        <Text style={styles.title}>{title}</Text>
        <Pressable onPress={onFav} hitSlop={10} style={styles.iconBtn} testID={`fav-${id}`}>
          <Feather name="heart" size={20} color={fav ? colors.error : colors.muted} />
        </Pressable>
      </View>
      <Text style={[styles.text, { fontSize: textSize, lineHeight: textSize * 1.9 }]}>{text}</Text>
      {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      <View style={styles.bottom}>
        <Text style={styles.source} numberOfLines={1}>{source}</Text>
        <Pressable onPress={onPlay} style={[styles.play, playing && styles.playActive]} testID={`play-${id}`}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.onBrandPrimary} />
          ) : (
            <Feather name={playing && !paused ? "pause" : "volume-2"} size={16} color={playing ? colors.onBrandPrimary : colors.brandPrimary} />
          )}
          <Text style={[styles.playText, playing && { color: colors.onBrandPrimary }]}>
            {loading ? "جارٍ التحضير" : playing ? (paused ? "متابعة" : "إيقاف مؤقت") : "استمع"}
          </Text>
        </Pressable>
        {playing ? (
          <Pressable onPress={stopSound} hitSlop={10} style={styles.iconBtn} testID={`stop-${id}`}>
            <Feather name="square" size={16} color={colors.brandPrimary} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  top: { flexDirection: ROW, alignItems: "center", gap: spacing.sm },
  title: { ...rtlText, flex: 1, fontFamily: fonts.textBold, fontSize: 15, color: colors.brandPrimary },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  text: { ...rtlText, fontFamily: fonts.display, color: colors.onSurface },
  meta: { ...rtlText, fontFamily: fonts.textMedium, fontSize: 12, color: colors.onSurfaceTertiary },
  bottom: { flexDirection: ROW, alignItems: "center", gap: spacing.sm },
  source: { ...rtlText, flex: 1, fontFamily: fonts.text, fontSize: 12, color: colors.muted },
  play: {
    flexDirection: ROW,
    alignItems: "center",
    gap: spacing.xs,
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.brandPrimary,
  },
  playActive: { backgroundColor: colors.brandPrimary },
  playText: { fontFamily: fonts.textBold, fontSize: 13, color: colors.brandPrimary },
}));
