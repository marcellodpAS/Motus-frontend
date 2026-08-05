import { ApiHttpError } from "@/services/motus";

import type { AutomotiveMessageViewModel } from "../types/template";

/**
 * Never forwards the raw backend/error message as the automotive body: an
 * ApiError's `.message` can be a full sentence meant for a phone screen
 * (e.g. ApiTimeoutError's "Richiesta interrotta per timeout dopo Xms."),
 * not the short text this template requires. Only `ApiHttpError`'s
 * `body.error` (the backend's own short `{"error"}` string,
 * docs/motus/api-contract.md) is short enough to reuse as-is; everything
 * else collapses to one fixed, short body.
 */
export function toErrorMessageViewModel(
  error: unknown,
): AutomotiveMessageViewModel {
  const body =
    error instanceof ApiHttpError && error.body
      ? error.body.error
      : "Riprova più tardi.";

  return {
    template: "message",
    headline: "Richiesta non riuscita",
    body,
  };
}

export function toEmptyMessageViewModel(): AutomotiveMessageViewModel {
  return {
    template: "message",
    headline: "Nessun impianto trovato",
    body: "Prova ad avvicinarti a un centro abitato.",
  };
}

/**
 * Covers both "denied" and "unavailable" (docs/motus/feature-backlog.md
 * §VS5: "non concesso / negato / non disponibile") with one body: the user
 * action is the same either way (grant location access on the phone), and
 * an automotive message screen has no room for two near-identical variants.
 */
export function toLocationDeniedMessageViewModel(): AutomotiveMessageViewModel {
  return {
    template: "message",
    headline: "Posizione non disponibile",
    body: "Consenti l'accesso alla posizione dal telefono.",
  };
}
