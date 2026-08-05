import { renderHook } from "@testing-library/react-native";

import { ANDROID_AUTO_CAPABILITIES } from "@/platform/android-auto/capabilities";
import { CARPLAY_CAPABILITIES } from "@/platform/carplay/capabilities";
import {
  UNSUPPORTED_OS_FALLBACK,
  buildDeviceContext,
  getDeviceContext,
  resolveDensity,
  resolveInteractionModes,
  resolvePlatform,
  useDeviceContext,
} from "@/platform/deviceContext";
import { MOBILE_CAPABILITIES } from "@/platform/mobile/capabilities";

describe("resolvePlatform", () => {
  it("resolves ios and android as themselves", () => {
    expect(resolvePlatform("ios")).toBe("ios");
    expect(resolvePlatform("android")).toBe("android");
  });

  it("falls back to the documented value for environments with no MotusPlatform target", () => {
    expect(resolvePlatform("web")).toBe(UNSUPPORTED_OS_FALLBACK);
    expect(resolvePlatform("windows")).toBe(UNSUPPORTED_OS_FALLBACK);
  });

  it("defaults to the current Platform.OS (ios under jest-expo) when called with no argument", () => {
    expect(resolvePlatform()).toBe("ios");
  });
});

describe("resolveInteractionModes / resolveDensity — supported combinations", () => {
  it.each([
    ["ios", ["touch"], "comfortable"],
    ["android", ["touch"], "comfortable"],
    ["android-auto", ["touch", "rotary", "voice"], "automotive"],
    ["carplay", ["touch", "rotary", "voice"], "automotive"],
  ] as const)(
    "%s -> interactionModes %j, density %s",
    (platform, expectedModes, expectedDensity) => {
      expect(resolveInteractionModes(platform)).toEqual(expectedModes);
      expect(resolveDensity(platform)).toBe(expectedDensity);
    },
  );

  it("never produces the 'compact' density (no breakpoint requirement exists yet)", () => {
    const densities = [
      resolveDensity("ios"),
      resolveDensity("android"),
      resolveDensity("android-auto"),
      resolveDensity("carplay"),
    ];
    expect(densities).not.toContain("compact");
  });
});

describe("buildDeviceContext — full combination matrix", () => {
  it("builds ios context from mobile capabilities", () => {
    expect(buildDeviceContext("ios")).toEqual({
      platform: "ios",
      interactionModes: ["touch"],
      density: "comfortable",
      capabilities: MOBILE_CAPABILITIES,
    });
  });

  it("builds android context from mobile capabilities", () => {
    expect(buildDeviceContext("android")).toEqual({
      platform: "android",
      interactionModes: ["touch"],
      density: "comfortable",
      capabilities: MOBILE_CAPABILITIES,
    });
  });

  it("builds android-auto context from its documented capabilities, even though resolvePlatform() can never produce it", () => {
    expect(buildDeviceContext("android-auto")).toEqual({
      platform: "android-auto",
      interactionModes: ["touch", "rotary", "voice"],
      density: "automotive",
      capabilities: ANDROID_AUTO_CAPABILITIES,
    });
  });

  it("builds carplay context from its documented capabilities, even though resolvePlatform() can never produce it", () => {
    expect(buildDeviceContext("carplay")).toEqual({
      platform: "carplay",
      interactionModes: ["touch", "rotary", "voice"],
      density: "automotive",
      capabilities: CARPLAY_CAPABILITIES,
    });
  });
});

describe("getDeviceContext", () => {
  it("composes resolvePlatform + buildDeviceContext for a real os string", () => {
    expect(getDeviceContext("android")).toEqual(buildDeviceContext("android"));
  });

  it("applies the documented fallback for an unsupported os string", () => {
    expect(getDeviceContext("web")).toEqual(
      buildDeviceContext(UNSUPPORTED_OS_FALLBACK),
    );
  });
});

describe("useDeviceContext", () => {
  it("returns the same DeviceContext getDeviceContext would for the given os", async () => {
    const { result } = await renderHook(() => useDeviceContext("android"));
    expect(result.current).toEqual(getDeviceContext("android"));
  });

  it("memoizes the context across re-renders with the same os", async () => {
    const { result, rerender } = await renderHook(
      ({ os }: { os: string }) => useDeviceContext(os),
      { initialProps: { os: "ios" } },
    );
    const first = result.current;
    await rerender({ os: "ios" });
    expect(result.current).toBe(first);
  });

  it("recomputes when os changes", async () => {
    const { result, rerender } = await renderHook(
      ({ os }: { os: string }) => useDeviceContext(os),
      { initialProps: { os: "ios" } },
    );
    expect(result.current.platform).toBe("ios");
    await rerender({ os: "android" });
    expect(result.current.platform).toBe("android");
  });
});
