import { matchesFuelPreference } from "./fuelPreference";
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

function formatPrice(value: number): string {
  return `${value.toFixed(3)} €`;
}

/**
 * Cheapest price across a station's `prices[]`, or `undefined` for the
 * observed-live `prices: []` case (impianto 3498, "NURE SUD"). Shared by
 * S01 and S04 — both render a `Station` result row with the same summary
 * price.
 *
 * `preferredFuels` (Task 19 follow-up: preferred-fuel setting) narrows the
 * candidates to those matching the user's preference first — but falls
 * back to the overall cheapest when the preference matches nothing at
 * this particular station, so a preference never turns real data into a
 * blank "no price" row.
 */
export function cheapestPrice(
  prices: Price[],
  preferredFuels: readonly string[] = [],
): string | undefined {
  if (prices.length === 0) return undefined;
  const matching = prices.filter((price) =>
    matchesFuelPreference(price.carburante, preferredFuels),
  );
  const candidates = matching.length > 0 ? matching : prices;
  const cheapest = candidates.reduce((min, price) =>
    price.prezzo < min.prezzo ? price : min,
  );
  return formatPrice(cheapest.prezzo);
}

export interface PreferredPriceLine {
  fuel: string;
  priceLabel: string;
}

/**
 * One cheapest price per selected fuel preference, each labelled with the
 * fuel it matched — used when 2+ fuels are selected so a row can show
 * "Benzina 1.85 € · Gasolio 1.72 €" instead of collapsing to a single
 * number that would hide which fuel it's for. A fuel with no matching
 * price at this station is simply omitted (never a fabricated 0/blank
 * row) — callers with zero or one preferred fuel should use
 * `cheapestPrice` instead, this is specifically the multi-fuel case.
 */
export function preferredPriceBreakdown(
  prices: Price[],
  preferredFuels: readonly string[],
): PreferredPriceLine[] {
  return preferredFuels
    .map((fuel) => {
      const matching = prices.filter((price) =>
        matchesFuelPreference(price.carburante, [fuel]),
      );
      if (matching.length === 0) return null;
      const cheapest = matching.reduce((min, price) =>
        price.prezzo < min.prezzo ? price : min,
      );
      return { fuel, priceLabel: formatPrice(cheapest.prezzo) };
    })
    .filter((line): line is PreferredPriceLine => line !== null);
}
