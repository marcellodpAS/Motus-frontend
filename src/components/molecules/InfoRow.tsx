import { View } from "react-native";

import { AppText } from "@/components/atoms/AppText";

export interface InfoRowProps {
  label: string;
  value: string;
}

/** Label/value pair for detail-shaped screens (e.g. station fields in S03). */
export function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View className="flex-row items-start justify-between gap-md py-xs">
      <AppText variant="label" color="muted">
        {label}
      </AppText>
      <AppText variant="body" className="flex-1 text-right">
        {value}
      </AppText>
    </View>
  );
}
