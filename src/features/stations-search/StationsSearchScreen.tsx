import { useState } from "react";
import { useRouter } from "expo-router";

import { ListItem } from "@/components/molecules/ListItem";
import { ListScreenTemplate } from "@/components/templates/ListScreenTemplate";

interface PlaceholderStation {
  id: string;
  title: string;
}

/**
 * S01 screen shell (docs/motus/screen-inventory.md). The data-fetching hook
 * (`useStationsSearch`, VS2 in docs/motus/feature-backlog.md) is a separate,
 * not-yet-built task: this component only owns the screen's structural
 * composition and the navigation to S03, so wiring the real hook later only
 * touches the `list`/`data` values below, never the route or the shared
 * templates/organisms.
 */
export function StationsSearchScreen() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const stations: PlaceholderStation[] = [];

  return (
    <ListScreenTemplate<PlaceholderStation>
      title="Impianti"
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      searchPlaceholder="Cerca per comune, provincia..."
      list={{
        status: "empty",
        data: stations,
        emptyMessage: "Nessun impianto da mostrare.",
        keyExtractor: (station) => station.id,
        renderItem: (station) => (
          <ListItem
            title={station.title}
            onPress={() =>
              router.push({
                pathname: "/stations/[id]",
                params: { id: station.id },
              })
            }
          />
        ),
      }}
    />
  );
}
