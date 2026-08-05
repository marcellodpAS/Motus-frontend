/**
 * Re-exports the shared implementation (src/services/motus/stationDisplay.ts)
 * so the mobile and automotive surfaces read the fallback chain from a
 * single place instead of two literal copies (Task 17 stabilization).
 */
export { stationTitle } from "@/services/motus/stationDisplay";
