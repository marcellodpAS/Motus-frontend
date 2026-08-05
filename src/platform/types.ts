/**
 * Platform types for Motus (Task 8). Mirrors the platform status already
 * decided in docs/motus/automotive-architecture-decision.md (Task 5) and
 * docs/motus/architecture.md §8-9 (Task 6): iOS and Android are real,
 * resolvable targets; android-auto and carplay are documented future
 * values only — no automotive SDK exists in this project (ADR-0003), so
 * neither is ever produced at runtime. See resolvePlatform() in
 * ./deviceContext.ts.
 */
export type MotusPlatform = "ios" | "android" | "android-auto" | "carplay";

export type InteractionMode = "touch" | "rotary" | "voice";

/**
 * "compact" exists in the type but is never resolved by this module: no
 * design requirement defines a compact/comfortable breakpoint for phones
 * (docs/motus/design-inputs.md — no finalized design system), so picking a
 * threshold would be exactly the arbitrary heuristic Task 8 rules out.
 */
export type ComponentDensity = "comfortable" | "compact" | "automotive";

/**
 * One boolean per capability from the Task 8 brief. Every value is either:
 * - detected at runtime (ios/android — see mobile/capabilities.ts), or
 * - a fixed, documented constant sourced from
 *   docs/motus/automotive-feasibility.md (android-auto/carplay — never
 *   runtime-resolved, ADR-0003).
 * Full source/confidence breakdown per field: docs/motus/platform-capabilities.md.
 */
export interface PlatformCapabilities {
  touchInput: boolean;
  rotaryInput: boolean;
  voiceInput: boolean;
  compactDisplay: boolean;
  automotive: boolean;
  textEntry: boolean;
  complexNavigation: boolean;
  backgroundAudio: boolean;
}

export interface DeviceContext {
  platform: MotusPlatform;
  interactionModes: InteractionMode[];
  density: ComponentDensity;
  capabilities: PlatformCapabilities;
}
