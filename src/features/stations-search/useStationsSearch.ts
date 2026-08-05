import { useCallback, useEffect, useRef, useState } from "react";

import * as stationsService from "@/services/motus/stations";
import type { Pagination, Station } from "@/services/motus/types";

const PAGE_SIZE = 50;

export type StationsSearchStatus = "loading" | "success" | "error";

export interface StationsSearchFilters {
  comune?: string;
  provincia?: string;
  q?: string;
}

export interface UseStationsSearchResult {
  status: StationsSearchStatus;
  data: Station[];
  pagination: Pagination | null;
  errorMessage: string | null;
  filters: StationsSearchFilters;
  setFilters: (filters: StationsSearchFilters) => void;
  hasMore: boolean;
  loadMore: () => void;
  retry: () => void;
}

interface PendingRequest {
  offset: number;
  append: boolean;
}

/**
 * Data hook for S01 (VS2, docs/motus/feature-backlog.md §VS2). Owns the
 * request lifecycle (filters -> fetch -> loading/success/error) and
 * offset-based pagination for `stations.search`; the screen only renders
 * whatever this hook returns, it never calls the service directly
 * (architecture.md §2/§6).
 */
export function useStationsSearch(
  initialFilters: StationsSearchFilters = {},
): UseStationsSearchResult {
  const [filters, setFilters] = useState<StationsSearchFilters>(initialFilters);
  const [status, setStatus] = useState<StationsSearchStatus>("loading");
  const [data, setData] = useState<Station[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const abortRef = useRef<AbortController | null>(null);
  const lastRequestRef = useRef<PendingRequest>({ offset: 0, append: false });

  const runSearch = useCallback(
    (nextFilters: StationsSearchFilters, offset: number, append: boolean) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      lastRequestRef.current = { offset, append };

      setStatus("loading");
      setErrorMessage(null);

      stationsService
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
    runSearch(filters, 0, false);
    return () => abortRef.current?.abort();
  }, [filters, runSearch]);

  const updateFilters = useCallback((next: StationsSearchFilters) => {
    setFilters(next);
  }, []);

  const loadMore = useCallback(() => {
    if (status === "loading" || !hasMore) return;
    runSearch(filters, data.length, true);
  }, [status, hasMore, filters, data.length, runSearch]);

  const retry = useCallback(() => {
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
