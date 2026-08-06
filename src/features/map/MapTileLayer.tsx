import { useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";

import {
  TILE_SIZE,
  tileZoomFor,
  tilesFor,
  type Coordinate,
  type ScreenPoint,
  type Viewport,
} from "@/features/map/mapProjection";
import { getTileUrlTemplate, tileUrl } from "@/features/map/tileSource";

export interface MapTileLayerProps {
  /** Coordinate shown at the centre pixel of `viewport`. */
  center: Coordinate;
  /** Fractional zoom — see `tileZoomFor`. */
  zoom: number;
  viewport: Viewport;
  /** Extra pixels of map laid out beyond each viewport edge, for panning. */
  overscan?: ScreenPoint;
}

const NO_OVERSCAN: ScreenPoint = { x: 0, y: 0 };

/**
 * Real OpenStreetMap-derived imagery, one `<Image>` per XYZ tile
 * (`tileSource.ts` explains why raster tiles rather than a map SDK). Tiles
 * are positioned in the same pixel space `projectToScreen` puts pins in, so
 * a pin drawn at a station's coordinate lands on the actual building in the
 * imagery underneath it.
 *
 * Tiles exist only at integer zoom levels, but the map's zoom is fractional
 * (so pinching is continuous rather than snapping). The nearest tile level is
 * fetched and the whole grid is scaled by the leftover fraction: the grid is
 * laid out at the viewport size that fraction implies, then scaled about its
 * centre back to the real viewport — which is exactly the transform that
 * keeps `center` on the centre pixel.
 *
 * Non-interactive on purpose: pan/pinch belongs to `MapSurface`, which
 * transforms this whole layer and the pins together as one.
 */
export function MapTileLayer({
  center,
  zoom,
  viewport,
  overscan = NO_OVERSCAN,
}: MapTileLayerProps) {
  const template = getTileUrlTemplate();

  const { tileZoom, scale } = tileZoomFor(zoom);
  // Laying the grid out "pre-scale" means covering a viewport that is larger
  // by exactly the factor it will be scaled down by, so nothing is missing at
  // the edges once the scale is applied.
  const gridViewport = useMemo(
    () => ({ width: viewport.width / scale, height: viewport.height / scale }),
    [viewport.width, viewport.height, scale],
  );
  const gridOverscan = useMemo(
    () => ({ x: overscan.x / scale, y: overscan.y / scale }),
    [overscan.x, overscan.y, scale],
  );

  const tiles = useMemo(
    () => tilesFor(center, tileZoom, gridViewport, gridOverscan),
    [center, tileZoom, gridViewport, gridOverscan],
  );

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { alignItems: "center", justifyContent: "center" },
      ]}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View
        style={{
          width: gridViewport.width,
          height: gridViewport.height,
          transform: [{ scale }],
        }}
      >
        {tiles.map((tile) => (
          <Image
            key={`${tile.left}:${tile.top}`}
            source={{ uri: tileUrl(template, tile) }}
            style={{
              position: "absolute",
              left: tile.left,
              top: tile.top,
              width: TILE_SIZE,
              height: TILE_SIZE,
            }}
            // Tiles abut edge-to-edge: any resampling would show as seams.
            resizeMode="stretch"
            fadeDuration={0}
          />
        ))}
      </View>
    </View>
  );
}
