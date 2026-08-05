import { useLocalSearchParams } from "expo-router";

import { StationDetailScreen } from "@/features/station-detail/StationDetailScreen";

/** Route: reads `id_impianto` and composes the S03 feature screen. No shared components or business logic here (architecture.md §2). */
export default function StationDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <StationDetailScreen id={id} />;
}
