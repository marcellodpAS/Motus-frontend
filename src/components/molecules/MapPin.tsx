import { Pressable, View } from "react-native";

import { AppText } from "@/components/atoms/AppText";
import { Icon } from "@/components/atoms/Icon";

export interface MapPinPriceLine {
  /** Fuel name, when the price is shown *because* it matches a preference. */
  fuel?: string;
  priceLabel: string;
}

export interface MapPinProps {
  /**
   * One row per price to show. With no fuel preference this is the single
   * cheapest price; with preferences it is one row per preferred fuel the
   * station actually sells (a station selling none of them is not rendered
   * at all — that filtering is the caller's job, see `MapScreen`).
   */
  lines: MapPinPriceLine[];
  /** Cheapest station currently on the map. */
  highlighted?: boolean;
  /** Tapped by the user: raised above the other pins and outlined. */
  selected?: boolean;
  onPress?: () => void;
  accessibilityLabel: string;
}

/**
 * Map marker reproducing Stitch's two pin variants (Mappa Motus,
 * `stitch-screen-inventory.md` §5): plain white pill for a normal station,
 * filled `primary` pill with a fuel icon + bold price for the cheapest one —
 * extended with a multi-row body so several preferred fuels can be priced on
 * one pin ("se ne seleziono più di uno, devo vederne più di uno sulla
 * mappa"). Positioning (left/top) is the caller's responsibility — this
 * component only renders the marker itself, so it stays testable without
 * coordinate projection logic.
 */
export function MapPin({
  lines,
  highlighted = false,
  selected = false,
  onPress,
  accessibilityLabel,
}: MapPinProps) {
  if (lines.length === 0) return null;

  const onDark = highlighted;
  // Every conflicting utility is chosen exclusively rather than layered:
  // NativeWind resolves same-specificity classes by stylesheet order, not by
  // the order they appear in `className`, so "later class wins" is not a
  // guarantee here.
  const bodyClassName = [
    "items-stretch gap-xs rounded-lg px-sm py-xs",
    highlighted ? "bg-primary" : "bg-surface",
    // Highlighted pins keep a `thick` border too (same hue as their own
    // background, so invisible) — only that way does selecting one change
    // its outline without also changing its size.
    selected || highlighted
      ? "border-thick border-primary"
      : "border-hairline border-border",
    selected ? "shadow-lg" : "shadow-sm",
  ].join(" ");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected }}
      onPress={onPress}
      className="items-center"
    >
      <View className={bodyClassName}>
        {lines.map((line, index) => (
          <View
            key={`${line.fuel ?? ""}-${line.priceLabel}`}
            className="flex-row items-center gap-xs"
          >
            {index === 0 && highlighted ? (
              <Icon name="local-gas-station" color="onPrimary" size={14} />
            ) : null}
            {line.fuel ? (
              <AppText
                variant="caption"
                color={onDark ? "onPrimary" : "muted"}
                numberOfLines={1}
              >
                {line.fuel}
              </AppText>
            ) : null}
            <AppText
              variant="label"
              color={onDark ? "onPrimary" : "foreground"}
              className={highlighted ? "font-bold" : undefined}
            >
              {line.priceLabel}
            </AppText>
          </View>
        ))}
      </View>
      <View
        className={`-mt-xs h-2.5 w-2.5 rotate-45 ${highlighted ? "bg-primary" : "border-b-hairline border-r-hairline border-border bg-surface"}`}
      />
    </Pressable>
  );
}
