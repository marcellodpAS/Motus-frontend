import { useRouter } from "expo-router";
import { View } from "react-native";

import { AppText } from "@/components/atoms/AppText";
import { ErrorState } from "@/components/molecules/ErrorState";
import { InfoPanel, type InfoPanelRow } from "@/components/organisms/InfoPanel";
import { LoadingPanel } from "@/components/organisms/LoadingPanel";
import { ScrollScreenTemplate } from "@/components/templates/ScrollScreenTemplate";
import { useStationDetail } from "@/features/station-detail/useStationDetail";
import { formatDataComunicazione } from "@/services/motus/priceFormat";
import { stationTitle } from "@/services/motus/stationDisplay";
import type { Price, StationSummary } from "@/services/motus/types";

export interface StationDetailScreenProps {
  id: string;
}

function coordinatesLabel(station: StationSummary): string {
  if (
    station.latitudine_completa === null ||
    station.longitudine_completa === null
  ) {
    return "Non disponibili";
  }
  return `${station.latitudine_completa}, ${station.longitudine_completa}`;
}

function stationRows(station: StationSummary): InfoPanelRow[] {
  return [
    { label: "Nome", value: stationTitle(station) },
    { label: "Gestore", value: station.gestore || "Non disponibile" },
    { label: "Bandiera", value: station.bandiera || "Non disponibile" },
    {
      label: "Tipo impianto",
      value: station.tipo_impianto || "Non disponibile",
    },
    { label: "Indirizzo", value: station.indirizzo || "Non disponibile" },
    { label: "Comune", value: `${station.comune} (${station.provincia})` },
    { label: "Coordinate", value: coordinatesLabel(station) },
  ];
}

function priceRows(prices: Price[]): InfoPanelRow[] {
  return prices.map((price) => ({
    label: `${price.carburante} · ${price.self_service ? "self" : "servito"}`,
    value: `${price.prezzo.toFixed(3)} € · ${formatDataComunicazione(price.data_comunicazione)}`,
  }));
}

/**
 * S03 screen (docs/motus/screen-inventory.md, VS3 in
 * docs/motus/feature-backlog.md): delegates the request lifecycle to
 * `useStationDetail`, renders the real station/prices data or an explicit
 * alternate state — never fabricated data.
 */
export function StationDetailScreen({ id }: StationDetailScreenProps) {
  const router = useRouter();
  const { status, station, prices, errorMessage, retry } = useStationDetail(id);

  return (
    <ScrollScreenTemplate
      title="Dettaglio impianto"
      onBack={() => router.back()}
    >
      {status === "loading" ? <LoadingPanel /> : null}

      {status === "error" ? (
        <ErrorState
          message={errorMessage ?? "Si è verificato un errore."}
          onRetry={retry}
        />
      ) : null}

      {status === "not-found" ? (
        <ErrorState message={errorMessage ?? "Impianto non trovato."} />
      ) : null}

      {status === "success" && station ? (
        <>
          <InfoPanel rows={stationRows(station)} />
          {prices.length === 0 ? (
            <View className="gap-sm">
              <AppText variant="label" color="muted">
                Prezzi
              </AppText>
              <AppText color="muted">
                Nessun prezzo comunicato per questo impianto.
              </AppText>
            </View>
          ) : (
            <InfoPanel title="Prezzi" rows={priceRows(prices)} />
          )}
        </>
      ) : null}
    </ScrollScreenTemplate>
  );
}
