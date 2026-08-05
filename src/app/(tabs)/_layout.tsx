import { Tabs } from "expo-router";
import { View } from "react-native";

import { Icon, type IconName } from "@/components/atoms/Icon";
import { colors } from "@/theme";

interface TabIconProps {
  name: IconName;
  focused: boolean;
}

/**
 * Reproduces Stitch's active-tab "pill" affordance (bottom nav in Mappa
 * Motus/Previsioni Pro, `stitch-screen-inventory.md` §4-5: `bg-secondary-
 * fixed/50` behind the active icon) — a colored rounded background behind
 * the icon only when focused, not a plain tint swap.
 */
function TabIcon({ name, focused }: TabIconProps) {
  return (
    <View
      className={`items-center justify-center rounded-full px-md py-xs ${focused ? "bg-secondaryFixed" : ""}`}
    >
      <Icon name={name} color={focused ? "primary" : "muted"} />
    </View>
  );
}

/**
 * Main navigation shell (Task 19): 4 top-level destinations reproducing
 * the bottom nav present in 2 of the 4 Stitch screens (Mappa Motus,
 * Previsioni Pro — `stitch-screen-inventory.md` §"Riepilogo flussi
 * impliciti"), replacing the pre-existing 3-button Home (ADR-0005,
 * `stitch-implementation-gap.md` row 6). "Map" is the default/home tab,
 * matching Mappa Motus being the only screen with both a mobile bottom
 * nav *and* a desktop rail in the Stitch export.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "500" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Map",
          tabBarIcon: ({ focused }) => <TabIcon name="map" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="favorite" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="pro"
        options={{
          title: "Pro",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="workspace-premium" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="person" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
