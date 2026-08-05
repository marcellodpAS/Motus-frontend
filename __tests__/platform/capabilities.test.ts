import { ANDROID_AUTO_CAPABILITIES } from "@/platform/android-auto/capabilities";
import { CARPLAY_CAPABILITIES } from "@/platform/carplay/capabilities";
import {
  CAPABILITIES_BY_PLATFORM,
  resolveCapabilities,
} from "@/platform/capabilities";
import { MOBILE_CAPABILITIES } from "@/platform/mobile/capabilities";
import type { MotusPlatform } from "@/platform/types";

describe("resolveCapabilities", () => {
  it("gives ios and android the same mobile capability profile", () => {
    expect(resolveCapabilities("ios")).toBe(MOBILE_CAPABILITIES);
    expect(resolveCapabilities("android")).toBe(MOBILE_CAPABILITIES);
  });

  it("gives android-auto its documented, non-detected capability profile", () => {
    expect(resolveCapabilities("android-auto")).toBe(ANDROID_AUTO_CAPABILITIES);
  });

  it("gives carplay its documented, non-detected capability profile", () => {
    expect(resolveCapabilities("carplay")).toBe(CARPLAY_CAPABILITIES);
  });
});

describe("CAPABILITIES_BY_PLATFORM", () => {
  const platforms: MotusPlatform[] = [
    "ios",
    "android",
    "android-auto",
    "carplay",
  ];

  it("defines exactly the 4 MotusPlatform values, nothing else", () => {
    expect(Object.keys(CAPABILITIES_BY_PLATFORM).sort()).toEqual(
      [...platforms].sort(),
    );
  });

  it.each(platforms)("marks %s's automotive flag correctly", (platform) => {
    const isAutomotivePlatform =
      platform === "android-auto" || platform === "carplay";
    expect(CAPABILITIES_BY_PLATFORM[platform].automotive).toBe(
      isAutomotivePlatform,
    );
  });

  it("keeps mobile platforms free-text-search capable (textEntry, complexNavigation)", () => {
    for (const platform of ["ios", "android"] as const) {
      expect(CAPABILITIES_BY_PLATFORM[platform].textEntry).toBe(true);
      expect(CAPABILITIES_BY_PLATFORM[platform].complexNavigation).toBe(true);
    }
  });

  it("restricts automotive platforms to driving-safe input (no free text, no deep navigation)", () => {
    for (const platform of ["android-auto", "carplay"] as const) {
      expect(CAPABILITIES_BY_PLATFORM[platform].textEntry).toBe(false);
      expect(CAPABILITIES_BY_PLATFORM[platform].complexNavigation).toBe(false);
      expect(CAPABILITIES_BY_PLATFORM[platform].compactDisplay).toBe(true);
    }
  });

  it("never reports backgroundAudio, since Motus has no audio feature on any platform", () => {
    for (const platform of platforms) {
      expect(CAPABILITIES_BY_PLATFORM[platform].backgroundAudio).toBe(false);
    }
  });
});
