import {
  TILE_ATTRIBUTION,
  getTileUrlTemplate,
  tileUrl,
} from "@/features/map/tileSource";

describe("tileSource", () => {
  const originalValue = process.env.EXPO_PUBLIC_MAP_TILE_URL;

  afterEach(() => {
    process.env.EXPO_PUBLIC_MAP_TILE_URL = originalValue;
  });

  it("falls back to an OpenStreetMap-derived basemap when unconfigured", () => {
    delete process.env.EXPO_PUBLIC_MAP_TILE_URL;
    const template = getTileUrlTemplate();

    expect(template).toContain("{z}");
    expect(template).toContain("{x}");
    expect(template).toContain("{y}");
    expect(template.startsWith("https://")).toBe(true);
  });

  it("prefers EXPO_PUBLIC_MAP_TILE_URL when set", () => {
    process.env.EXPO_PUBLIC_MAP_TILE_URL =
      "  https://tiles.example.test/{z}/{x}/{y}.png  ";

    expect(getTileUrlTemplate()).toBe(
      "https://tiles.example.test/{z}/{x}/{y}.png",
    );
  });

  it("ignores a blank value", () => {
    process.env.EXPO_PUBLIC_MAP_TILE_URL = "   ";
    expect(getTileUrlTemplate()).toContain("{z}");
  });

  it("fills the XYZ placeholders", () => {
    expect(
      tileUrl("https://tiles.example.test/{z}/{x}/{y}.png", {
        z: 13,
        x: 4384,
        y: 3229,
      }),
    ).toBe("https://tiles.example.test/13/4384/3229.png");
  });

  it("keeps a non-empty attribution string, required by the tile terms", () => {
    expect(TILE_ATTRIBUTION).toContain("OpenStreetMap");
  });
});
