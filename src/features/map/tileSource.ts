/**
 * XYZ raster-tile endpoint used by `MapTileLayer`.
 *
 * Raster tiles fetched as plain images are the only way to render real map
 * imagery under this project's constraints: `expo-maps` is alpha and not
 * available in Expo Go, `react-native-maps` needs a custom dev client, and no
 * dev-client tooling exists in this environment (`stitch-implementation-gap.md`
 * row 9). An `<Image>` per tile needs no native module at all, so it works in
 * Expo Go, on web, and in a future dev client alike.
 *
 * The default is CARTO's "Voyager" basemap (OpenStreetMap data), whose light
 * palette matches the app's own `mapBackground`/`border` tokens. It is a free
 * but *attributed and rate-limited* service — `TILE_ATTRIBUTION` must stay
 * visible on the map, and a production release should point
 * `EXPO_PUBLIC_MAP_TILE_URL` at an account-backed provider instead of relying
 * on the public endpoint.
 */
const DEFAULT_TILE_URL_TEMPLATE =
  "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png";

/** Required by both OpenStreetMap's and CARTO's terms — rendered on the map. */
export const TILE_ATTRIBUTION = "© OpenStreetMap · © CARTO";

/**
 * Read lazily (not at module load) for the same reason as
 * `getApiBaseUrl`: tests can set `process.env` per case.
 */
export function getTileUrlTemplate(): string {
  const raw = process.env.EXPO_PUBLIC_MAP_TILE_URL;
  return raw && raw.trim().length > 0 ? raw.trim() : DEFAULT_TILE_URL_TEMPLATE;
}

/** Fills `{z}`/`{x}`/`{y}` in an XYZ template. */
export function tileUrl(
  template: string,
  tile: { x: number; y: number; z: number },
): string {
  return template
    .replace("{z}", String(tile.z))
    .replace("{x}", String(tile.x))
    .replace("{y}", String(tile.y));
}
