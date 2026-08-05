import { Platform } from "react-native";

import { shadow, type ShadowLevel } from "./tokens";

/**
 * Full, correct cross-platform shadow style for a given level: iOS shadow
 * props on iOS, numeric `elevation` on Android — NativeWind's `shadow-*`
 * classNames alone don't set `elevation` (see `tokens.ts`), so components
 * that need a shadow to actually render on Android should spread this
 * instead of relying on the className.
 *
 * Isolated from `tokens.ts` (which must stay `react-native`-free — it's
 * `require()`d by `tailwind.config.js` outside any RN runtime). `os`
 * defaults to `Platform.OS` but takes an explicit argument for tests,
 * mirroring `resolvePlatform()` in `src/platform/deviceContext.ts`.
 */
export function getShadowStyle(level: ShadowLevel, os: string = Platform.OS) {
  const entry = shadow[level];
  return os === "android" ? entry.android : entry.ios;
}
