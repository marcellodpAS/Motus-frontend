import { Pressable, View } from "react-native";

import { AppText } from "@/components/atoms/AppText";
import { Icon } from "@/components/atoms/Icon";

export interface MapPinProps {
  priceLabel: string;
  highlighted?: boolean;
  onPress?: () => void;
  accessibilityLabel: string;
}

/**
 * Map marker reproducing Stitch's two pin variants (Mappa Motus,
 * `stitch-screen-inventory.md` §5): plain white pill for a normal station,
 * filled `primary` pill with a fuel icon + bold price for the cheapest one.
 * Positioning (left/top) is the caller's responsibility — this component
 * only renders the marker itself, so it stays testable without coordinate
 * projection logic.
 */
export function MapPin({
  priceLabel,
  highlighted = false,
  onPress,
  accessibilityLabel,
}: MapPinProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className="items-center"
    >
      <View
        className={`flex-row items-center gap-xs rounded-full px-sm py-xs shadow-sm ${
          highlighted
            ? "bg-primary"
            : "border-hairline border-border bg-surface"
        }`}
      >
        {highlighted ? (
          <Icon name="local-gas-station" color="onPrimary" size={14} />
        ) : null}
        <AppText
          variant="label"
          color={highlighted ? "onPrimary" : "foreground"}
          className={highlighted ? "font-bold" : undefined}
        >
          {priceLabel}
        </AppText>
      </View>
      <View
        className={`-mt-xs h-2.5 w-2.5 rotate-45 ${highlighted ? "bg-primary" : "border-b-hairline border-r-hairline border-border bg-surface"}`}
      />
    </Pressable>
  );
}
