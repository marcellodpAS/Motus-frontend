import { useRouter } from "expo-router";

import { InfoPanel } from "@/components/organisms/InfoPanel";
import { ScrollScreenTemplate } from "@/components/templates/ScrollScreenTemplate";

export interface StationDetailScreenProps {
  id: string;
}

/**
 * S03 screen shell (docs/motus/screen-inventory.md). The data-fetching hook
 * is a separate, not-yet-built task (VS3, docs/motus/feature-backlog.md);
 * this component shows the real `id_impianto` route param it received
 * instead of fabricated station data, per the Task 12 constraint against
 * permanent fake data.
 */
export function StationDetailScreen({ id }: StationDetailScreenProps) {
  const router = useRouter();

  return (
    <ScrollScreenTemplate
      title="Dettaglio impianto"
      onBack={() => router.back()}
    >
      <InfoPanel rows={[{ label: "ID impianto", value: id }]} />
    </ScrollScreenTemplate>
  );
}
