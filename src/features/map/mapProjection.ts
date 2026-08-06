export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface Viewport {
  width: number;
  height: number;
}

export interface ScreenPoint {
  /** Pixels from the left edge of the map viewport. */
  x: number;
  /** Pixels from the top edge of the map viewport. */
  y: number;
}

/** Standard raster-tile edge, in pixels — every XYZ tile server serves 256px tiles. */
export const TILE_SIZE = 256;

export const MIN_ZOOM = 3;
export const MAX_ZOOM = 18;

/**
 * Street level: a town fills the screen and individual roads are readable.
 * Fixed rather than fitted to the selected radius — a 20 km fit lands around
 * zoom 8, which is a regional overview nobody can navigate by. The radius is
 * a filter over which stations exist, not a demand to frame all of them.
 */
export const DEFAULT_ZOOM = 14;

/**
 * Web Mercator is undefined at the poles; every XYZ tile scheme clamps the
 * projected area to this latitude so the world is a square.
 */
const MAX_LATITUDE = 85.05112878;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Edge of the whole world, in pixels, at `zoom`. */
export function worldSize(zoom: number): number {
  return TILE_SIZE * 2 ** zoom;
}

/**
 * Spherical Web Mercator (EPSG:3857), the projection every XYZ raster-tile
 * server uses — so a coordinate projected here lands on exactly the pixel of
 * the tile image that depicts it. This replaces the previous
 * "linear scaling of the bounding box" placeholder, which had no relationship
 * to any real map imagery and could only ever position pins against a blank
 * grid (`stitch-implementation-gap.md` row 9).
 */
export function projectToWorld(coord: Coordinate, zoom: number): ScreenPoint {
  const size = worldSize(zoom);
  const latitude = clamp(coord.latitude, -MAX_LATITUDE, MAX_LATITUDE);
  const sin = Math.sin(toRadians(latitude));
  return {
    x: ((coord.longitude + 180) / 360) * size,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * size,
  };
}

/**
 * Position of `coord` inside a viewport whose centre pixel shows `center`.
 * Y grows downward (screen convention) because Mercator's own Y already does.
 */
export function projectToScreen(
  coord: Coordinate,
  center: Coordinate,
  zoom: number,
  viewport: Viewport,
): ScreenPoint {
  const point = projectToWorld(coord, zoom);
  const origin = projectToWorld(center, zoom);
  return {
    x: point.x - origin.x + viewport.width / 2,
    y: point.y - origin.y + viewport.height / 2,
  };
}

/** Inverse of `projectToWorld`. */
export function unprojectFromWorld(
  point: ScreenPoint,
  zoom: number,
): Coordinate {
  const size = worldSize(zoom);
  const longitude =
    (((((point.x / size) * 360 - 180) % 360) + 540) % 360) - 180;
  const n = Math.PI * (1 - (2 * clamp(point.y, 0, size)) / size);
  return {
    latitude: (180 / Math.PI) * Math.atan(Math.sinh(n)),
    longitude,
  };
}

/**
 * Where the map is centred after the user drags it by `(dx, dy)` screen
 * pixels. Dragging right (`dx > 0`) reveals what is to the *west*, so the
 * centre moves against the gesture. This is what makes panning unbounded:
 * instead of sliding a fixed tile layer around until it runs out, each
 * gesture commits a new centre and the tiles are re-issued around it.
 */
export function panCenter(
  center: Coordinate,
  zoom: number,
  dx: number,
  dy: number,
): Coordinate {
  const world = projectToWorld(center, zoom);
  return unprojectFromWorld({ x: world.x - dx, y: world.y - dy }, zoom);
}

/**
 * Applies a pinch factor to a zoom level. The result is **fractional** on
 * purpose: rounding it to the nearest tile level made any pinch smaller than
 * ~1.4x commit the zoom it started from, and since committing a region drops
 * the live gesture transform, the map visibly sprang back to where it began.
 * Tile *images* still only exist at integer levels — `MapTileLayer` renders
 * the nearest one scaled by the remaining fraction.
 */
