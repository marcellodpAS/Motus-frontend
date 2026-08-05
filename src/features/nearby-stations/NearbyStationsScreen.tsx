import { useRouter } from "expo-router";

import { AppText } from "@/components/atoms/AppText";
import { ListItem } from "@/components/molecules/ListItem";
import {
  FunctionalList,
  type FunctionalListStatus,
} from "@/components/organisms/FunctionalList";
import { ScreenTemplate } from "@/components/templates/ScreenTemplate";
import {
  useNearbyStations,
  type NearbyStatus,
} from "@/features/nearby-stations/useNearbyStations";
import { cheapestPrice, stationTitle } from "@/services/motus/stationDisplay";
import type { NearbyStation } from "@/services/motus/types";

function toListStatus(
  status: NearbyStatus,
  dataLength: number,
): FunctionalListStatus {
  switch (status) {
    case "requesting-permission":
    case "loading":
      return "loading";
    case "permission-denied":
    case "unavailable":
    case "error":
      return "error";
    case "success":
      return dataLength === 0 ? "empty" : "success";
  }
}

function loadingMessage(status: NearbyStatus): string | undefined {
  return status === "requesting-permission"
    ? "Richiesta del permesso di posizione…"
    : "Ricerca degli impianti più vicini…";
}

/**
 * S04 screen (docs/motus/screen-inventory.md, VS5 in
 * docs/motus/feature-backlog.md). No text filter — the "filter" is the
 * device's current position, entirely owned by `useNearbyStations`, which
 * also distinguishes permission-denied/services-disabled from a genuinely
 * empty result (api-screen-mapping.md §S04).
 */
export function NearbyStationsScreen() {
  const router = useRouter();
  const { status, data, errorMessage, retry } = useNearbyStations();

  return (
    <ScreenTemplate title="Impianti vicini" onBack={() => router.back()}>
      <FunctionalList<NearbyStation>
        status={toListStatus(status, data.length)}
        data={data}
        loadingMessage={loadingMessage(status)}
        emptyMessage="Nessun impianto con coordinate disponibili nelle vicinanze."
        errorMessage={errorMessage ?? undefined}
        onRetry={retry}
        keyExtractor={(station) => String(station.id_impianto)}
        renderItem={(station) => {
          const price = cheapestPrice(station.prices);
          return (
            <ListItem
              title={stationTitle(station)}
              subtitle={`${station.comune} (${station.provincia}) · ${station.distance_km.toFixed(1)} km`}
              trailing={
                price ? <AppText variant="caption">{price}</AppText> : undefined
              }
              onPress={() =>
                router.push({
                  pathname: "/stations/[id]",
                  params: { id: String(station.id_impianto) },
                })
              }
            />
          );
        }}
      />
    </ScreenTemplate>
  );
}
