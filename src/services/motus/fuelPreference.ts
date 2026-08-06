/**
 * `carburante` is free text, not an enumerated field — 31+ distinct real
 * values observed in a 5000-row sample (`docs/motus/api-contract.md`
 * §GET /api/prices, non-exhaustive), including brand-specific variants
 * like "Benzina Shell V Power" or "Gasolio Artico Igloo" alongside plain
 * "Benzina"/"Gasolio". These are the macro categories from that same
 * sample — a starting point for the preference picker, not a claim that
 * this list is exhaustive or that the backend enumerates it anywhere.
 */
export const KNOWN_FUEL_CATEGORIES = [
  "Benzina",
  "Gasolio",
  "GPL",
  "Metano",
  "GNL",
  "Diesel",
  "HVO",
] as const;

/**
 * Case-insensitive substring match — deliberately the same semantics the
 * backend already uses for `GET /api/prices?carburante=` (`LIKE %valore%`,
 * `api-contract.md` §Filtri), so a preference for "Benzina" matches every
 * branded variant ("Benzina Shell V Power", "Benzina Energy 98 ottani",
 * ...) the same way filtering by that endpoint already would. This is not
 * an invented heuristic — it mirrors the one real filtering behavior the
 * backend confirms it has for this field.
 */
export function matchesFuelPreference(
  carburante: string,
  selected: readonly string[],
): boolean {
  if (selected.length === 0) return true;
  const normalized = carburante.toLowerCase();
  return selected.some((fuel) => normalized.includes(fuel.toLowerCase()));
}
