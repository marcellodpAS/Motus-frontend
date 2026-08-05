import { projectCoordinates } from "@/features/map/mapProjection";

describe("projectCoordinates", () => {
  it("returns an empty array for no points", () => {
    expect(projectCoordinates([])).toEqual([]);
  });

  it("clamps a single point to the center", () => {
    const [point] = projectCoordinates([{ latitude: 41.9, longitude: 12.5 }]);
    expect(point).toEqual({ left: 50, top: 50 });
  });

  it("clamps every point to the center when all coordinates are identical", () => {
    const points = projectCoordinates([
      { latitude: 41.9, longitude: 12.5 },
      { latitude: 41.9, longitude: 12.5 },
    ]);
    expect(points).toEqual([
      { left: 50, top: 50 },
      { left: 50, top: 50 },
    ]);
  });

  it("places the northernmost point above the southernmost one (top increases downward)", () => {
    const [north, south] = projectCoordinates([
      { latitude: 42.0, longitude: 12.5 },
      { latitude: 41.0, longitude: 12.5 },
    ]);
    expect(north.top).toBeLessThan(south.top);
  });

  it("places the easternmost point to the right of the westernmost one", () => {
    const [west, east] = projectCoordinates([
      { latitude: 41.9, longitude: 12.0 },
      { latitude: 41.9, longitude: 13.0 },
    ]);
    expect(east.left).toBeGreaterThan(west.left);
  });

  it("keeps every projected point within the surface bounds, with margin", () => {
    const points = projectCoordinates([
      { latitude: 42.0, longitude: 12.0 },
      { latitude: 41.0, longitude: 13.0 },
      { latitude: 41.5, longitude: 12.5 },
    ]);
    for (const point of points) {
      expect(point.left).toBeGreaterThanOrEqual(0);
      expect(point.left).toBeLessThanOrEqual(100);
      expect(point.top).toBeGreaterThanOrEqual(0);
      expect(point.top).toBeLessThanOrEqual(100);
    }
  });
});
