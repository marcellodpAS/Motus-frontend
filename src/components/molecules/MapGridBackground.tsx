import { StyleSheet } from "react-native";
import Svg, { Line } from "react-native-svg";

import { colors } from "@/theme";

const ROWS = 14;
const COLUMNS = 8;
// Grid spans -50..150 (not 0..100) so panning the map reveals more grid
// lines instead of running out at the edges of the initial viewport.
const SPAN_MIN = -50;
const SPAN_MAX = 150;

/**
 * Purely decorative grid standing in for real map tiles (no map SDK is
 * available — `MapSurface`). Without any visual texture the map screen
 * was indistinguishable from a broken/blank one (reported testing on a
 * real device): this gives the surface a clear "this is a map, you can
 * pan it" read even though it carries no real cartographic information.
 *
 * Built with `react-native-svg` rather than many separately-styled RN
 * `View`s: mounting a couple dozen NativeWind-`className`-styled `View`s
 * in one commit triggered "Cannot update a component while rendering a
 * different component" from NativeWind's CSS interop (reported crashing
 * on a real device) — `Svg`/`Line` sit outside that interop entirely, so
 * the same visual has no such interaction to trigger in the first place.
 */
export function MapGridBackground() {
  return (
    <Svg
      style={StyleSheet.absoluteFill}
      viewBox={`${SPAN_MIN} ${SPAN_MIN} ${SPAN_MAX - SPAN_MIN} ${SPAN_MAX - SPAN_MIN}`}
      preserveAspectRatio="none"
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {Array.from({ length: ROWS }, (_, row) => {
        const y = SPAN_MIN + (row / (ROWS - 1)) * (SPAN_MAX - SPAN_MIN);
        return (
          <Line
            key={`row-${row}`}
            x1={SPAN_MIN}
            x2={SPAN_MAX}
            y1={y}
            y2={y}
            stroke={colors.border}
            strokeWidth={0.3}
          />
        );
      })}
      {Array.from({ length: COLUMNS }, (_, column) => {
        const x = SPAN_MIN + (column / (COLUMNS - 1)) * (SPAN_MAX - SPAN_MIN);
        return (
          <Line
            key={`col-${column}`}
            x1={x}
            x2={x}
            y1={SPAN_MIN}
            y2={SPAN_MAX}
            stroke={colors.border}
            strokeWidth={0.3}
          />
        );
      })}
    </Svg>
  );
}
