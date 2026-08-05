import { apiClient } from "./client";
import type {
  NearbyStation,
  Pagination,
  Station,
  StationSummary,
} from "./types";

export interface StationsSearchParams {
  comune?: string;
  provincia?: string;
  q?: string;
  limit?: number;
  offset?: number;
}

export interface StationsSearchResult {
  data: Station[];
  pagination: Pagination;
}

export interface StationsSearchRequestOptions {
  signal?: AbortSignal;
}

/** GET /api/stations — first vertical slice (VS2, S01). */
export async function search(
  params: StationsSearchParams = {},
  options: StationsSearchRequestOptions = {},
): Promise<StationsSearchResult> {
  return apiClient.get<StationsSearchResult>("/api/stations", {
    query: {
      comune: params.comune,
      provincia: params.provincia,
      q: params.q,
      limit: params.limit,
      offset: params.offset,
    },
    signal: options.signal,
  });
}

export interface StationDetailResult {
  station: StationSummary;
  prices: Station["prices"];
}

export interface StationDetailRequestOptions {
  signal?: AbortSignal;
}

/**
 * GET /api/stations/{id} — VS3, S03. `id` stays a string: it comes straight
 * from the Expo Router route param, and a non-numeric value is a real,
 * server-observed case (404 "endpoint non trovato", api-contract.md) that
 * the client must surface, not pre-validate away.
 */
export async function getById(
  id: string,
  options: StationDetailRequestOptions = {},
): Promise<StationDetailResult> {
  return apiClient.get<StationDetailResult>(`/api/stations/${id}`, {
    signal: options.signal,
  });
}

export interface NearbyParams {
  lat: number;
  lon: number;
  limit?: number;
}

export interface NearbyResult {
  origin: { lat: number; lon: number };
  data: NearbyStation[];
  pagination: Pagination;
}

interface RawNearbyResult {
  origin: { lat: number; lon: number };
  data: NearbyStation[];
  pagination: { limit: number; total_available: number };
}

export interface NearbyRequestOptions {
  signal?: AbortSignal;
}

/**
 * GET /api/stations/nearby — VS5, S04. The server's `pagination` here has
 * no `offset` and names the total `total_available` instead of `total`
 * (api-discrepancies.md); normalized to the shared `Pagination` shape here
 * so callers only ever see `total` (ADR-0001). `offset` is fixed at 0: the
 * server accepts but silently ignores it for this endpoint, so a client
 * offset would be a false promise of pagination that doesn't exist.
 */
export async function nearby(
  params: NearbyParams,
  options: NearbyRequestOptions = {},
): Promise<NearbyResult> {
  const raw = await apiClient.get<RawNearbyResult>("/api/stations/nearby", {
    query: { lat: params.lat, lon: params.lon, limit: params.limit },
    signal: options.signal,
  });

  return {
    origin: raw.origin,
    data: raw.data,
    pagination: {
      limit: raw.pagination.limit,
      offset: 0,
      total: raw.pagination.total_available,
    },
  };
}
