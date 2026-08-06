import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";

import { colors, radius, spacing } from "@/theme";

type TabIconName = keyof typeof MaterialIcons.glyphMap;

interface TabIconProps {
  name: TabIconName;
  focused: boolean;
}

/**
 * Reproduces Stitch's active-tab "pill" affordance (bottom nav in Mappa
 * Motus/Previsioni Pro, `stitch-screen-inventory.md` §4-5: `bg-secondary-
 * fixed/50` behind the active icon) — a colored rounded background behind
 * the icon only when focused, not a plain tint swap.
 *
 * The pill needs `tabBarIconStyle` below to exist at all: React Navigation
 * lays every `tabBarIcon` out inside a fixed 31x28 box
 * (`bottom-tabs/views/TabBarIcon.js`, `wrapperUikit`), and the pill's own
 * horizontal padding (16 + 16) exceeded that width — Yoga then resolved the
 * content box to zero and the glyph rendered as nothing at all. That is why
 * the tab bar showed a bare colored pill and no icons while the very same
 * `MaterialIcons` glyphs rendered fine in the header and on the map pins.
 *
 * Plain `style`, not `className`: this element is rendered by React
 * Navigation's own tab bar, outside the screen tree NativeWind's CSS interop
 * covers. It also uses `MaterialIcons` directly rather than the `Icon` atom,
 * which marks itself `accessibilityElementsHidden` — right for a decorative
 * icon inside an already-labelled button, wrong for a tab.
 */
function TabIcon({ name, focused }: TabIconProps) {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        borderRadius: parseInt(radius.full, 10),
        paddingHorizontal: parseInt(spacing.sm, 10),
        paddingVertical: parseInt(spacing.xs, 10),
        backgroundColor: focused ? colors.secondaryFixed : "transparent",
      }}
    >
      <MaterialIcons
        name={name}
        size={24}
        color={focused ? colors.primary : colors.muted}
      />
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
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        // Overrides React Navigation's 31x28 icon box so the focused pill
        // (24px glyph + 8px padding each side) has room to lay out — see
        // `TabIcon`.
        tabBarIconStyle: { width: 56, height: 32 },
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
