import { useCallback, type ReactNode } from "react";
import { StyleSheet, type LayoutChangeEvent } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const MIN_GESTURE_SCALE = 0.25;
const MAX_GESTURE_SCALE = 4;

export interface MapSurfaceSize {
  width: number;
  height: number;
}

/** Cumulative gesture travel the owner has already folded into its region. */
export interface MapSurfaceAbsorbed {
  x: number;
  y: number;
  scale: number;
}

export const NOTHING_ABSORBED: MapSurfaceAbsorbed = { x: 0, y: 0, scale: 1 };

export interface MapSurfaceProps {
  /** Tile imagery / decorative layers — transformed together with `children`. */
  background?: ReactNode;
  children: ReactNode;
  /** Fires when the surface is measured — the map's true viewport in pixels. */
  onSizeChange?: (size: MapSurfaceSize) => void;
  /** A drag finished: total travel in screen pixels. */
  onPan?: (dx: number, dy: number) => void;
  /** A pinch (or double tap) finished: the magnification factor to apply. */
  onZoom?: (factor: number) => void;
  /**
   * Everything the owner has already absorbed into the region it renders.
   * The transform below is the *difference* between what the fingers have
   * done and what has been absorbed, so it is identity exactly when the two
   * agree — and it changes in the very same React commit that re-renders the
   * new region. Absorbing after the fact instead (resetting the transform in
   * an effect) made the map lurch: for one frame the content had already
   * moved *and* the transform was still applied, so it jumped twice as far
   * before settling back.
   */
  absorbed?: MapSurfaceAbsorbed;
}

/**
 * Gesture layer for a slippy map: it applies pan/pinch to its content live,
 * on the UI thread, and hands the finished gesture to its owner as a pixel
 * delta and a zoom factor. It deliberately does **not** own the map region —
 * that belongs to whoever knows the projection.
 *
 * Committing on gesture end (rather than clamping a fixed, oversized layer)
 * is what makes panning unbounded and zooming real: the owner re-centres,
 * re-issues tiles at the new zoom level and re-projects the pins, so labels
 * keep their size instead of being magnified along with the imagery.
 *
 * `minDistance` on the pan gesture lets a plain tap on a pin pass through to
 * its own `Pressable` instead of being swallowed as a micro-drag.
 */
export function MapSurface({
  background,
  children,
  onSizeChange,
  onPan,
  onZoom,
  absorbed = NOTHING_ABSORBED,
}: MapSurfaceProps) {
  // Raw, never-reset gesture totals. `base*` is the total as of the last
  // finished gesture; `raw*` also includes the one in progress.
  const rawX = useSharedValue(0);
  const rawY = useSharedValue(0);
  const rawScale = useSharedValue(1);
  const baseX = useSharedValue(0);
  const baseY = useSharedValue(0);
  const baseScale = useSharedValue(1);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      onSizeChange?.({ width, height });
    },
    [onSizeChange],
  );

  const { x: absorbedX, y: absorbedY, scale: absorbedScale } = absorbed;

  const pan = Gesture.Pan()
    .minDistance(8)
    .onUpdate((event) => {
      rawX.value = baseX.value + event.translationX;
      rawY.value = baseY.value + event.translationY;
    })
    .onEnd((event) => {
      baseX.value = rawX.value;
      baseY.value = rawY.value;
      if (onPan) runOnJS(onPan)(event.translationX, event.translationY);
    });

  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      const next = baseScale.value * event.scale;
      // Clamp what the *user sees*, so the limit is on the visible
      // magnification rather than on the running total.
      const min = MIN_GESTURE_SCALE * absorbedScale;
      const max = MAX_GESTURE_SCALE * absorbedScale;
      rawScale.value = Math.min(Math.max(next, min), max);
    })
    .onEnd(() => {
      const factor = rawScale.value / baseScale.value;
      baseScale.value = rawScale.value;
      if (onZoom) runOnJS(onZoom)(factor);
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      baseScale.value *= 2;
      rawScale.value = baseScale.value;
      if (onZoom) runOnJS(onZoom)(2);
    });

  const gesture = Gesture.Simultaneous(Gesture.Race(doubleTap, pan), pinch);

  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [
        { translateX: rawX.value - absorbedX },
        { translateY: rawY.value - absorbedY },
        { scale: rawScale.value / absorbedScale },
      ],
    }),
    [absorbedX, absorbedY, absorbedScale],
  );

  return (
    <GestureDetector gesture={gesture}>
      {/*
        No `className` here on purpose: NativeWind's CSS interop wrapping
        a Reanimated `Animated.View` that also has interop-wrapped
        `View` children triggers "Cannot update a component while
        rendering a different component" (reported crashing on a real
        device) — plain `style` sidesteps that interaction entirely.
      */}
      <Animated.View
        onLayout={handleLayout}
        style={[StyleSheet.absoluteFill, animatedStyle]}
      >
        {background}
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
