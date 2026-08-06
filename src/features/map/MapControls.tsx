import { Pressable, View } from "react-native";

import { Icon, type IconName } from "@/components/atoms/Icon";

interface MapControlButtonProps {
  icon: IconName;
  accessibilityLabel: string;
  onPress: () => void;
}

function MapControlButton({
  icon,
  accessibilityLabel,
  onPress,
}: MapControlButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className="h-11 w-11 items-center justify-center rounded-full border-hairline border-border bg-surface shadow-md active:bg-surfaceContainerLow"
    >
      <Icon name={icon} color="primary" size={22} />
    </Pressable>
  );
}

export interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  /** Only offered once the user has actually moved away from their own fix. */
  onRecenter?: () => void;
}

/**
 * Stacked map controls. Zoom buttons exist alongside the pinch gesture
 * because pinch commits a *rounded* zoom level (tiles only exist at integer
 * levels), so a deliberate one-level step is easier to hit with a button;
 * "recenter" exists because panning is unbounded — without it there is no way
 * back to your own position once you have dragged far away.
 */
export function MapControls({
  onZoomIn,
  onZoomOut,
  onRecenter,
}: MapControlsProps) {
  return (
    <View className="gap-sm">
      <MapControlButton
        icon="add"
        accessibilityLabel="Aumenta zoom"
        onPress={onZoomIn}
      />
      <MapControlButton
        icon="remove"
        accessibilityLabel="Riduci zoom"
        onPress={onZoomOut}
      />
      {onRecenter ? (
        <MapControlButton
          icon="my-location"
          accessibilityLabel="Torna alla mia posizione"
          onPress={onRecenter}
        />
      ) : null}
    </View>
  );
}
