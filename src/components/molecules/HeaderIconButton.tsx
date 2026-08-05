import { Pressable } from "react-native";

import { Icon, type IconName } from "@/components/atoms/Icon";
import type { ColorToken } from "@/theme";

export interface HeaderIconButtonProps {
  icon: IconName;
  accessibilityLabel: string;
  onPress?: () => void;
  color?: ColorToken;
}

/** Circular icon-only pressable used in headers (back/search/close/profile) across every Stitch screen variant. */
export function HeaderIconButton({
  icon,
  accessibilityLabel,
  onPress,
  color = "muted",
}: HeaderIconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className="min-h-touch-comfortable min-w-touch-comfortable items-center justify-center rounded-full active:bg-surfaceContainerLow"
    >
      <Icon name={icon} color={color} />
    </Pressable>
  );
}
