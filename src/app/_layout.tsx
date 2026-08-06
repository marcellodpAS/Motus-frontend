import "@/styles/global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

/**
 * `SafeAreaProvider` at the root is required by `react-native-safe-area-
 * context`: native platforms tolerate its absence via a native fallback,
 * but web has none — every `SafeAreaView`/`useSafeAreaInsets` call throws
 * "No safe area value available" during the very first render with no
 * provider present, which crashes to a blank white page with no visible
 * error (exactly what showed up testing on web). Missing since before
 * this task; surfaced now that `MotusHeader` uses `SafeAreaView` too.
 *
 * `GestureHandlerRootView` is required by `react-native-gesture-handler`
 * (official setup docs) for any `Gesture`/`GestureDetector` to work
 * correctly, especially on Android — needed for the Map screen's pan/
 * pinch surface and the draggable bottom sheet.
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
