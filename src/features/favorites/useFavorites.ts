import { useCallback, useEffect, useState } from "react";

import * as stationsService from "@/services/motus/stations";
import type { Price, StationSummary } from "@/services/motus/types";
import { useFavoritesStore } from "@/stores/useFavoritesStore";

export type FavoritesStatus = "loading" | "success" | "error" | "empty";

export interface FavoriteStation {
  station: StationSummary;
  prices: Price[];
}

export interface UseFavoritesResult {
  status: FavoritesStatus;
  favorites: FavoriteStation[];
  errorMessage: string | null;
  retry: () => void;
}

/**
 * Resolves the locally-saved `id_impianto` list (`useFavoritesStore`) to
 * real station data via `GET /api/stations/{id}` — favorites are never
 * rendered from cached/stale data, only from a fresh fetch per id, same
 * as every other screen (`architecture.md` §3: never fabricate data).
 * An id whose station later disappears (404) is silently dropped from the
 * rendered list rather than shown as a broken row or removed from storage
 * behind the user's back.
 */
export function useFavorites(): UseFavoritesResult {
  const ids = useFavoritesStore((state) => state.ids);
  const [status, setStatus] = useState<FavoritesStatus>("loading");
  const [favorites, setFavorites] = useState<FavoriteStation[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const run = useCallback(() => {
    if (ids.length === 0) {
      setFavorites([]);
      setStatus("empty");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);
    const controller = new AbortController();

    Promise.allSettled(
      ids.map((id) =>
        stationsService.getById(String(id), { signal: controller.signal }),
      ),
    )
      .then((results) => {
        if (controller.signal.aborted) return;
        const resolved = results
          .filter(
            (
              result,
            ): result is PromiseFulfilledResult<
              Awaited<ReturnType<typeof stationsService.getById>>
            > => result.status === "fulfilled",
          )
          .map((result) => result.value);

        if (resolved.length === 0 && results.length > 0) {
          setErrorMessage("Impossibile caricare gli impianti salvati.");
          setStatus("error");
          return;
        }
        setFavorites(resolved);
        setStatus(resolved.length === 0 ? "empty" : "success");
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setErrorMessage("Impossibile caricare gli impianti salvati.");
        setStatus("error");
      });

    return () => controller.abort();
  }, [ids]);

  useEffect(() => run(), [run]);

  return { status, favorites, errorMessage, retry: run };
}
