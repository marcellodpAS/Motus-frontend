import type { PlatformCapabilities } from "@/platform";

import {
  VOICE_SEARCH_REQUIRED_CAPABILITIES,
  hasRequiredCapabilities,
} from "../types/capability";
import type { AutomotiveCommand } from "./types";

/**
 * What a command means to do, described without calling anything: no
 * fetch, no navigation library. `fetch-nearby`/`fetch-place-detail` are
 * resolved against `src/services/motus` by whatever future native host
 * runs this module; `navigate-*` are resolved against the platform's own
 * template stack (Android Auto's `Screen` stack / CarPlay's
 * `CPInterfaceController`), never Expo Router — that stack doesn't exist on
 * either automotive host (automotive-feasibility.md §1.11, §2.11).
 */
export type AutomotiveEffect =
  | { type: "fetch-nearby" }
  | { type: "navigate-to-detail"; idImpianto: number }
  | { type: "navigate-back" }
  | { type: "voice-search"; transcript: string };

export function resolveCommandEffect(
  command: AutomotiveCommand,
): AutomotiveEffect {
  switch (command.kind) {
    case "refresh-nearby":
      return { type: "fetch-nearby" };
    case "select-place":
      return { type: "navigate-to-detail", idImpianto: command.idImpianto };
    case "back":
      return { type: "navigate-back" };
    case "voice-search":
      return { type: "voice-search", transcript: command.transcript };
  }
}

/**
 * Ties commands to capability requirements
 * (../types/capability.ts): every command needs an automotive host, and
 * `voice-search` additionally needs `voiceInput` — false on any host this
 * module can't yet reach (mobile) and only nominally true on the
 * documented automotive capability tables (docs/motus/platform-capabilities.md
 * §3), so this guard is real even before a native voice integration exists.
 */
export function canExecuteCommand(
  command: AutomotiveCommand,
  capabilities: PlatformCapabilities,
): boolean {
  if (command.kind === "voice-search") {
    return hasRequiredCapabilities(
      capabilities,
      VOICE_SEARCH_REQUIRED_CAPABILITIES,
    );
  }
  return capabilities.automotive;
}
