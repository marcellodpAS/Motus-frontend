import type { ReactNode } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { colors, getShadowStyle } from "@/theme";

const VELOCITY_THRESHOLD = 500;

export interface DraggableBottomSheetProps {
  /** Always visible, including when collapsed — drag handle lives here. */
  header: ReactNode;
  /** Scrollable content, hidden below `header` when collapsed. */
  children: ReactNode;
  /**
   * How far down the sheet may be dragged, in pixels — i.e. exactly the
   * height of `children`, so collapsing hides the content and leaves the
   * header peeking. The caller passes it because the caller sizes `children`;
   * measuring it here instead created a feedback loop (layout -> state ->
   * layout) that never settled on sub-pixel heights and left the whole sheet
   * visibly trembling at rest.
   */
  collapsedTravel: number;
}

/**
 * Bottom sheet that can be dragged between a "peek" (header only) and its
 * full height, and starts expanded (Task 19 follow-up: the fixed-height sheet
 * on the Map screen didn't move at all, reported as unusable during
 * real-device testing).
 *
 * The sheet takes its height from its content rather than a share of the
 * screen: how much of the list should be visible is a decision only the
 * caller can make, and a screen-height ratio could not express it — rows are
 * not all the same height once a station prices more than one fuel.
 *
 * The whole header is the drag surface, not just the handle strip: hitting a
 * 6px-tall bar with a thumb was reported as needing pixel-perfect aim.
 * `activeOffsetY` is what makes that safe — the pan only takes over after
 * ~10px of *vertical* travel, so a plain tap still reaches the buttons inside
 * the header (e.g. "view as list") instead of being swallowed by the gesture.
 */
export function DraggableBottomSheet({
  header,
  children,
  collapsedTravel,
}: DraggableBottomSheetProps) {
  const maxTranslate = Math.max(collapsedTravel, 0);

  const translateY = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pan = Gesture.Pan()
    .activeOffsetY([-10, 10])
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
        <View>
          <View className="items-center pb-xs pt-sm">
            <View className="h-1.5 w-12 rounded-full bg-outlineVariant" />
          </View>
          {header}
        </View>
      </GestureDetector>
      {children}
    </Animated.View>
  );
}
