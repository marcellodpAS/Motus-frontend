import type { Station } from "@/services/motus";

import type { AutomotivePlaceItem } from "../types/template";
import { stationTitle } from "./stationTitle";

/** Lowest price across `prices[]`, or undefined for the live-observed empty case (impianto 3498). No selection beyond "lowest" — a single short fact, not a full price list, for a list row. */
function lowestPriceLabel(station: Station): string | undefined {
  if (station.prices.length === 0) return undefined;
  const lowest = station.prices.reduce((min, price) =>
    price.prezzo < min.prezzo ? price : min,
  );
  return `${lowest.carburante} ${lowest.prezzo.toFixed(3)} €`;
}

/**
 * `distanceKm` is passed in rather than read off `Station` because the
 * nearby endpoint (S04/VS5) isn't implemented yet
 * (docs/motus/feature-backlog.md §VS5 is still unbuilt) — `Station` as
 * defined in src/services/motus/types.ts has no `distance_km` field. This
 * keeps the mapping usable today (station.comune/provincia as subtitle) and
 * ready for VS5 without inventing an untyped field on the shared Station
 * type ahead of the endpoint that would actually produce it.
 */
export function toPlaceItem(
  station: Station,
  distanceKm?: number,
): AutomotivePlaceItem {
  const subtitle =
    distanceKm != null
      ? `${distanceKm.toFixed(1)} km`
      : [station.comune, station.provincia].filter(Boolean).join(" · ") ||
        undefined;

  return {
    id: station.id_impianto,
    title: stationTitle(station),
    subtitle,
    priceLabel: lowestPriceLabel(station),
  };
}
