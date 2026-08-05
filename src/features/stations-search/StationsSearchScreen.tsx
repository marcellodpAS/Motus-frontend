import { useRouter } from "expo-router";

import { AppText } from "@/components/atoms/AppText";
import { HeaderIconButton } from "@/components/molecules/HeaderIconButton";
import { ListItem } from "@/components/molecules/ListItem";
import { ListScreenTemplate } from "@/components/templates/ListScreenTemplate";
import type { FunctionalListStatus } from "@/components/organisms/FunctionalList";
import { useStationsSearch } from "@/features/stations-search/useStationsSearch";
import { cheapestPrice, stationTitle } from "@/services/motus/stationDisplay";
import type { Station } from "@/services/motus/types";

/**
 * S01 screen (docs/motus/screen-inventory.md, VS2 in
 * docs/motus/feature-backlog.md): owns navigation to S03 and row rendering,
 * delegates the request lifecycle entirely to `useStationsSearch`.
 */
export function StationsSearchScreen() {
  const router = useRouter();
  const { status, data, errorMessage, filters, setFilters, loadMore, retry } =
    useStationsSearch();

  const listStatus: FunctionalListStatus =
    status === "success" && data.length === 0 ? "empty" : status;

  return (
    <ListScreenTemplate<Station>
      title="Impianti"
      onBack={() => router.back()}
      headerRight={
        <HeaderIconButton
          icon="price-change"
          accessibilityLabel="Cerca prezzi carburante"
          onPress={() => router.push("/prices")}
          color="primary"
        />
      }
      searchValue={filters.q ?? ""}
      onSearchChange={(text) => setFilters({ q: text || undefined })}
      searchPlaceholder="Cerca per comune, provincia..."
      list={{
        status: listStatus,
        data,
        emptyMessage: "Nessun impianto da mostrare.",
        errorMessage: errorMessage ?? undefined,
        onRetry: retry,
        onEndReached: loadMore,
        keyExtractor: (station) => String(station.id_impianto),
        renderItem: (station) => {
          const price = cheapestPrice(station.prices);
          return (
            <ListItem
              title={stationTitle(station)}
              subtitle={`${station.comune} (${station.provincia}) · ${station.bandiera}`}
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
        },
      }}
    />
  );
}
