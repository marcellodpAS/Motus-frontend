import { ANDROID_AUTO_CAPABILITIES } from "./android-auto/capabilities";
import { CARPLAY_CAPABILITIES } from "./carplay/capabilities";
import { MOBILE_CAPABILITIES } from "./mobile/capabilities";
import type { MotusPlatform, PlatformCapabilities } from "./types";

export const CAPABILITIES_BY_PLATFORM: Record<
  MotusPlatform,
  PlatformCapabilities
> = {
  ios: MOBILE_CAPABILITIES,
  android: MOBILE_CAPABILITIES,
  "android-auto": ANDROID_AUTO_CAPABILITIES,
  carplay: CARPLAY_CAPABILITIES,
};

export function resolveCapabilities(
  platform: MotusPlatform,
): PlatformCapabilities {
  return CAPABILITIES_BY_PLATFORM[platform];
}
