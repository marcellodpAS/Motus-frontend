import { guardAgainstCapabilities } from "./capabilityGuard";
import type { AutomotiveAdapter, AutomotivePlatform } from "./types";

/**
 * android-auto and carplay currently need exactly the same render logic —
 * only the `PlatformCapabilities` each carries differs
 * (docs/motus/platform-capabilities.md §3), and that difference already
 * flows in through `device` at call time. A factory avoids two
 * copy-pasted adapter files that would only diverge once real native
 * template translation exists (out of scope here, ADR-0003) — at that
 * point each platform gets its own `render` and stops sharing this factory.
 */
export function createAutomotiveAdapter(
  platform: AutomotivePlatform,
): AutomotiveAdapter {
  return {
    platform,
    render(viewModel, device) {
      return {
        templateKind: viewModel.template,
        viewModel,
        warnings: guardAgainstCapabilities(viewModel, device, platform),
      };
    },
  };
}
