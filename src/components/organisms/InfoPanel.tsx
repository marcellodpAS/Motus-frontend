import { View } from "react-native";

import { AppText } from "@/components/atoms/AppText";
import { CompactCard } from "@/components/molecules/CompactCard";
import { InfoRow } from "@/components/molecules/InfoRow";

export interface InfoPanelRow {
  label: string;
  value: string;
}

export interface InfoPanelProps {
  title?: string;
  rows: InfoPanelRow[];
}

/** Groups InfoRow entries in a CompactCard, for detail-shaped screens (S03). */
export function InfoPanel({ title, rows }: InfoPanelProps) {
  return (
    <View className="gap-sm">
      {title ? (
        <AppText variant="label" color="muted">
          {title}
        </AppText>
      ) : null}
      <CompactCard>
        {rows.map((row, index) => (
          <View
            key={row.label}
            className={index > 0 ? "border-t-hairline border-border" : ""}
          >
            <InfoRow label={row.label} value={row.value} />
          </View>
        ))}
      </CompactCard>
    </View>
  );
}
