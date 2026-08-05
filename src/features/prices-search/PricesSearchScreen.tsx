import { useRouter } from "expo-router";
import { View } from "react-native";

import { AppText } from "@/components/atoms/AppText";
import { TextInput } from "@/components/atoms/TextInput";
import { ListItem } from "@/components/molecules/ListItem";
import {
  FunctionalList,
  type FunctionalListStatus,
} from "@/components/organisms/FunctionalList";
import { ScreenTemplate } from "@/components/templates/ScreenTemplate";
import {
  usePricesSearch,
  type PricesSearchStatus,
} from "@/features/prices-search/usePricesSearch";
import { formatDataComunicazione } from "@/services/motus/priceFormat";
import type { PriceRow } from "@/services/motus/types";

function toListStatus(
  status: PricesSearchStatus,
  dataLength: number,
): FunctionalListStatus {
  switch (status) {
    case "idle":
      return "empty";
    case "loading":
      return "loading";
    case "error":
      return "error";
    case "success":
      return dataLength === 0 ? "empty" : "success";
  }
}

/** `PriceRow` (ADR-0001) has no `bandiera`, unlike `Station` — only `nome_impianto` / the id remain as a fallback. */
function priceRowTitle(row: PriceRow): string {
  return row.nome_impianto || `Impianto ${row.id_impianto}`;
}

/**
 * S02 screen (docs/motus/screen-inventory.md, VS4 in
 * docs/motus/feature-backlog.md). Three independent filters (no unified
 * `q`, unlike S01: /api/prices has no such param) — the screen requires at
 * least one before `usePricesSearch` issues any request.
 */
export function PricesSearchScreen() {
  const router = useRouter();
  const { status, data, errorMessage, filters, setFilters, loadMore, retry } =
    usePricesSearch();

  const listStatus = toListStatus(status, data.length);
  const emptyMessage =
    status === "idle"
      ? "Inserisci almeno un filtro (carburante, comune o provincia) per iniziare la ricerca."
      : "Nessun prezzo trovato per i filtri inseriti.";

  return (
    <ScreenTemplate
      title="Prezzi carburante"
      onBack={() => router.back()}
      contentClassName="px-md gap-sm"
    >
      <View className="gap-sm">
        <TextInput
          label="Carburante"
          value={filters.carburante ?? ""}
          onChangeText={(text) =>
            setFilters({ ...filters, carburante: text || undefined })
          }
          placeholder="Es. Benzina, Gasolio, GPL"
          autoCorrect={false}
          autoCapitalize="none"
        />
        <TextInput
          label="Comune"
          value={filters.comune ?? ""}
          onChangeText={(text) =>
            setFilters({ ...filters, comune: text || undefined })
          }
          placeholder="Es. Roma"
          autoCorrect={false}
          autoCapitalize="none"
        />
        <TextInput
          label="Provincia"
          value={filters.provincia ?? ""}
          onChangeText={(text) =>
            setFilters({ ...filters, provincia: text || undefined })
          }
          placeholder="Es. RM"
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>
      <FunctionalList<PriceRow>
        status={listStatus}
        data={data}
        emptyMessage={emptyMessage}
        errorMessage={errorMessage ?? undefined}
        onRetry={retry}
        onEndReached={loadMore}
        keyExtractor={(row) =>
          `${row.id_impianto}-${row.carburante}-${row.self_service}`
        }
        renderItem={(row) => (
          <ListItem
            title={priceRowTitle(row)}
            subtitle={`${row.comune} (${row.provincia}) · ${row.carburante} · ${row.self_service ? "self" : "servito"} · ${formatDataComunicazione(row.data_comunicazione)}`}
            trailing={
              <AppText variant="caption">{`${row.prezzo.toFixed(3)} €`}</AppText>
            }
            onPress={() =>
              router.push({
                pathname: "/stations/[id]",
                params: { id: String(row.id_impianto) },
              })
            }
          />
        )}
      />
    </ScreenTemplate>
  );
}
