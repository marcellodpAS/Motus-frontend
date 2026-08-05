import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/atoms/AppText";
import { Icon } from "@/components/atoms/Icon";

export interface ListItemProps {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  testID?: string;
}

const CONTAINER_CLASSNAME =
  "min-h-touch-comfortable flex-row items-center gap-md rounded-xl border-hairline border-border bg-surface p-sm mb-sm";

/**
 * Pressable row: leading fuel-icon badge + title/subtitle + optional
 * trailing slot. Restyled (Task 19) as a bordered card matching the list
 * rows used throughout the Stitch screens (Mappa Motus "Cheapest Nearby",
 * Previsioni Pro "Best Predicted Stations") — shared by every station list
 * (S01/S02/S04, Favorites), so one component change gives all four a
 * consistent look. Still no Motus domain knowledge beyond the fuel-icon
 * convention (architecture.md §3).
 */
export function ListItem({
  title,
  subtitle,
  trailing,
  onPress,
  testID,
}: ListItemProps) {
  const content = (
    <>
      <View className="h-10 w-10 items-center justify-center rounded-full border-hairline border-border bg-surfaceContainerLowest">
        <Icon name="local-gas-station" color="muted" size={18} />
      </View>
      <View className="flex-1 gap-xs">
        <AppText variant="body" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color="muted" numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {trailing}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        testID={testID}
        className={`${CONTAINER_CLASSNAME} active:bg-surfaceContainerLow`}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View testID={testID} className={CONTAINER_CLASSNAME}>
      {content}
    </View>
  );
}
