import { View } from "react-native";

import { AppText } from "@/components/atoms/AppText";
import { Spinner } from "@/components/atoms/Spinner";

export interface LoadingPanelProps {
  message?: string;
}

/** Full-space loading filler: spinner + optional caption. */
export function LoadingPanel({
  message = "Caricamento in corso",
}: LoadingPanelProps) {
  return (
    <View className="flex-1 items-center justify-center gap-sm">
      <Spinner size="lg" />
      {message ? (
        <AppText variant="caption" color="muted">
          {message}
        </AppText>
      ) : null}
    </View>
  );
}
