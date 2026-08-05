import type { PlatformCapabilities } from "../types";

/**
 * NOT runtime-detected. Android Auto requires a native CarAppService
 * (Kotlin/Java) this repository does not have and will not build here
 * (ADR-0003, "no automotive SDK") — resolvePlatform() in ../deviceContext.ts
 * never returns "android-auto". These values are the documented platform
 * capabilities from docs/motus/automotive-feasibility.md §1, kept only so
 * the capability table and its tests can describe the target shape ahead
 * of any native implementation.
 *
 * Confidence markers reuse automotive-feasibility.md's own legend:
 * 🟢 confirmed live against official docs in that session, 🟡 inferred from
 * official docs but not verified textually. Full breakdown:
 * docs/motus/platform-capabilities.md.
 */
export const ANDROID_AUTO_CAPABILITIES: PlatformCapabilities = {
  touchInput: true, // 🟢 §1.6
  rotaryInput: true, // 🟢 §1.6 — rotary controller, some vehicles only
  voiceInput: true, // 🟢 §1.7 — via App Actions/Gemini, not app-implemented
  compactDisplay: true, // 🟢 §1.4 — car head-unit templates, not a phone screen
  automotive: true,
  textEntry: false, // 🟢 §1.6 — keyboard is a discouraged input while driving
  complexNavigation: false, // 🟢 §1.5 — 5-step task flow ceiling
  backgroundAudio: false, // not applicable — Motus has no audio feature (product-requirements.md §13)
};
