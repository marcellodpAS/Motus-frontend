import { useLocalSearchParams } from "expo-router";

import { ReportPriceScreen } from "@/features/report-price/ReportPriceScreen";

/** Route: reads `id_impianto` and composes the Segnala Prezzo feature screen. No shared components or business logic here (architecture.md §2). */
export default function ReportPriceRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <ReportPriceScreen id={id} />;
}