export function zoomByFactor(zoom: number, factor: number): number {
  if (!Number.isFinite(factor) || factor <= 0) return zoom;
  return clamp(zoom + Math.log2(factor), MIN_ZOOM, MAX_ZOOM);
}

/**
 * Splits a fractional zoom into the tile level to request and the scale the
 * imagery at that level must be drawn at. The factor stays within
 * `[2^-0.5, 2^0.5]` (~0.71x–1.41x), so tiles are never blown up beyond the
 * point where labels stop being legible.
 */
export function tileZoomFor(zoom: number): { tileZoom: number; scale: number } {
  const tileZoom = clamp(Math.round(zoom), MIN_ZOOM, MAX_ZOOM);
  return { tileZoom, scale: 2 ** (zoom - tileZoom) };
}

export interface TilePlacement {
  /** XYZ tile column, wrapped into `[0, 2^z)`. */
  x: number;
  /** XYZ tile row. */
  y: number;
  z: number;
  /** Placement inside the viewport, in pixels. */
  left: number;
  top: number;
}

/**
 * Hard ceiling on how many tile images one layer may mount. Prevents a
 * pathological viewport/overscan combination from firing hundreds of
 * concurrent image requests; the visible area is always requested first
 * because rows/columns are walked outward from the viewport.
 */
const MAX_TILES = 96;

/**
 * Every tile needed to cover `viewport` (grown by `overscan` on each side)
 * around `center`. `overscan` is what makes panning possible without blank
 * areas: the layer is laid out larger than the screen, and `MapSurface`
 * clamps the pan to exactly that margin.
 *
 * Columns wrap around the antimeridian (`x` is taken modulo `2^z`); rows do
 * not — there is no tile above the north or below the south edge of the
 * Mercator square, so out-of-range rows are dropped instead of wrapped.
 */
export function tilesFor(
  center: Coordinate,
  zoom: number,
  viewport: Viewport,
  overscan: ScreenPoint = { x: 0, y: 0 },
): TilePlacement[] {
  if (viewport.width <= 0 || viewport.height <= 0) return [];

  const origin = projectToWorld(center, zoom);
  const columns = 2 ** zoom;

  const minX = origin.x - viewport.width / 2 - overscan.x;
  const maxX = origin.x + viewport.width / 2 + overscan.x;
  const minY = origin.y - viewport.height / 2 - overscan.y;
  const maxY = origin.y + viewport.height / 2 + overscan.y;

  const firstColumn = Math.floor(minX / TILE_SIZE);
  const lastColumn = Math.floor(maxX / TILE_SIZE);
  const firstRow = Math.floor(minY / TILE_SIZE);
  const lastRow = Math.floor(maxY / TILE_SIZE);

  const tiles: TilePlacement[] = [];
  for (let row = firstRow; row <= lastRow; row += 1) {
    if (row < 0 || row >= columns) continue;
    for (let column = firstColumn; column <= lastColumn; column += 1) {
      if (tiles.length >= MAX_TILES) return tiles;
      tiles.push({
        x: ((column % columns) + columns) % columns,
        y: row,
        z: zoom,
        left: column * TILE_SIZE - origin.x + viewport.width / 2,
        top: row * TILE_SIZE - origin.y + viewport.height / 2,
      });
    }
  }
  return tiles;
}

/** Arithmetic mean of a set of coordinates — `null` for an empty set. */
export function centroid(coords: readonly Coordinate[]): Coordinate | null {
  if (coords.length === 0) return null;
  const total = coords.reduce(
    (accumulator, coord) => ({
      latitude: accumulator.latitude + coord.latitude,
      longitude: accumulator.longitude + coord.longitude,
    }),
    { latitude: 0, longitude: 0 },
  );
  return {
    latitude: total.latitude / coords.length,
    longitude: total.longitude / coords.length,
  };
}
