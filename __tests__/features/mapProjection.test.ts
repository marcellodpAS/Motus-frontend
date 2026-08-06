import {
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  TILE_SIZE,
  centroid,
  panCenter,
  projectToScreen,
  projectToWorld,
  tileZoomFor,
  tilesFor,
  unprojectFromWorld,
  worldSize,
  zoomByFactor,
} from "@/features/map/mapProjection";

const ROME = { latitude: 41.9028, longitude: 12.4964 };

describe("projectToWorld", () => {
  it("places the antimeridian/equator origin at the left edge of the world square", () => {
    expect(projectToWorld({ latitude: 0, longitude: -180 }, 0)).toEqual({
      x: 0,
      y: TILE_SIZE / 2,
    });
  });

  it("places the equator at the vertical middle and Greenwich at the horizontal middle", () => {
    const point = projectToWorld({ latitude: 0, longitude: 0 }, 2);
    expect(point.x).toBeCloseTo(worldSize(2) / 2, 6);
    expect(point.y).toBeCloseTo(worldSize(2) / 2, 6);
  });

  it("doubles world coordinates for each zoom level", () => {
    const low = projectToWorld(ROME, 10);
    const high = projectToWorld(ROME, 11);
    expect(high.x).toBeCloseTo(low.x * 2, 6);
    expect(high.y).toBeCloseTo(low.y * 2, 6);
  });

  it("clamps beyond the Mercator latitude limit instead of returning Infinity", () => {
    const pole = projectToWorld({ latitude: 90, longitude: 0 }, 4);
    expect(Number.isFinite(pole.y)).toBe(true);
    // The clamp lands on the top edge of the world square (0), up to the
    // float error of the log/sin round trip.
    expect(pole.y).toBeCloseTo(0, 6);
  });
});

describe("projectToScreen", () => {
  it("puts the centre coordinate at the centre of the viewport", () => {
    const point = projectToScreen(ROME, ROME, 13, { width: 400, height: 800 });
    expect(point.x).toBeCloseTo(200, 6);
    expect(point.y).toBeCloseTo(400, 6);
  });

  it("places an easterly point to the right and a northerly point above", () => {
    const viewport = { width: 400, height: 800 };
    const east = projectToScreen(
      { latitude: ROME.latitude, longitude: ROME.longitude + 0.02 },
      ROME,
      13,
      viewport,
    );
    const north = projectToScreen(
      { latitude: ROME.latitude + 0.02, longitude: ROME.longitude },
      ROME,
      13,
      viewport,
    );
    expect(east.x).toBeGreaterThan(200);
    expect(north.y).toBeLessThan(400);
  });
});

describe("unprojectFromWorld", () => {
  it("round-trips projectToWorld", () => {
    const zoom = 13;
    const back = unprojectFromWorld(projectToWorld(ROME, zoom), zoom);
    expect(back.latitude).toBeCloseTo(ROME.latitude, 9);
    expect(back.longitude).toBeCloseTo(ROME.longitude, 9);
  });
});

describe("panCenter", () => {
  it("returns the same centre for no movement", () => {
    const next = panCenter(ROME, 13, 0, 0);
    expect(next.latitude).toBeCloseTo(ROME.latitude, 9);
    expect(next.longitude).toBeCloseTo(ROME.longitude, 9);
  });

  it("moves the centre against the drag: dragging right reveals the west", () => {
    const next = panCenter(ROME, 13, 100, 0);
    expect(next.longitude).toBeLessThan(ROME.longitude);
  });

  it("moves the centre north when dragging down", () => {
    const next = panCenter(ROME, 13, 0, 100);
    expect(next.latitude).toBeGreaterThan(ROME.latitude);
  });

  it("re-projects the dragged point back to the viewport centre", () => {
    const viewport = { width: 400, height: 800 };
    const dragged = panCenter(ROME, 13, 120, -60);
    // The pixel that was 120px right / 60px above centre is now the centre.
    const original = projectToScreen(ROME, dragged, 13, viewport);
    expect(original.x).toBeCloseTo(viewport.width / 2 + 120, 6);
    expect(original.y).toBeCloseTo(viewport.height / 2 - 60, 6);
  });

  it("is unbounded: repeated drags keep moving the centre", () => {
    let center = ROME;
    for (let step = 0; step < 50; step += 1) {
      center = panCenter(center, 13, -400, 0);
    }
    expect(center.longitude).toBeGreaterThan(ROME.longitude);
    expect(Number.isFinite(center.longitude)).toBe(true);
  });
});

