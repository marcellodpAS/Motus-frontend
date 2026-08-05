import type { Station } from "./types";

/**
 * `nome_impianto` is observed empty live (impianto 57660, docs/motus/api-contract.md);
 * falls back to `bandiera`, then the id. Shared by the mobile S01/S03 screens
 * and the automotive view models (docs/motus/automotive-shared-model.md §1)
 * so both surfaces never disagree on what a station is called.
 */
export function stationTitle(station: Station): string {
  return (
    station.nome_impianto ||
    station.bandiera ||
    `Impianto ${station.id_impianto}`
  );
}
