import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/atoms/AppText";

export interface AppHeaderProps {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
}

/**
 * Structural top bar: optional back action, title, optional trailing slot.
 * Takes `onBack` as a callback rather than importing `expo-router` itself —
 * organisms receive data/callbacks via props and never own navigation
 * (architecture.md §3).
 */
export function AppHeader({ title, onBack, right }: AppHeaderProps) {
  return (
    <View className="min-h-touch-comfortable flex-row items-center gap-sm border-b-hairline border-border px-md">
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Indietro"
          onPress={onBack}
          className="min-h-touch-comfortable min-w-touch-comfortable items-center justify-center"
        >
          <AppText variant="title" color="primary">
            ‹
          </AppText>
        </Pressable>
      ) : null}
      <AppText
        accessibilityRole="header"
        variant="title"
        numberOfLines={1}
        className="flex-1"
      >
        {title}
      </AppText>
      {right}
    </View>
  );
}
