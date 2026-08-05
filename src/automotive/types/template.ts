/**
 * Our own template vocabulary, not a native SDK's. Android Auto's Car App
 * Library (`PlaceListMapTemplate`, `Pane`) and CarPlay's `CarPlay` framework
 * (`CPListTemplate`, `CPPointOfInterestTemplate`) are the real targets these
 * names will eventually map to (docs/motus/automotive-feasibility.md §1.4,
 * §2.4), but no such SDK exists in this repository (ADR-0003) and this
 * module must stay buildable/testable without one. A future native adapter
 * translates `AutomotiveTemplateKind` to the real template classes; this
 * layer only has to describe *what* should be shown.
 */
export type AutomotiveTemplateKind = "place-list" | "place-detail" | "message";

/**
 * One row in a place list. Fields are deliberately few and short (flat
 * hierarchy, low cognitive load — Task 14 brief): no nested structures, no
 * long strings. `subtitle` carries either distance (nearby) or comune/
 * provincia (no distance context), never both — a station is never shown
 * with two competing secondary facts.
 */
export interface AutomotivePlaceItem {
  id: number;
  title: string;
  subtitle?: string;
  priceLabel?: string;
}

export interface AutomotivePlaceListViewModel {
  template: "place-list";
  headline: string;
  items: AutomotivePlaceItem[];
}

/** Mirrors InfoPanelRow (src/components/organisms/InfoPanel.tsx) on purpose: same label/value shape as the mobile detail screen, so both surfaces read the same station fields. */
export interface AutomotiveDetailRow {
  label: string;
  value: string;
}

export interface AutomotivePlaceDetailViewModel {
  template: "place-detail";
  title: string;
  rows: AutomotiveDetailRow[];
}

/**
 * Terminal, single-message screen. Covers every non-list/non-detail state
 * this module produces: empty results, application errors, and denied/
 * unavailable location permission — all short headline + short body, never
 * a raw backend error string (docs/motus/feature-backlog.md VS1: error
 * messages must not assume a specific `{"error"}` format).
 */
export interface AutomotiveMessageViewModel {
  template: "message";
  headline: string;
  body: string;
}

export type AutomotiveViewModel =
  | AutomotivePlaceListViewModel
  | AutomotivePlaceDetailViewModel
  | AutomotiveMessageViewModel;
