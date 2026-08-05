import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";

import * as stationsService from "@/services/motus/stations";
import type { NearbyStation, Pagination } from "@/services/motus/types";

/**
 * api-screen-mapping.md §S04: the server default is 50 (README says 20 —
 * a documented discrepancy, api-discrepancies.md), so the UI must pass
 * `limit=20` explicitly to actually get 20 results.
 */
const RESULT_LIMIT = 20;

export type NearbyStatus =
  | "requesting-permission"
  | "permission-denied"
  | "unavailable"
  | "loading"
  | "success"
  | "error";

export interface UseNearbyStationsResult {
  status: NearbyStatus;
  data: NearbyStation[];
  pagination: Pagination | null;
  errorMessage: string | null;
  retry: () => void;
}

/**
 * Data hook for S04 (VS5, docs/motus/feature-backlog.md §VS5). Owns the
 * full chain — permission request, device location services check,
 * one-shot position fix, `stations.nearby` call — as a single explicit
 * state machine, so "permission denied" and "location services disabled"
 * are never confused with an empty result list (both are real, distinct
 * cases the product needs to tell apart, api-screen-mapping.md §S04).
 * There is no offset-based pagination here (VS5, ADR-0001): the server
 * ignores `offset` for this endpoint, so `retry()` re-runs the whole chain
 * rather than loading a next page.
 */
export function useNearbyStations(): UseNearbyStationsResult {
  const [status, setStatus] = useState<NearbyStatus>("requesting-permission");
  const [data, setData] = useState<NearbyStation[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const run = useCallback(() => {
    abortRef.current?.abort();
    const requestId = ++requestIdRef.current;

    setStatus("requesting-permission");
    setErrorMessage(null);

    void (async () => {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (requestId !== requestIdRef.current) return;

      if (!permission.granted) {
        setStatus("permission-denied");
        setErrorMessage(
          permission.canAskAgain
            ? "Permesso di posizione negato. Consenti l'accesso alla posizione per trovare gli impianti più vicini."
            : "Permesso di posizione negato in modo permanente. Abilita la posizione per Motus dalle impostazioni del dispositivo.",
        );
        return;
      }

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (requestId !== requestIdRef.current) return;

      if (!servicesEnabled) {
        setStatus("unavailable");
        setErrorMessage(
          "Servizi di localizzazione disattivati sul dispositivo.",
        );
        return;
      }

      setStatus("loading");
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const position = await Location.getCurrentPositionAsync();
        if (requestId !== requestIdRef.current) return;

        const result = await stationsService.nearby(
          {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            limit: RESULT_LIMIT,
          },
          { signal: controller.signal },
        );
        if (requestId !== requestIdRef.current) return;

        setData(result.data);
        setPagination(result.pagination);
        setStatus("success");
      } catch (error) {
        if (requestId !== requestIdRef.current) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Si è verificato un errore imprevisto.",
        );
        setStatus("error");
      }
    })();
  }, []);

  useEffect(() => {
    run();
    return () => {
      requestIdRef.current += 1;
      abortRef.current?.abort();
    };
  }, [run]);

  return { status, data, pagination, errorMessage, retry: run };
}
