/**
 * Deliberately few: one command per essential action left after reducing
 * the mobile flows (Task 14 brief). S01/S02's free-text search is not
 * represented here at all — automotive-feasibility.md §1.3/§2.3 marks both
 * "compatible only in part" pending a redesign for stationary-only or
 * voice-only use, a product decision not yet made
 * (automotive-architecture-decision.md, "open questions"). Only the
 * commands S04 (nearby list) and S03 (detail) actually need exist today.
 */
export interface RefreshNearbyCommand {
  kind: "refresh-nearby";
}

export interface SelectPlaceCommand {
  kind: "select-place";
  idImpianto: number;
}

export interface BackCommand {
  kind: "back";
}

/**
 * The one form free-text-shaped input is allowed to take in this module
 * (Task 14 brief: "voice input quando previsto"; textEntry is false for
 * both automotive platforms, docs/motus/platform-capabilities.md §3) — a
 * transcript already produced by the host's voice input, never a typed
 * string this module collects itself.
 */
export interface VoiceSearchCommand {
  kind: "voice-search";
  transcript: string;
}

export type AutomotiveCommand =
  RefreshNearbyCommand | SelectPlaceCommand | BackCommand | VoiceSearchCommand;
