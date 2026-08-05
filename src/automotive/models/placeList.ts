import type { Station } from "@/services/motus";

import type { AutomotivePlaceListViewModel } from "../types/template";
import { toPlaceItem } from "./placeItem";

export interface PlaceListSource {
  /** Short, flat title for the whole list — e.g. "Impianti vicini", not a filter-echoing sentence. */
  headline: string;
  stations: Station[];
  /** Keyed by id_impianto, only present for a location-backed list (nearby, VS5). */
  distanceByStationId?: Map<number, number>;
}

export function toPlaceListViewModel(
  source: PlaceListSource,
): AutomotivePlaceListViewModel {
  return {
    template: "place-list",
    headline: source.headline,
    items: source.stations.map((station) =>
      toPlaceItem(
        station,
        source.distanceByStationId?.get(station.id_impianto),
      ),
    ),
  };
}
