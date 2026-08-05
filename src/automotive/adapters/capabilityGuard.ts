import type { DeviceContext } from "@/platform";

import type { AutomotiveViewModel } from "../types/template";
import type { AutomotivePlatform } from "./types";

/**
 * Real, cheap invariant checks only — no attempt to enforce the full
 * automotive UX ruleset (e.g. the 5-step task-flow ceiling,
 * automotive-feasibility.md §1.5) since that needs flow/step context this
 * render-one-view-model function doesn't have. Each warning here mirrors a
 * concrete rule already stated elsewhere in this repo's docs.
 */
export function guardAgainstCapabilities(
  viewModel: AutomotiveViewModel,
  device: DeviceContext,
  adapterPlatform: AutomotivePlatform,
): string[] {
  const warnings: string[] = [];

  if (device.platform !== adapterPlatform) {
    warnings.push(
      `Adapter for "${adapterPlatform}" was given a device context for "${device.platform}".`,
    );
  }

  if (!device.capabilities.automotive) {
    warnings.push(
      `"${device.platform}" is not an automotive host; this render plan should not be used.`,
    );
  }

  // Mirrors VS3's explicit-fallback rule (docs/motus/feature-backlog.md
  // §VS3): an empty detail is a silent-empty-field bug, not a valid state.
  if (viewModel.template === "place-detail" && viewModel.rows.length === 0) {
    warnings.push("place-detail view model has no rows to display.");
  }

  return warnings;
}
