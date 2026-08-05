import { useMemo } from "react";
import { Platform } from "react-native";

import { resolveCapabilities } from "./capabilities";
import type {
  ComponentDensity,
  DeviceContext,
  InteractionMode,
  MotusPlatform,
} from "./types";

/**
 * Platform.OS value this module falls back to when the running environment
 * isn't a real MotusPlatform target — see resolvePlatform() below. A fixed,
 * documented value, not a guess.
 */
export const UNSUPPORTED_OS_FALLBACK: MotusPlatform = "android";

/**
 * "ios" and "android" are the only MotusPlatform values a running process
 * can ever report through Platform.OS in this project: android-auto and
 * carplay require a native SDK this repository doesn't have and isn't
 * building (ADR-0003), so they're never reached here. Any other Platform.OS
 * value — e.g. "web" during `pnpm web`, a development-preview environment
 * documented in docs/motus/local-setup.md with no product target of its own
 * (docs/motus/architecture.md never lists web as a target) — falls back to
 * UNSUPPORTED_OS_FALLBACK, mirroring the existing default branch in
 * src/services/motus/config.ts's platformSetupHint().
 */
export function resolvePlatform(os: string = Platform.OS): MotusPlatform {
  if (os === "ios" || os === "android") {
    return os;
  }
  return UNSUPPORTED_OS_FALLBACK;
}

export function resolveInteractionModes(
  platform: MotusPlatform,
): InteractionMode[] {
  const capabilities = resolveCapabilities(platform);
  const modes: InteractionMode[] = [];
  if (capabilities.touchInput) modes.push("touch");
  if (capabilities.rotaryInput) modes.push("rotary");
  if (capabilities.voiceInput) modes.push("voice");
  return modes;
}

export function resolveDensity(platform: MotusPlatform): ComponentDensity {
  return platform === "android-auto" || platform === "carplay"
    ? "automotive"
    : "comfortable";
}

/**
 * Pure: builds a full DeviceContext for any MotusPlatform value, including
 * android-auto/carplay, which resolvePlatform() itself can never return.
 * Kept separate so the automotive combinations stay unit-testable ahead of
 * any native implementation (no SDK exists to resolve them at runtime).
 */
export function buildDeviceContext(platform: MotusPlatform): DeviceContext {
  return {
    platform,
    interactionModes: resolveInteractionModes(platform),
    density: resolveDensity(platform),
    capabilities: resolveCapabilities(platform),
  };
}

export function getDeviceContext(os: string = Platform.OS): DeviceContext {
  return buildDeviceContext(resolvePlatform(os));
}

/**
 * Hook, not a Provider/Context: DeviceContext is derived from Platform.OS,
 * which is fixed for the lifetime of a running app — there's no state to
 * distribute or invalidate across the tree, so a memoized value is
 * sufficient (YAGNI, consistent with architecture.md §6's bar for
 * introducing shared state). Components read platform/capabilities through
 * this hook instead of checking Platform.OS themselves.
 */
export function useDeviceContext(os: string = Platform.OS): DeviceContext {
  return useMemo(() => getDeviceContext(os), [os]);
}
