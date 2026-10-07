import { FlatList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ContentCard } from "@/src/components/ContentCard";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { HADITHS } from "@/src/content/duas";
import { makeStyles } from "@/src/theme";
import { fonts, spacing } from "@/src/ui";

export default function HadithScreen() {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.screen} testID="hadith-screen">
      <ScreenHeader title="الأحاديث النبوية" subtitle="أحاديث صحيحة من الأربعين النووية وغيرها" />
      <FlatList
        data={HADITHS}
        keyExtractor={(h) => h.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: insets.bottom + 100 }}
        renderItem={({ item }) => (
          <ContentCard
            id={item.id}
            favType="hadith"
            title={item.title}
            text={`قال رسول الله ﷺ: «${item.text}»`}
            meta={`عن ${item.narrator}`}
            source={item.source}
            route="/hadith"
            textSize={20}
          />
        )}
        ListFooterComponent={<Text style={styles.credit}>الأحاديث منقولة بنصّها من كتب السنة المعتمدة</Text>}
      />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  credit: { fontFamily: fonts.text, fontSize: 11, color: colors.muted, textAlign: "center", marginTop: spacing.md },
}));
