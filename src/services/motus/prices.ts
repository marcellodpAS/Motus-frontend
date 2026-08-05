import { apiClient } from "./client";
import type { Pagination, PriceRow } from "./types";

export interface PricesSearchParams {
  carburante?: string;
  provincia?: string;
  comune?: string;
  limit?: number;
  offset?: number;
}

export interface PricesSearchResult {
  data: PriceRow[];
  pagination: Pagination;
}

export interface PricesSearchRequestOptions {
  signal?: AbortSignal;
}

/** GET /api/prices — VS4, S02. */
export async function search(
  params: PricesSearchParams = {},
  options: PricesSearchRequestOptions = {},
): Promise<PricesSearchResult> {
  return apiClient.get<PricesSearchResult>("/api/prices", {
    query: {
      carburante: params.carburante,
      provincia: params.provincia,
      comune: params.comune,
      limit: params.limit,
      offset: params.offset,
    },
    signal: options.signal,
  });
}