describe("zoomByFactor", () => {
  it("adds one level for a 2x pinch and removes one for a 0.5x pinch", () => {
    expect(zoomByFactor(13, 2)).toBeCloseTo(14, 9);
    expect(zoomByFactor(13, 0.5)).toBeCloseTo(12, 9);
  });

  it("keeps a small pinch fractional instead of collapsing it back", () => {
    // The snap-back bug: rounding made a 1.1x pinch commit zoom 13 again, so
    // the committed region equalled the one the gesture started from.
    const zoomed = zoomByFactor(13, 1.1);
    expect(zoomed).toBeGreaterThan(13);
    expect(zoomed).toBeLessThan(14);
  });

  it("clamps to the supported range and ignores a nonsensical factor", () => {
    expect(zoomByFactor(MAX_ZOOM, 4)).toBe(MAX_ZOOM);
    expect(zoomByFactor(MIN_ZOOM, 0.25)).toBe(MIN_ZOOM);
    expect(zoomByFactor(13, 0)).toBe(13);
  });
});

describe("tileZoomFor", () => {
  it("uses the exact tile level with no scaling at an integer zoom", () => {
    expect(tileZoomFor(14)).toEqual({ tileZoom: 14, scale: 1 });
  });

  it("keeps the scale within one half-level of the tile imagery", () => {
    for (const zoom of [12.01, 12.4, 12.5, 13.49, 13.99, 14.5]) {
      const { tileZoom, scale } = tileZoomFor(zoom);
      expect(Number.isInteger(tileZoom)).toBe(true);
      expect(scale).toBeGreaterThanOrEqual(2 ** -0.5);
      expect(scale).toBeLessThanOrEqual(2 ** 0.5);
    }
  });

  it("reconstructs the requested zoom from the level and its scale", () => {
    const { tileZoom, scale } = tileZoomFor(13.37);
    expect(tileZoom + Math.log2(scale)).toBeCloseTo(13.37, 9);
  });

  it("never asks for a tile level outside the supported range", () => {
    expect(tileZoomFor(MIN_ZOOM - 5).tileZoom).toBe(MIN_ZOOM);
    expect(tileZoomFor(MAX_ZOOM + 5).tileZoom).toBe(MAX_ZOOM);
  });
});

describe("DEFAULT_ZOOM", () => {
  it("is a street-level zoom, not a regional overview", () => {
    expect(DEFAULT_ZOOM).toBe(14);
    expect(tileZoomFor(DEFAULT_ZOOM).scale).toBe(1);
  });
});

describe("tilesFor", () => {
  it("returns nothing for a zero-size viewport", () => {
    expect(tilesFor(ROME, 13, { width: 0, height: 0 })).toEqual([]);
  });

  it("covers the whole viewport with contiguous tiles", () => {
    const viewport = { width: 400, height: 800 };
    const tiles = tilesFor(ROME, 13, viewport);

    expect(tiles.length).toBeGreaterThan(0);
    const left = Math.min(...tiles.map((tile) => tile.left));
    const top = Math.min(...tiles.map((tile) => tile.top));
    const right = Math.max(...tiles.map((tile) => tile.left + TILE_SIZE));
    const bottom = Math.max(...tiles.map((tile) => tile.top + TILE_SIZE));
    expect(left).toBeLessThanOrEqual(0);
    expect(top).toBeLessThanOrEqual(0);
    expect(right).toBeGreaterThanOrEqual(viewport.width);
    expect(bottom).toBeGreaterThanOrEqual(viewport.height);
  });

  it("renders more tiles when an overscan margin is requested", () => {
    const viewport = { width: 400, height: 800 };
    const plain = tilesFor(ROME, 13, viewport);
    const padded = tilesFor(ROME, 13, viewport, { x: 300, y: 300 });
    expect(padded.length).toBeGreaterThan(plain.length);
  });

  it("keeps tile indices inside the world grid, even across the antimeridian", () => {
    const tiles = tilesFor(
      { latitude: 0, longitude: 179.99 },
      3,
      { width: 400, height: 400 },
      { x: 600, y: 600 },
    );
    expect(tiles.length).toBeGreaterThan(0);
    for (const tile of tiles) {
      expect(tile.x).toBeGreaterThanOrEqual(0);
      expect(tile.x).toBeLessThan(2 ** 3);
      expect(tile.y).toBeGreaterThanOrEqual(0);
      expect(tile.y).toBeLessThan(2 ** 3);
    }
  });
});

describe("centroid", () => {
  it("returns null for an empty set", () => {
    expect(centroid([])).toBeNull();
  });

  it("averages the coordinates", () => {
    expect(
      centroid([
        { latitude: 41, longitude: 12 },
        { latitude: 43, longitude: 14 },
      ]),
    ).toEqual({ latitude: 42, longitude: 13 });
  });
});
