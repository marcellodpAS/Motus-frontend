import { View } from "react-native";

import { AppText } from "@/components/atoms/AppText";
import { Icon } from "@/components/atoms/Icon";

export interface MotusLogoProps {
  /** Hides the "MOTUS" wordmark, keeping only the mark (compact headers). */
  markOnly?: boolean;
  size?: number;
}

/**
 * Vector reproduction of the Stitch brand logo (`stitch-screen-inventory.md`
 * §1, Stitch ID `a18184fe02884416830fda392f454578`): a fuel-pump mark in
 * `primary` + the "MOTUS" wordmark. The Stitch export is a flat PNG on an
 * opaque white background (143 775 byte `screen.png`) — unusable as-is on
 * the overlay header in Mappa Motus, which sits over a photo/map background
 * (a pasted white rectangle would show). Rebuilt here as crisp vector
 * pieces (icon badge + `AppText`) instead, so it renders correctly on any
 * background and needs no image asset pipeline.
 */
export function MotusLogo({ markOnly = false, size = 24 }: MotusLogoProps) {
  return (
    <View className="flex-row items-center gap-xs">
      <View
        className="items-center justify-center rounded-md bg-primary"
        style={{ width: size + 8, height: size + 8 }}
      >
        <Icon name="local-gas-station" color="onPrimary" size={size} />
      </View>
      {markOnly ? null : (
        <AppText
          variant="headlineMd"
          color="primary"
          className="font-bold tracking-tight"
        >
          MOTUS
        </AppText>
      )}
    </View>
  );
}
