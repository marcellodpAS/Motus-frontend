import { shadow } from "@/theme";
import { getShadowStyle } from "@/theme/shadowStyle";

describe("getShadowStyle", () => {
  it("returns the numeric elevation on android", () => {
    expect(getShadowStyle("md", "android")).toEqual({
      elevation: shadow.md.android.elevation,
    });
  });

  it("returns the full iOS shadow props on ios", () => {
    expect(getShadowStyle("md", "ios")).toEqual(shadow.md.ios);
  });

  it("falls back to iOS-shaped props for any other OS string (web, etc.)", () => {
    expect(getShadowStyle("sm", "web")).toEqual(shadow.sm.ios);
  });

  it("defaults to the current Platform.OS (ios under jest-expo) when called with no os argument", () => {
    expect(getShadowStyle("lg")).toEqual(shadow.lg.ios);
  });
});
