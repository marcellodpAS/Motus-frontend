import { useCallback, useEffect, useRef, useState } from "react";

import * as pricesService from "@/services/motus/prices";
import type { Pagination, PriceRow } from "@/services/motus/types";

const PAGE_SIZE = 50;

export type PricesSearchStatus = "idle" | "loading" | "success" | "error";

export interface PricesSearchFilters {
  carburante?: string;
  provincia?: string;
  comune?: string;
}

export interface UsePricesSearchResult {
  status: PricesSearchStatus;
  data: PriceRow[];
  pagination: Pagination | null;
  errorMessage: string | null;
  filters: PricesSearchFilters;
  setFilters: (filters: PricesSearchFilters) => void;
  hasMore: boolean;
  loadMore: () => void;
  retry: () => void;
}

interface PendingRequest {
  offset: number;
  append: boolean;
}

function hasAnyFilter(filters: PricesSearchFilters): boolean {
  return Boolean(filters.carburante || filters.provincia || filters.comune);
}

/**
 * Data hook for S02 (VS4, docs/motus/feature-backlog.md §VS4). Unlike
 * `useStationsSearch`, this one does not fetch on mount: the product
 * constraint in api-screen-mapping.md §S02 requires at least one filter
 * before the first call — otherwise every open of this screen would pull
 * the entire ~93k row table. `status` stays `"idle"` (no request made)
 * until `filters` has at least one non-empty value.
 */
export function usePricesSearch(
  initialFilters: PricesSearchFilters = {},
): UsePricesSearchResult {
  const [filters, setFilters] = useState<PricesSearchFilters>(initialFilters);
  const [status, setStatus] = useState<PricesSearchStatus>(
    hasAnyFilter(initialFilters) ? "loading" : "idle",
  );
  const [data, setData] = useState<PriceRow[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const abortRef = useRef<AbortController | null>(null);
  const lastRequestRef = useRef<PendingRequest>({ offset: 0, append: false });

  const runSearch = useCallback(
    (nextFilters: PricesSearchFilters, offset: number, append: boolean) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      lastRequestRef.current = { offset, append };

      setStatus("loading");
      setErrorMessage(null);

      pricesService
        .search(
          { ...nextFilters, limit: PAGE_SIZE, offset },
          { signal: controller.signal },
        )
        .then((result) => {
          setData((prev) => (append ? [...prev, ...result.data] : result.data));
          setPagination(result.pagination);
          setHasMore(offset + result.data.length < result.pagination.total);
          setStatus("success");
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) return;
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Si è verificato un errore imprevisto.",
          );
          setStatus("error");
        });
    },
    [],
  );

  useEffect(() => {
    if (!hasAnyFilter(filters)) {
      abortRef.current?.abort();
      setStatus("idle");
      setData([]);
      setPagination(null);
      setHasMore(true);
      return;
    }
    runSearch(filters, 0, false);
    return () => abortRef.current?.abort();
  }, [filters, runSearch]);

  const updateFilters = useCallback((next: PricesSearchFilters) => {
    setFilters(next);
  }, []);

  const loadMore = useCallback(() => {
    if (status === "loading" || !hasMore) return;
    runSearch(filters, data.length, true);
  }, [status, hasMore, filters, data.length, runSearch]);

  const retry = useCallback(() => {
    if (!hasAnyFilter(filters)) return;
    const { offset, append } = lastRequestRef.current;
    runSearch(filters, offset, append);
  }, [filters, runSearch]);

  return {
    status,
    data,
    pagination,
    errorMessage,
    filters,
    setFilters: updateFilters,
    hasMore,
    loadMore,
    retry,
  };
}
