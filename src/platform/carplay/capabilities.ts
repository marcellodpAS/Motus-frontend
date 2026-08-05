import type { PlatformCapabilities } from "../types";

/**
 * NOT runtime-detected — same reasoning as ../android-auto/capabilities.ts.
 * CarPlay additionally sits behind a discretionary Apple entitlement and an
 * unconfirmed app category (docs/motus/automotive-architecture-decision.md,
 * "requires-product-clarification"), so several values below carry lower
 * confidence than Android Auto's — see docs/motus/platform-capabilities.md
 * for the per-field breakdown and the 🟢/🟡 legend.
 */
export const CARPLAY_CAPABILITIES: PlatformCapabilities = {
  touchInput: true, // 🟢 automotive-feasibility.md §2.6
  rotaryInput: true, // 🟡 §2.6 — "on some vehicles", not independently confirmed
  voiceInput: true, // 🟢 §2.7 — Siri
  compactDisplay: true, // 🟡 inferred from template-based UI (§2.4), not confirmed textually
  automotive: true,
  textEntry: false, // 🟡 inferred by analogy with Android Auto — §2.5 not extracted from the source PDF in that session
  complexNavigation: false, // 🟡 same limitation as textEntry above
  backgroundAudio: false, // not applicable — Motus has no audio feature
};
