/**
 * Types derived field-by-field from docs/motus/api-contract.md (verified
 * live against the running backend). Only the shapes needed by the first
 * vertical slice (GET /api/stations) are modeled here — more resources are
 * added as their vertical slice is implemented.
 */

export type GeocodingStatus =
  "success" | "source_only" | "no_result" | "error" | null;

export interface Price {
  id_impianto: number;
  carburante: string;
  prezzo: number;
  self_service: 0 | 1;
  data_comunicazione: string | null;
  updated_at: string;
}

export interface Station {
  id_impianto: number;
  gestore: string;
  bandiera: string;
  tipo_impianto: string;
  /** Observed empty string "" live (impianto 57660) — not always a real name. */
  nome_impianto: string;
  indirizzo: string;
  comune: string;
  provincia: string;
  latitudine: number | null;
  longitudine: number | null;
  updated_at: string;
  via_geocoded: string | null;
  latitudine_completa: number | null;
  longitudine_completa: number | null;
  geocoding_status: GeocodingStatus;
  /** Observed [] live (impianto 3498, "NURE SUD"). */
  prices: Price[];
}

/**
 * Client-side normalization of the server's pagination inconsistency:
 * /api/stations and /api/prices use `total`, /api/stations/nearby uses
 * `total_available` for the same concept. Consumers only ever see `total`.
 */
export interface Pagination {
  limit: number;
  offset: number;
  total: number;
}

/**
 * GET /api/stations/{id} nests `prices` separately from the station object
 * itself (api-contract.md §GET /api/stations/{id}) — this is the same
 * station shape minus that nested array.
 */
export type StationSummary = Omit<Station, "prices">;

/**
 * GET /api/prices returns a flattened row (ADR-0001): a distinct shape from
 * `Station`, missing `indirizzo`/`gestore`/`bandiera`/`tipo_impianto` on
 * purpose — never forced onto the `Station` type with fake optional fields.
 */
export interface PriceRow extends Price {
  nome_impianto: string;
  comune: string;
  provincia: string;
  via_geocoded: string | null;
  latitudine_completa: number | null;
  longitudine_completa: number | null;
}

/** GET /api/stations/nearby row: same shape as `Station` plus the computed distance. */
export interface NearbyStation extends Station {
  distance_km: number;
}
