import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/atoms/AppText";

export interface ListItemProps {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  testID?: string;
}

const CONTAINER_CLASSNAME =
  "min-h-touch-comfortable flex-row items-center justify-between gap-sm border-b-hairline border-border py-sm";

/** Generic pressable row: title/subtitle + optional trailing slot. No Motus domain knowledge (architecture.md §3). */
export function ListItem({
  title,
  subtitle,
  trailing,
  onPress,
  testID,
}: ListItemProps) {
  const content = (
    <>
      <View className="flex-1 gap-xs">
        <AppText variant="body">{title}</AppText>
        {subtitle ? (
          <AppText variant="caption" color="muted">
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
        className={CONTAINER_CLASSNAME}
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
