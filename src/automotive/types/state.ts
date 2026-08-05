import type {
  AutomotiveMessageViewModel,
  AutomotivePlaceDetailViewModel,
  AutomotivePlaceListViewModel,
} from "./template";

/**
 * Reuses FunctionalListStatus's exact vocabulary
 * (src/components/organisms/FunctionalList.tsx) instead of the "success"/
 * "idle" naming used elsewhere (e.g. useStationsSearch's
 * StationsSearchStatus): the automotive list surface is the same
 * loading/empty/error/populated shape as every other "list with filters"
 * screen in this app (VS1, docs/motus/feature-backlog.md), it just renders
 * to a different template.
 */
export type AutomotiveRequestStatus = "loading" | "empty" | "error" | "success";

/**
 * Matches the three values already named in VS5's spec
 * (docs/motus/feature-backlog.md §VS5: "non concesso / negato / non
 * disponibile") for the nearby command — the only command in this module
 * that depends on a device permission.
 */
export type LocationPermissionStatus = "granted" | "denied" | "unavailable";

/** Adds "location-denied" to AutomotiveRequestStatus for surfaces backed by a location permission (only the nearby list today). */
export type AutomotiveListStatus = AutomotiveRequestStatus | "location-denied";

export type AutomotiveListState =
  | { status: Extract<AutomotiveListStatus, "loading"> }
  | {
      status: Extract<AutomotiveListStatus, "empty" | "error">;
      message: AutomotiveMessageViewModel;
    }
  | {
      status: Extract<AutomotiveListStatus, "location-denied">;
      permission: Exclude<LocationPermissionStatus, "granted">;
      message: AutomotiveMessageViewModel;
    }
  | {
      status: Extract<AutomotiveListStatus, "success">;
      list: AutomotivePlaceListViewModel;
    };

export type AutomotiveDetailState =
  | { status: Extract<AutomotiveRequestStatus, "loading"> }
  | {
      status: Extract<AutomotiveRequestStatus, "error">;
      message: AutomotiveMessageViewModel;
    }
  | {
      status: Extract<AutomotiveRequestStatus, "success">;
      detail: AutomotivePlaceDetailViewModel;
    };
