export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface ProjectedPoint {
  /** 0–100, percentage from the left edge of the map surface. */
  left: number;
  /** 0–100, percentage from the top edge of the map surface. */
  top: number;
}

const CENTER: ProjectedPoint = { left: 50, top: 50 };
const EDGE_MARGIN = 12;

/**
 * Places real coordinates on a flat 2D surface as left/top percentages —
 * no map SDK is available in this environment (`expo-maps` is alpha and
 * unavailable in Expo Go, no dev-client is configured here;
 * `stitch-implementation-gap.md` row 9). Equirectangular-style linear
 * scaling is accurate enough at the ~5km neighborhood radius `/api/
 * stations/nearby` operates at (`source-requirements-inventory.md` §5);
 * it is not a general-purpose map projection.
 *
 * Longitude maps directly to `left` (increases eastward, same as screen
 * X); latitude is inverted for `top` (increases northward, opposite of
 * screen Y, which increases downward). A single point, or every point at
 * the same coordinate, degenerates the range to zero — clamped to the
 * surface's center rather than dividing by zero.
 */
export function projectCoordinates(points: Coordinate[]): ProjectedPoint[] {
  if (points.length === 0) return [];

  const latitudes = points.map((point) => point.latitude);
  const longitudes = points.map((point) => point.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLon = Math.min(...longitudes);
  const maxLon = Math.max(...longitudes);
  const latRange = maxLat - minLat;
  const lonRange = maxLon - minLon;

  const span = 100 - 2 * EDGE_MARGIN;

  return points.map((point) => {
    if (latRange === 0 && lonRange === 0) return CENTER;

    const left =
      lonRange === 0
        ? 50
        : EDGE_MARGIN + ((point.longitude - minLon) / lonRange) * span;
    const top =
      latRange === 0
        ? 50
        : EDGE_MARGIN + ((maxLat - point.latitude) / latRange) * span;

    return { left, top };
  });
}
