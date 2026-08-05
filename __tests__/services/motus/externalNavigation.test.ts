import { Linking } from "react-native";

import {
  buildDirectionsUrl,
  openExternalNavigation,
} from "@/services/motus/externalNavigation";

describe("buildDirectionsUrl", () => {
  it("builds a Google Maps directions URL from real coordinates", () => {
    expect(buildDirectionsUrl(41.9028, 12.4964)).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=41.9028,12.4964",
    );
  });
});

describe("openExternalNavigation", () => {
  it("opens the directions URL via Linking", async () => {
    const openUrlSpy = jest
      .spyOn(Linking, "openURL")
      .mockResolvedValue(true as never);

    await openExternalNavigation(41.9028, 12.4964);

    expect(openUrlSpy).toHaveBeenCalledWith(
      "https://www.google.com/maps/dir/?api=1&destination=41.9028,12.4964",
    );
    openUrlSpy.mockRestore();
  });
});
