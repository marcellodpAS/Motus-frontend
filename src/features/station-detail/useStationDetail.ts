import { useCallback, useEffect, useRef, useState } from "react";

import { ApiHttpError } from "@/services/motus/errors";
import * as stationsService from "@/services/motus/stations";
import type { Price, StationSummary } from "@/services/motus/types";

export type StationDetailStatus = "loading" | "success" | "not-found" | "error";

export interface UseStationDetailResult {
  status: StationDetailStatus;
  station: StationSummary | null;
  prices: Price[];
  errorMessage: string | null;
  retry: () => void;
}

/**
 * Data hook for S03 (VS3, docs/motus/feature-backlog.md §VS3). A 404 is
 * split into its own `"not-found"` status (distinct from a generic
 * `"error"`) so the screen can skip offering a retry action that would
 * just repeat the same not-found response — the message text itself still
 * comes straight from the server, since the client can't tell a truly
 * missing `id_impianto` apart from a malformed one (api-screen-mapping.md
 * §S03: both return 404, only one has a specific message).
 */
export function useStationDetail(id: string): UseStationDetailResult {
  const [status, setStatus] = useState<StationDetailStatus>("loading");
  const [station, setStation] = useState<StationSummary | null>(null);
  const [prices, setPrices] = useState<Price[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("loading");
    setErrorMessage(null);

    stationsService
      .getById(id, { signal: controller.signal })
      .then((result) => {
        setStation(result.station);
        setPrices(result.prices);
        setStatus("success");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Si è verificato un errore imprevisto.",
        );
        setStatus(
          error instanceof ApiHttpError && error.status === 404
            ? "not-found"
            : "error",
        );
      });
  }, [id]);

  useEffect(() => {
    run();
    return () => abortRef.current?.abort();
  }, [run]);

  return { status, station, prices, errorMessage, retry: run };
}
