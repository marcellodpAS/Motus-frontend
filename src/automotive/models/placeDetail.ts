import type { Station } from "@/services/motus";

import type {
  AutomotiveDetailRow,
  AutomotivePlaceDetailViewModel,
} from "../types/template";
import { stationTitle } from "./stationTitle";

/**
 * Flat row list, no nested groups (Task 14 brief: flat hierarchy). Address
 * first, then one row per price — same ordering the backend already
 * guarantees for `prices[]` (carburante, self_service — VS3 spec,
 * docs/motus/feature-backlog.md, "l'ordine è già garantito dal server, il
 * client non deve riordinare"). Empty `prices: []` (live-observed, impianto
 * 3498) yields a detail with just the address row, not a fabricated
 * "nessun prezzo" row — the mobile detail screen makes the same choice.
 */
export function toPlaceDetailViewModel(
  station: Station,
): AutomotivePlaceDetailViewModel {
  const rows: AutomotiveDetailRow[] = [
    {
      label: "Indirizzo",
      value: station.indirizzo || `${station.comune} (${station.provincia})`,
    },
    ...station.prices.map((price) => ({
      label: price.carburante,
      value: `${price.prezzo.toFixed(3)} €`,
    })),
  ];

  return {
    template: "place-detail",
    title: stationTitle(station),
    rows,
  };
}
