import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/atoms/AppText";
import { Icon } from "@/components/atoms/Icon";
import { MotusLogo } from "@/components/atoms/MotusLogo";

export interface AppHeaderProps {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
}

/**
 * Structural top bar: optional back action, brand mark, title, optional
 * trailing slot. Carries the small `MotusLogo` mark next to the title
 * (Task 19: every Stitch header does the same,
 * `stitch-screen-inventory.md` §1) so every `ScreenTemplate`-based screen
 * (S01/S02/S04) picks up the brand without each screen wiring it
 * individually. Takes `onBack` as a callback rather than importing
 * `expo-router` itself — organisms receive data/callbacks via props and
 * never own navigation (architecture.md §3).
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
          <Icon name="arrow-back" color="muted" />
        </Pressable>
      ) : (
        <MotusLogo markOnly size={18} />
      )}
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
