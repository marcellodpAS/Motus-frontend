import type { Price, Station } from "./types";

/**
 * Narrower than `Station` (just `Pick`, not the full type) so both the S01
 * list rows (`Station`) and the S03 detail (`StationSummary`, which omits
 * `prices`) can call this with the same function.
 */
type Titleable = Pick<Station, "id_impianto" | "bandiera" | "nome_impianto">;

/**
 * `nome_impianto` is observed empty live (impianto 57660, docs/motus/api-contract.md);
 * falls back to `bandiera`, then the id. Shared by the mobile S01/S03 screens
 * and the automotive view models (docs/motus/automotive-shared-model.md §1)
 * so both surfaces never disagree on what a station is called.
 */
export function stationTitle(station: Titleable): string {
  return (
    station.nome_impianto ||
    station.bandiera ||
    `Impianto ${station.id_impianto}`
  );
}

/**
 * Cheapest price across a station's `prices[]`, or `undefined` for the
 * observed-live `prices: []` case (impianto 3498, "NURE SUD"). Shared by
 * S01 and S04 — both render a `Station` result row with the same summary
 * price.
 */
export function cheapestPrice(prices: Price[]): string | undefined {
  if (prices.length === 0) return undefined;
  const cheapest = prices.reduce((min, price) =>
    price.prezzo < min.prezzo ? price : min,
  );
  return `${cheapest.prezzo.toFixed(3)} €`;
}
