import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/atoms/AppText";
import { Icon } from "@/components/atoms/Icon";
import { ErrorState } from "@/components/molecules/ErrorState";
import { HeaderIconButton } from "@/components/molecules/HeaderIconButton";
import { MapPin } from "@/components/molecules/MapPin";
import { LoadingPanel } from "@/components/organisms/LoadingPanel";
import { MotusHeader } from "@/components/organisms/MotusHeader";
import { projectCoordinates } from "@/features/map/mapProjection";
import { useNearbyStations } from "@/features/nearby-stations/useNearbyStations";
import { openExternalNavigation } from "@/services/motus/externalNavigation";
import { cheapestPrice, stationTitle } from "@/services/motus/stationDisplay";
import type { NearbyStation } from "@/services/motus/types";
import { getShadowStyle } from "@/theme";

function cheapestValue(station: NearbyStation): number | null {
  if (station.prices.length === 0) return null;
  return Math.min(...station.prices.map((price) => price.prezzo));
}

/**
 * Tab "Map" (Task 19): home tab, reproducing Mappa Motus
 * (`stitch-screen-inventory.md` §5, Stitch ID
 * `cf26daff4b3e45a9bb74e23565803016`). Reuses `useNearbyStations` as-is —
 * this is the same real data (`GET /api/stations/nearby`) already powering
 * the S04 list route, presented as pins instead of rows
 * (`stitch-implementation-gap.md` row 9), so the two screens never diverge
 * on what "nearby" means or duplicate the permission/geolocation state
 * machine.
 */
export function MapScreen() {
  const router = useRouter();
  const { status, data, errorMessage, retry } = useNearbyStations();

  const ranked = useMemo(
    () =>
      [...data].sort((a, b) => {
        const priceA = cheapestValue(a) ?? Infinity;
        const priceB = cheapestValue(b) ?? Infinity;
        return priceA - priceB;
      }),
    [data],
  );
  const cheapestId = ranked[0]?.id_impianto;

  const points = useMemo(
    () =>
      projectCoordinates(
        data.map((station) => ({
          latitude: station.latitudine_completa as number,
          longitude: station.longitudine_completa as number,
        })),
      ),
    [data],
  );

  const goToStation = (id: number) =>
    router.push({ pathname: "/stations/[id]", params: { id: String(id) } });

  if (status === "requesting-permission" || status === "loading") {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <LoadingPanel
          message={
            status === "requesting-permission"
              ? "Richiesta del permesso di posizione…"
              : "Ricerca degli impianti più vicini…"
          }
        />
      </SafeAreaView>
    );
  }

  if (
    status === "permission-denied" ||
    status === "unavailable" ||
    status === "error"
  ) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <MotusHeader logoPosition="left" showSearchIcon />
        <ErrorState
          message={errorMessage ?? "Si è verificato un errore."}
          onRetry={retry}
        />
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-mapBackground">
      <View className="flex-1">
        {data.length === 0 ? (
          <View className="flex-1 items-center justify-center px-lg">
            <AppText color="muted" className="text-center">
              Nessun impianto con coordinate disponibili nelle vicinanze.
            </AppText>
          </View>
        ) : (
          data.map((station, index) => {
            const price = cheapestPrice(station.prices);
            if (!price) return null;
            const point = points[index];
            return (
              <View
                key={station.id_impianto}
                className="absolute"
                style={{ left: `${point.left}%`, top: `${point.top}%` }}
              >
                <MapPin
                  priceLabel={price}
                  highlighted={station.id_impianto === cheapestId}
                  accessibilityLabel={`${stationTitle(station)}, ${price}`}
                  onPress={() => goToStation(station.id_impianto)}
                />
              </View>
            );
          })
        )}
      </View>

      <MotusHeader transparent logoPosition="center" showSearchIcon />

      {ranked.length > 0 ? (
        <View
          className="absolute bottom-0 left-0 right-0 max-h-[60%] rounded-t-2xl border-hairline border-b-0 border-border bg-surface"
          style={getShadowStyle("sheet")}
        >
          <View className="items-center pb-xs pt-sm">
            <View className="h-1.5 w-12 rounded-full bg-outlineVariant" />
          </View>
          <View className="flex-row items-center justify-between border-b-hairline border-border px-md pb-sm">
            <View>
              <View className="flex-row items-center gap-xs">
                <Icon name="local-gas-station" color="primary" size={20} />
                <AppText accessibilityRole="header" variant="headlineMd">
                  Impianti più vicini
                </AppText>
              </View>
              <AppText variant="bodyMd" color="muted">
                Ordinati per prezzo più basso
              </AppText>
            </View>
            <HeaderIconButton
              icon="view-list"
              accessibilityLabel="Vedi come elenco"
              onPress={() => router.push("/nearby")}
              color="primary"
            />
          </View>
          <ScrollView className="px-xs py-xs">
            {ranked.map((station) => {
              const price = cheapestPrice(station.prices);
              const isCheapest = station.id_impianto === cheapestId;
              return (
                <Pressable
                  key={station.id_impianto}
                  accessibilityRole="button"
                  onPress={() => goToStation(station.id_impianto)}
                  className={`m-xs flex-row items-center gap-sm rounded-xl p-sm ${
                    isCheapest
                      ? "border-hairline border-primary bg-selected"
                      : "border-hairline border-border bg-surface"
                  }`}
                >
                  <View className="h-12 w-12 items-center justify-center rounded-lg border-hairline border-border bg-surfaceContainerLowest">
                    <Icon name="local-gas-station" color="muted" size={20} />
                  </View>
                  <View className="flex-1">
                    <AppText variant="headlineMd" numberOfLines={1}>
                      {stationTitle(station)}
                    </AppText>
                    <AppText variant="bodyMd" color="muted">
                      {`${station.distance_km.toFixed(1)} km`}
                    </AppText>
                  </View>
                  <View className="items-end gap-xs">
                    <AppText
                      variant="title"
                      color={isCheapest ? "primary" : "foreground"}
                      className="font-bold"
                    >
                      {price ?? "—"}
                    </AppText>
                    {station.latitudine_completa !== null &&
                    station.longitudine_completa !== null ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Naviga verso ${stationTitle(station)}`}
                        onPress={() =>
                          void openExternalNavigation(
                            station.latitudine_completa as number,
                            station.longitudine_completa as number,
                          )
                        }
                        className="flex-row items-center gap-xs"
                      >
                        <AppText variant="labelMd" color="primary">
                          Naviga
                        </AppText>
                        <Icon name="arrow-forward" color="primary" size={14} />
                      </Pressable>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}
