import { Platform } from "react-native";
import { Tabs } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@react-native-vector-icons/feather";

import { TAB_BAR_HEIGHT } from "@/src/components/MiniPlayer";
import { usesNativeTabs } from "@/src/navigation";
import { useTheme } from "@/src/theme";
import { fonts } from "@/src/ui";

export const unstable_settings = { initialRouteName: "index" };

// Declared left -> right; Home sits on the right for Arabic reading order.
export default function TabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (usesNativeTabs) {
    return (
      <NativeTabs tintColor={colors.brandPrimary}>
        <NativeTabs.Trigger name="settings">
          <NativeTabs.Trigger.Icon sf="gearshape.fill" />
          <NativeTabs.Trigger.Label>الإعدادات</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="library">
          <NativeTabs.Trigger.Icon sf="books.vertical.fill" />
          <NativeTabs.Trigger.Label>المكتبة</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="adhkar">
          <NativeTabs.Trigger.Icon sf="sparkles" />
          <NativeTabs.Trigger.Label>الأذكار</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="quran">
          <NativeTabs.Trigger.Icon sf="book.fill" />
          <NativeTabs.Trigger.Label>القرآن</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Icon sf="moon.stars.fill" />
          <NativeTabs.Trigger.Label>الرئيسية</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brandPrimary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: TAB_BAR_HEIGHT + (Platform.OS === "web" ? 0 : insets.bottom),
          paddingBottom: Platform.OS === "web" ? 0 : insets.bottom,
        },
        tabBarItemStyle: { alignSelf: "center" },
        tabBarLabelStyle: { fontFamily: fonts.textMedium, fontSize: 12 },
      }}
    >
      <Tabs.Screen
        name="settings"
        options={{
          title: "الإعدادات",
          tabBarButtonTestID: "tab-settings",
          tabBarIcon: ({ color, size }) => <Feather name="settings" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "المكتبة",
          tabBarButtonTestID: "tab-library",
          tabBarIcon: ({ color, size }) => <Feather name="layers" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="adhkar"
        options={{
          title: "الأذكار",
          tabBarButtonTestID: "tab-adhkar",
          tabBarIcon: ({ color, size }) => <Feather name="heart" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="quran"
        options={{
          title: "القرآن",
          tabBarButtonTestID: "tab-quran",
          tabBarIcon: ({ color, size }) => <Feather name="book-open" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "الرئيسية",
          tabBarButtonTestID: "tab-home",
          tabBarIcon: ({ color, size }) => <Feather name="moon" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
