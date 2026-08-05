import { ActivityIndicator, type ActivityIndicatorProps } from "react-native";

import { colors, type ColorToken } from "@/theme";

export type SpinnerSize = "sm" | "lg";

/**
 * `ActivityIndicator` reads its glyph color from the native `color` prop,
 * not from `style`/className — a semantic token is resolved to its real
 * value here rather than left as a Tailwind class name.
 */
const NATIVE_SIZE: Record<SpinnerSize, ActivityIndicatorProps["size"]> = {
  sm: "small",
  lg: "large",
};

export interface SpinnerProps extends Omit<
  ActivityIndicatorProps,
  "size" | "color"
> {
  size?: SpinnerSize;
  /** Semantic color token (`@/theme`). Defaults to `"primary"`. */
  color?: ColorToken;
  className?: string;
}

/** Loading indicator atom: thin, token-driven wrapper over `ActivityIndicator`. */
export function Spinner({
  size = "sm",
  color = "primary",
  accessibilityLabel = "Caricamento in corso",
  accessible = true,
  ...props
}: SpinnerProps) {
  return (
    <ActivityIndicator
      size={NATIVE_SIZE[size]}
      color={colors[color]}
      accessible={accessible}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      {...props}
    />
  );
}
