export type {
  ComponentDensity,
  DeviceContext,
  InteractionMode,
  MotusPlatform,
  PlatformCapabilities,
} from "./types";

export { CAPABILITIES_BY_PLATFORM, resolveCapabilities } from "./capabilities";

export {
  UNSUPPORTED_OS_FALLBACK,
  buildDeviceContext,
  getDeviceContext,
  resolveDensity,
  resolveInteractionModes,
  resolvePlatform,
  useDeviceContext,
} from "./deviceContext";
