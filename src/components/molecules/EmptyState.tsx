import { View } from "react-native";

import { AppText } from "@/components/atoms/AppText";
import { Button } from "@/components/atoms/Button";

export interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Presentational "no content" state: message + optional single action. */
export function EmptyState({
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-sm px-md">
      <AppText variant="body" color="muted" className="text-center">
        {message}
      </AppText>
      {actionLabel && onAction ? (
        <Button onPress={onAction}>{actionLabel}</Button>
      ) : null}
    </View>
  );
}
