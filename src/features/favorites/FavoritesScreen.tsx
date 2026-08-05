import { useRouter } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/atoms/AppText";
import { EmptyState } from "@/components/molecules/EmptyState";
import { ErrorState } from "@/components/molecules/ErrorState";
import { ListItem } from "@/components/molecules/ListItem";
import { LoadingPanel } from "@/components/organisms/LoadingPanel";
import { MotusHeader } from "@/components/organisms/MotusHeader";
import { useFavorites } from "@/features/favorites/useFavorites";
import { cheapestPrice, stationTitle } from "@/services/motus/stationDisplay";

/**
 * Tab "Favorites" (Task 19, `stitch-implementation-gap.md` row 10): no
 * dedicated Stitch screen exists for this in the export (only the "Save"
 * button in Dettaglio Stazione and the tab itself), so the layout is a
 * plain list of saved stations — the one Stitch-referenced screen with no
 * mockup to match pixel-for-pixel.
 */
export function FavoritesScreen() {
  const router = useRouter();
  const { status, favorites, errorMessage, retry } = useFavorites();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <MotusHeader logoPosition="left" />
      <View className="flex-1 px-md">
        {status === "loading" ? <LoadingPanel /> : null}
        {status === "error" ? (
          <ErrorState
            message={errorMessage ?? "Si è verificato un errore."}
            onRetry={retry}
          />
        ) : null}
        {status === "empty" ? (
          <EmptyState message="Nessun impianto salvato. Aggiungi un impianto ai preferiti dalla sua pagina di dettaglio." />
        ) : null}
        {status === "success"
          ? favorites.map(({ station, prices }) => {
              const price = cheapestPrice(prices);
              return (
                <ListItem
                  key={station.id_impianto}
                  title={stationTitle(station)}
                  subtitle={`${station.comune} (${station.provincia})`}
                  trailing={
                    price ? (
                      <AppText variant="caption">{price}</AppText>
                    ) : undefined
                  }
                  onPress={() =>
                    router.push({
                      pathname: "/stations/[id]",
                      params: { id: String(station.id_impianto) },
                    })
                  }
                />
              );
            })
          : null}
      </View>
    </SafeAreaView>
  );
}
