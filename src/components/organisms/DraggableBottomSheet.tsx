import type { ReactNode } from "react";
import { View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { colors, getShadowStyle } from "@/theme";

const COLLAPSED_HEIGHT = 96;
const EXPANDED_RATIO = 0.6;
const VELOCITY_THRESHOLD = 500;

export interface DraggableBottomSheetProps {
  /** Always visible, including when collapsed — drag handle lives here. */
  header: ReactNode;
  /** Scrollable content, hidden below `header` when collapsed. */
  children: ReactNode;
}

/**
 * Bottom sheet that can be dragged between a "peek" (header only) and an
 * expanded (60% of screen height) state, and starts expanded (Task 19
 * follow-up: the fixed-height sheet on the Map screen didn't move at all,
 * reported as unusable during real-device testing). Only the drag-handle
 * strip carries the pan gesture — not the whole header — so buttons in
 * the header row (e.g. "view as list") keep receiving normal taps instead
 * of being swallowed by the gesture.
 */
export function DraggableBottomSheet({
  header,
  children,
}: DraggableBottomSheetProps) {
  const { height: windowHeight } = useWindowDimensions();
  const expandedHeight = windowHeight * EXPANDED_RATIO;
  const maxTranslate = Math.max(expandedHeight - COLLAPSED_HEIGHT, 0);

  const translateY = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      const next = savedTranslateY.value + event.translationY;
      translateY.value = Math.min(Math.max(next, 0), maxTranslate);
    })
    .onEnd((event) => {
      const pastMidpoint = translateY.value > maxTranslate / 2;
      const flickingDown = event.velocityY > VELOCITY_THRESHOLD;
      const flickingUp = event.velocityY < -VELOCITY_THRESHOLD;
      const collapse = flickingUp ? false : flickingDown || pastMidpoint;
      const target = collapse ? maxTranslate : 0;
      translateY.value = withSpring(target, { damping: 20 });
      savedTranslateY.value = target;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    // No `className` here on purpose — see `MapSurface.tsx` for why mixing
    // NativeWind interop with a Reanimated `Animated.View` in this
    // codebase triggers "Cannot update a component while rendering a
    // different component" on a real device.
    <Animated.View
      style={[
        {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: expandedHeight,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderWidth: 1,
          borderBottomWidth: 0,
          borderColor: colors.border,
          backgroundColor: colors.surface,
        },
        animatedStyle,
        getShadowStyle("sheet"),
      ]}
    >
      <GestureDetector gesture={pan}>
        <View className="items-center pb-xs pt-sm">
          <View className="h-1.5 w-12 rounded-full bg-outlineVariant" />
        </View>
      </GestureDetector>
      {header}
      {children}
    </Animated.View>
  );
}
