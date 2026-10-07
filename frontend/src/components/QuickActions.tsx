import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@react-native-vector-icons/feather";

import { makeStyles, useTheme } from "../theme";
import { fonts, radius, ROW, spacing } from "../ui";

const ACTIONS = [
  { href: "/qibla", label: "القبلة", icon: "compass", id: "qibla" },
  { href: "/mosques", label: "أقرب مسجد", icon: "map-pin", id: "mosques" },
  { href: "/tasbih", label: "المسبحة", icon: "circle", id: "tasbih" },
  { href: "/daily/morning", label: "الصباح", icon: "sun", id: "morning" },
  { href: "/daily/evening", label: "المساء", icon: "moon", id: "evening" },
] as const;

export function QuickActions() {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  return (
    <View style={styles.row} testID="home-quick-actions">
      {ACTIONS.map((a) => (
        <Pressable
          key={a.id}
          onPress={() => router.push(a.href)}
          style={({ pressed }) => [styles.tile, pressed && { transform: [{ scale: 0.96 }], borderColor: colors.brandPrimary }]}
          testID={`quick-action-${a.id}`}
        >
          <View style={styles.icon}>
            <Feather name={a.icon} size={20} color={colors.brandPrimary} />
          </View>
          <Text style={styles.label}>{a.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  row: { flexDirection: ROW, gap: spacing.sm },
  tile: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontFamily: fonts.textBold, fontSize: 12, color: colors.onSurface },
}));
