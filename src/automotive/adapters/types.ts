import type { DeviceContext, MotusPlatform } from "@/platform";

import type { AutomotiveViewModel } from "../types/template";

export type AutomotivePlatform = Extract<
  MotusPlatform,
  "android-auto" | "carplay"
>;

/**
 * `viewModel` is passed through unchanged — this layer never rewrites the
 * shared model per platform, only validates it. Real per-platform
 * translation (our `AutomotiveTemplateKind` -> `PlaceListMapTemplate` /
 * `CPListTemplate`, etc.) is native SDK code this repository doesn't have
 * and isn't building (ADR-0003); `warnings` is what a typed, SDK-independent
 * adapter can meaningfully produce today.
 */
export interface AutomotiveRenderPlan {
  templateKind: AutomotiveViewModel["template"];
  viewModel: AutomotiveViewModel;
  warnings: string[];
}

export interface AutomotiveAdapter {
  platform: AutomotivePlatform;
  render(
    viewModel: AutomotiveViewModel,
    device: DeviceContext,
  ): AutomotiveRenderPlan;
}
