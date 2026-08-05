import { MaterialIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

import { colors, type ColorToken } from "@/theme";

export type IconName = ComponentProps<typeof MaterialIcons>["name"];

export interface IconProps {
  name: IconName;
  size?: number;
  /** Semantic color token (`@/theme`). Defaults to `"foreground"`. */
  color?: ColorToken;
  accessibilityLabel?: string;
}

/**
 * Icon atom: thin, token-driven wrapper over `@expo/vector-icons`'
 * `MaterialIcons` set — the closest available match to the "Material
 * Symbols Outlined" glyphs used throughout the Stitch design
 * (`docs/motus/stitch-screen-inventory.md` §0; glyph names verified 1:1
 * against the installed `MaterialIcons` glyph map for every icon the
 * Stitch screens use — no invented/guessed name). Decorative by default
 * (`accessibilityElementsHidden`): icons that carry meaning on their own
 * (e.g. an icon-only button) must pass `accessibilityLabel` explicitly,
 * mirroring how `Button`/`Spinner` already require an explicit label.
 */
export function Icon({
  name,
  size = 24,
  color = "foreground",
  accessibilityLabel,
}: IconProps) {
  return (
    <MaterialIcons
      name={name}
      size={size}
      color={colors[color]}
      accessibilityElementsHidden={!accessibilityLabel}
      importantForAccessibility={
        accessibilityLabel ? "yes" : "no-hide-descendants"
      }
      accessibilityLabel={accessibilityLabel}
    />
  );
}
