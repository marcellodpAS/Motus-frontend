import { useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/atoms/AppText";
import { Icon } from "@/components/atoms/Icon";
import { ActionPill } from "@/components/molecules/ActionPill";
import { ErrorState } from "@/components/molecules/ErrorState";
import { InfoPanel, type InfoPanelRow } from "@/components/organisms/InfoPanel";
import { LoadingPanel } from "@/components/organisms/LoadingPanel";
import { MotusHeader } from "@/components/organisms/MotusHeader";
import { useStationDetail } from "@/features/station-detail/useStationDetail";
import { openExternalNavigation } from "@/services/motus/externalNavigation";
import { formatDataComunicazione } from "@/services/motus/priceFormat";
import { stationTitle } from "@/services/motus/stationDisplay";
import type { Price, StationSummary } from "@/services/motus/types";
import { useFavoritesStore } from "@/stores/useFavoritesStore";

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

function detailRows(station: StationSummary): InfoPanelRow[] {
  return [
    { label: "Gestore", value: station.gestore || "Non disponibile" },
    { label: "Bandiera", value: station.bandiera || "Non disponibile" },
    {
      label: "Tipo impianto",
      value: station.tipo_impianto || "Non disponibile",
    },
    { label: "Comune", value: `${station.comune} (${station.provincia})` },
    { label: "Coordinate", value: coordinatesLabel(station) },
  ];
}

/** One "Current Prices" row (Stitch: colored bar + badge, `stitch-screen-inventory.md` §3). */
function PriceListItem({ price }: { price: Price }) {
  return (
    <View className="flex-row items-center justify-between py-xs">
      <View className="flex-row items-center gap-md">
        <View
          className={`h-10 w-1.5 rounded-full ${price.self_service ? "bg-success" : "bg-tertiaryContainer"}`}
        />
        <View>
          <AppText variant="body">{price.carburante}</AppText>
          <View className="mt-xs flex-row items-center gap-xs">
            <Icon name="schedule" color="muted" size={14} />
            <AppText variant="caption" color="muted">
              {`Aggiornato: ${formatDataComunicazione(price.data_comunicazione)}`}
            </AppText>
          </View>
        </View>
      </View>
      <View className="items-end gap-xs">
        <AppText variant="headlineMd" className="font-semibold">
          {`${price.prezzo.toFixed(3)} €`}
        </AppText>
        <View
          className={`rounded-2xl px-sm py-xs ${price.self_service ? "bg-selected" : "bg-tertiaryFixed"}`}
        >
          <AppText
            variant="caption"
            color={price.self_service ? "primary" : "onTertiaryContainer"}
          >
            {price.self_service ? "Self Service" : "Servito"}
          </AppText>
        </View>
      </View>
    </View>
  );
}

/** Explicit "not available" note — used for Amenities/Hours, which Stitch shows but the backend has no data for (`stitch-implementation-gap.md` row 3). */
function UnavailableSection({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <View className="gap-sm">
      <AppText variant="headlineMd">{title}</AppText>
      <View className="flex-row items-start gap-sm rounded-xl bg-surfaceContainerLow p-md">
        <Icon name="info" color="outline" size={20} />
        <AppText variant="bodyMd" color="muted" className="flex-1">
          {message}
        </AppText>
      </View>
    </View>
  );
}

/**
 * S03 / Dettaglio Stazione (Task 19): restyled to match Stitch
 * (`stitch-screen-inventory.md` §3, Stitch ID
 * `d3b33d58ae3045d081ea8beba603ba0b`) — hero placeholder, action row
 * (Navigate/Report Price/Save, all real), price list with self/served
 * badge. "Open 24/7" and Amenities/Hours are Stitch content the backend
 * has no field for (`source-requirements-inventory.md` §3) — rendered as
 * an explicit unavailable note instead of fabricated data, never silently
 * dropped or faked (`stitch-implementation-gap.md` row 3).
 */
export function StationDetailScreen({ id }: StationDetailScreenProps) {
  const router = useRouter();
  const { status, station, prices, errorMessage, retry } = useStationDetail(id);
  const isFavorite = useFavoritesStore((state) =>
    station ? state.isFavorite(station.id_impianto) : false,
  );
  const toggleFavorite = useFavoritesStore((state) => state.toggle);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <MotusHeader title="Dettaglio impianto" onBack={() => router.back()} />

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
        <ScrollView className="flex-1">
          <View className="h-[160px] items-center justify-center bg-surfaceContainer">
            <Icon name="map" color="outline" size={40} />
            <AppText variant="caption" color="muted" className="mt-xs">
              Anteprima non disponibile
            </AppText>
          </View>

          <View className="gap-lg px-md py-md">
            <View>
              <AppText variant="headlineLgMobile">
                {stationTitle(station)}
              </AppText>
              <AppText variant="bodyMd" color="muted" className="mt-xs">
                {station.indirizzo ||
                  `${station.comune} (${station.provincia})`}
              </AppText>
            </View>

            <View className="flex-row gap-sm">
              <ActionPill
                icon="directions"
                label="Naviga"
                variant="filled"
                disabled={
                  station.latitudine_completa === null ||
                  station.longitudine_completa === null
                }
                onPress={() =>
                  void openExternalNavigation(
                    station.latitudine_completa as number,
                    station.longitudine_completa as number,
                  )
                }
              />
              <ActionPill
                icon="edit-note"
                label="Segnala prezzo"
                onPress={() =>
                  router.push({
                    pathname: "/stations/[id]/report",
                    params: { id },
                  })
                }
              />
              <ActionPill
                icon={isFavorite ? "favorite" : "favorite-outline"}
                label={isFavorite ? "Salvato" : "Salva"}
                onPress={() => toggleFavorite(station.id_impianto)}
              />
            </View>

            <View className="h-px bg-surfaceContainerHigh" />

            {prices.length === 0 ? (
              <View className="gap-sm">
                <AppText variant="headlineMd">Prezzi attuali</AppText>
                <AppText color="muted">
                  Nessun prezzo comunicato per questo impianto.
                </AppText>
              </View>
            ) : (
              <View className="gap-sm">
                <AppText variant="headlineMd">Prezzi attuali</AppText>
                <View className="gap-sm">
                  {prices.map((price) => (
                    <PriceListItem
                      key={`${price.carburante}-${price.self_service}`}
                      price={price}
                    />
                  ))}
                </View>
              </View>
            )}

            <View className="h-px bg-surfaceContainerHigh" />

            <UnavailableSection
              title="Servizi"
              message="Il backend Motus non fornisce ancora dati sui servizi disponibili (bar, autolavaggio, bagni, negozio, colonnina elettrica) per questo impianto."
            />

            <View className="h-px bg-surfaceContainerHigh" />

            <UnavailableSection
              title="Orari"
              message="Il backend Motus non fornisce ancora gli orari di apertura per questo impianto."
            />

            <View className="h-px bg-surfaceContainerHigh" />

            <InfoPanel title="Dettagli impianto" rows={detailRows(station)} />
          </View>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}
