import { apiClient } from "./client";
import type { Pagination, Station } from "./types";

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

/**
 * GET /api/stations — only endpoint needed by the first vertical slice
 * (VS2, S01). getById/nearby are added when their own slice is built
 * (docs/motus/implementation-plan.md).
 */
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
