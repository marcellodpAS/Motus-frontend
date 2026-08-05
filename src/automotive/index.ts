/**
 * Shared automotive experience model (Task 14). Types, view-model mapping,
 * commands, and typed SDK-independent adapters for the automotive surfaces
 * this project has actually decided to prepare for — S04 (nearby list) and
 * S03 (detail), per automotive-feasibility.md's own compatibility read.
 * No native SDK, no CarAppService, no CPTemplateApplicationSceneDelegate:
 * see ADR-0003 and docs/motus/automotive-architecture-decision.md. This
 * module has no React Native UI of its own and renders nothing — it only
 * prepares data a future native host would consume.
 */
export * from "./types";
export * from "./models";
export * from "./commands";
export * from "./adapters";
