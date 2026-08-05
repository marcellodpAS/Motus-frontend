import {
  PLACE_DETAIL_REQUIRED_CAPABILITIES,
  PLACE_LIST_REQUIRED_CAPABILITIES,
  VOICE_SEARCH_REQUIRED_CAPABILITIES,
  hasRequiredCapabilities,
} from "@/automotive/types";
import { ANDROID_AUTO_CAPABILITIES } from "@/platform/android-auto/capabilities";
import { CARPLAY_CAPABILITIES } from "@/platform/carplay/capabilities";
import { MOBILE_CAPABILITIES } from "@/platform/mobile/capabilities";

describe("hasRequiredCapabilities", () => {
  it("passes place-list/place-detail requirements for both automotive platforms", () => {
    for (const capabilities of [
      ANDROID_AUTO_CAPABILITIES,
      CARPLAY_CAPABILITIES,
    ]) {
      expect(
        hasRequiredCapabilities(capabilities, PLACE_LIST_REQUIRED_CAPABILITIES),
      ).toBe(true);
      expect(
        hasRequiredCapabilities(
          capabilities,
          PLACE_DETAIL_REQUIRED_CAPABILITIES,
        ),
      ).toBe(true);
    }
  });

  it("fails place-list requirements on mobile (automotive: false)", () => {
    expect(
      hasRequiredCapabilities(
        MOBILE_CAPABILITIES,
        PLACE_LIST_REQUIRED_CAPABILITIES,
      ),
    ).toBe(false);
  });

  it("passes voice-search requirements only where voiceInput is true", () => {
    expect(
      hasRequiredCapabilities(
        ANDROID_AUTO_CAPABILITIES,
        VOICE_SEARCH_REQUIRED_CAPABILITIES,
      ),
    ).toBe(true);
    expect(
      hasRequiredCapabilities(
        MOBILE_CAPABILITIES,
        VOICE_SEARCH_REQUIRED_CAPABILITIES,
      ),
    ).toBe(false);
  });
});
