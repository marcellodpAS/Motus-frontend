import type { PlatformCapabilities } from "@/platform";

/**
 * Only the capability flags this module actually gates something on.
 * `PlatformCapabilities` has more fields (rotaryInput, compactDisplay,
 * complexNavigation, backgroundAudio) that this shared layer doesn't need
 * to reason about yet — no command or view model in this module branches
 * on them today, so they're left out rather than declared unused.
 */
export type RequiredCapabilityKey = "automotive" | "touchInput" | "voiceInput";

/** Every automotive surface requires an automotive host and touch, at minimum (docs/motus/platform-capabilities.md §1). */
export const PLACE_LIST_REQUIRED_CAPABILITIES: RequiredCapabilityKey[] = [
  "automotive",
  "touchInput",
];

export const PLACE_DETAIL_REQUIRED_CAPABILITIES: RequiredCapabilityKey[] = [
  "automotive",
  "touchInput",
];

/** Voice search only makes sense where the host reports voiceInput (docs/motus/automotive-feasibility.md §1.7, §2.7). */
export const VOICE_SEARCH_REQUIRED_CAPABILITIES: RequiredCapabilityKey[] = [
  "automotive",
  "voiceInput",
];

export function hasRequiredCapabilities(
  capabilities: PlatformCapabilities,
  required: RequiredCapabilityKey[],
): boolean {
  return required.every((key) => capabilities[key]);
}
