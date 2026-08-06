import type { ReactNode } from "react";
import { StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const MIN_SCALE = 1;
const MAX_SCALE = 3;

export interface MapSurfaceProps {
  /** Decorative background layer (grid, texture) — panned/zoomed together with `children`. */
  background?: ReactNode;
  children: ReactNode;
}

/**
 * Pan-and-pinch-to-zoom layer standing in for a real map view (Task 19
 * follow-up: `expo-maps` is alpha/unavailable in Expo Go, no dev-client
 * tooling exists in this environment — see `stitch-implementation-gap.md`
 * row 9). `minDistance` on the pan gesture lets a plain tap on a pin pass
 * through to its own `Pressable` instead of being swallowed as a
 * micro-drag; double-tap resets pan/zoom back to the origin.
 */
export function MapSurface({ background, children }: MapSurfaceProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const savedScale = useSharedValue(1);

  const pan = Gesture.Pan()
    .minDistance(8)
    .onUpdate((event) => {
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      const next = savedScale.value * event.scale;
      scale.value = Math.min(Math.max(next, MIN_SCALE), MAX_SCALE);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      translateX.value = withTiming(0);
      translateY.value = withTiming(0);
      scale.value = withTiming(1);
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
      savedScale.value = 1;
    });

  const gesture = Gesture.Simultaneous(Gesture.Race(doubleTap, pan), pinch);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      {/*
        No `className` here on purpose: NativeWind's CSS interop wrapping
        a Reanimated `Animated.View` that also has interop-wrapped
        `View` children triggers "Cannot update a component while
        rendering a different component" (reported crashing on a real
        device) — plain `style` sidesteps that interaction entirely.
      */}
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        {background}
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
