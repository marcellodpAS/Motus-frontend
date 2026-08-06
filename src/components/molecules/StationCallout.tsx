import { Pressable, View } from "react-native";

import { AppText } from "@/components/atoms/AppText";
import { Icon } from "@/components/atoms/Icon";
import { getShadowStyle } from "@/theme";

export interface StationCalloutProps {
  title: string;
  distanceKm: number;
  priceLabel?: string;
  onOpenDetails: () => void;
  onClose: () => void;
}

/**
 * Quick-info popup shown when a map pin is tapped (Task 19 follow-up:
 * tapping a pin used to navigate straight to Dettaglio Stazione, reported
 * as uncomfortable during real-device testing). Shows just enough to
 * decide whether to open the full detail, with an explicit action to do
 * so — the pin tap itself no longer navigates anywhere on its own.
 */
export function StationCallout({
  title,
  distanceKm,
  priceLabel,
  onOpenDetails,
  onClose,
}: StationCalloutProps) {
  return (
    <View
      className="flex-row items-center gap-sm rounded-xl border-hairline border-border bg-surface p-sm"
      style={getShadowStyle("md")}
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-surfaceContainer">
        <Icon name="local-gas-station" color="primary" size={18} />
      </View>
      <View className="flex-1">
        <AppText variant="label" numberOfLines={1}>
          {title}
        </AppText>
        <View className="flex-row items-center gap-xs">
          <AppText variant="caption" color="muted">
            {`${distanceKm.toFixed(1)} km`}
          </AppText>
          {priceLabel ? (
            <>
              <View className="h-1 w-1 rounded-full bg-outline" />
              <AppText variant="caption" color="primary" className="font-bold">
                {priceLabel}
              </AppText>
            </>
          ) : null}
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Apri scheda di ${title}`}
        onPress={onOpenDetails}
        className="min-h-touch-comfortable flex-row items-center gap-xs rounded-full bg-primaryContainer px-sm"
      >
        <AppText variant="labelMd" color="onPrimaryContainer">
          Apri
        </AppText>
        <Icon name="arrow-forward" color="onPrimaryContainer" size={14} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Chiudi"
        onPress={onClose}
        className="min-h-touch-comfortable min-w-touch-comfortable items-center justify-center rounded-full"
      >
        <Icon name="close" color="muted" size={18} />
      </Pressable>
    </View>
  );
}
