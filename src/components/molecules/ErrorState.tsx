import { View } from "react-native";

import { AppText } from "@/components/atoms/AppText";
import { Button } from "@/components/atoms/Button";

export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

/**
 * Presentational error state: message + optional retry action (VS1,
 * docs/motus/feature-backlog.md). `message` is a plain string and never
 * assumes a specific `{"error"}` response shape — the 500 body has never
 * been observed live (docs/motus/api-contract.md).
 */
export function ErrorState({
  message,
  onRetry,
  retryLabel = "Riprova",
}: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-sm px-md">
      <AppText variant="body" color="danger" className="text-center">
        {message}
      </AppText>
      {onRetry ? <Button onPress={onRetry}>{retryLabel}</Button> : null}
    </View>
  );
}
