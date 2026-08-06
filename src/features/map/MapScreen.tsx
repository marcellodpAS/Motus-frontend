import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/atoms/AppText";
import { Icon } from "@/components/atoms/Icon";
import { ErrorState } from "@/components/molecules/ErrorState";
import { HeaderIconButton } from "@/components/molecules/HeaderIconButton";
import { MapGridBackground } from "@/components/molecules/MapGridBackground";
import { MapPin } from "@/components/molecules/MapPin";
import { StationCallout } from "@/components/molecules/StationCallout";
import { UserLocationMarker } from "@/components/molecules/UserLocationMarker";
import { DraggableBottomSheet } from "@/components/organisms/DraggableBottomSheet";
import { LoadingPanel } from "@/components/organisms/LoadingPanel";
import {
  MapSurface,
  NOTHING_ABSORBED,
  type MapSurfaceAbsorbed,
  type MapSurfaceSize,
} from "@/components/organisms/MapSurface";
import { MotusHeader } from "@/components/organisms/MotusHeader";
import { MapControls } from "@/features/map/MapControls";
import {
  DEFAULT_RADIUS_KM,
  MapRadiusSelector,
} from "@/features/map/MapRadiusSelector";
import { MapTileLayer } from "@/features/map/MapTileLayer";
import {
  DEFAULT_ZOOM,
  centroid,
  panCenter,
  projectToScreen,
  zoomByFactor,
  type Coordinate,
} from "@/features/map/mapProjection";
import { TILE_ATTRIBUTION } from "@/features/map/tileSource";
import { useNearbyStations } from "@/features/nearby-stations/useNearbyStations";
import { openExternalNavigation } from "@/services/motus/externalNavigation";
import {
  cheapestValue,
  priceLines,
  stationTitle,
  type PriceLine,
} from "@/services/motus/stationDisplay";
import type { NearbyStation } from "@/services/motus/types";
import { useFuelPreferencesStore } from "@/stores/useFuelPreferencesStore";

/**
 * The radius selector can only narrow what was fetched — the endpoint has no
 * radius parameter (`useNearbyStations`) — so the map asks for more stations
 * than the S04 list does, enough to populate the widest radius offered.
 */
const MAP_RESULT_LIMIT = 100;

/**
 * Transparent box each pin is laid out in, anchored so the pin's tip sits
 * exactly on the projected coordinate. `pointerEvents="box-none"` keeps the
 * box itself untappable, so overlapping boxes never steal a neighbouring
 * pin's taps.
 */
const PIN_BOX_WIDTH = 180;
const PIN_BOX_HEIGHT = 160;

const USER_MARKER_SIZE = 40;

/**
 * Geometry of the popup anchored above a tapped pin. The pin's own height
 * depends on how many fuels it prices, so it is derived rather than fixed.
 */
const POPUP_WIDTH = 300;
const POPUP_HEIGHT = 72;
const POPUP_GAP = 8;
const PIN_LINE_HEIGHT = 22;
const PIN_CHROME_HEIGHT = 20;

/** How much of the station list is visible before the user drags the sheet up. */
const VISIBLE_ROWS = 2.5;
const FALLBACK_ROW_HEIGHT = 80;
/** `m-xs` above and below each row, plus the list's own `py-xs`. */
const ROW_SPACING = 8;
const LIST_PADDING = 8;

/** Extra map rendered past each viewport edge, so a drag has content to reveal. */
const OVERSCAN_RATIO = 0.5;
const MAX_OVERSCAN = 400;

interface MapRegion {
  center: Coordinate;
  zoom: number;
}

interface MapEntry {
  station: NearbyStation;
  coordinate: Coordinate;
  lines: PriceLine[];
  price: number;
}

function UserLocationDot({ point }: { point: { x: number; y: number } }) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: point.x - USER_MARKER_SIZE / 2,
        top: point.y - USER_MARKER_SIZE / 2,
        zIndex: 5,
      }}
    >
      <UserLocationMarker />
    </View>
  );
}

interface StationPopupProps {
  /** Where the pin's tip sits, in viewport pixels. */
  point: { x: number; y: number };
  viewport: MapSurfaceSize;
  /** Price rows on the pin — the pin's height, and so the popup's anchor. */
  pinLines: number;
  title: string;
  distanceKm: number;
  priceLabel?: string;
  onOpenDetails: () => void;
  onClose: () => void;
}

/**
 * Quick-info popup for the tapped station, anchored to its pin rather than
 * pinned under the radius chips: a callout detached from the marker it
 * describes leaves the user to work out *which* pin it belongs to. It sits
 * inside the map layer, so it tracks the pin while panning and zooming.
 *
 * Flips below the pin when there is no room above, and its horizontal
 * position is clamped to the viewport so a pin near an edge still gets a
 * fully readable popup.
 */
function StationPopup({
  point,
  viewport,
  pinLines,
  title,
  distanceKm,
  priceLabel,
  onOpenDetails,
  onClose,
}: StationPopupProps) {
  const pinHeight = pinLines * PIN_LINE_HEIGHT + PIN_CHROME_HEIGHT;
  const above = point.y - pinHeight - POPUP_GAP - POPUP_HEIGHT;
  const top = above >= 0 ? above : point.y + POPUP_GAP;
  const maxLeft = Math.max(viewport.width - POPUP_WIDTH - POPUP_GAP, POPUP_GAP);
  const left = Math.min(
    Math.max(point.x - POPUP_WIDTH / 2, POPUP_GAP),
    maxLeft,
  );

  return (
    <View
      style={{
        position: "absolute",
        left,
        top,
        width: POPUP_WIDTH,
        zIndex: 40,
        elevation: 40,
      }}
    >
      <StationCallout
        title={title}
        distanceKm={distanceKm}
        priceLabel={priceLabel}
        onOpenDetails={onOpenDetails}
        onClose={onClose}
      />
    </View>
  );
}

function hasCoordinates(station: NearbyStation): station is NearbyStation & {
  latitudine_completa: number;
  longitudine_completa: number;
} {
  return (
    station.latitudine_completa !== null &&
    station.longitudine_completa !== null
  );
}

/**
 * Tab "Map" (Task 19): home tab, reproducing Mappa Motus
 * (`stitch-screen-inventory.md` §5, Stitch ID
 * `cf26daff4b3e45a9bb74e23565803016`). Reuses `useNearbyStations` as-is —
 * this is the same real data (`GET /api/stations/nearby`) already powering
 * the S04 list route, presented as pins on real OpenStreetMap-derived
 * imagery (`MapTileLayer`) instead of rows, so the two screens never diverge
 * on what "nearby" means or duplicate the permission/geolocation state
 * machine.
 *
 * This screen owns the map *region* (centre + integer tile zoom) while
 * `MapSurface` owns only the gestures: a finished pan commits a new centre
 * and a finished pinch commits a new zoom level, which re-issues tiles and
 * re-projects the pins at their natural size. Panning is therefore unbounded
 * and zooming is real zoom, not a magnifying glass over one fixed image.
 *
 * The preferred-fuel setting is a hard filter here, not a hint: a station
 * that sells none of the selected fuels is not drawn at all, and one that
 * sells some of them shows a price line per fuel it actually has.
 */
export function MapScreen() {
  const router = useRouter();
  const { status, data, errorMessage, origin, retry } = useNearbyStations({
    limit: MAP_RESULT_LIMIT,
  });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(DEFAULT_RADIUS_KM);
  const preferredFuels = useFuelPreferencesStore((state) => state.fuels);

  /** `null` = follow the automatic region (own position, at the default zoom). */
  const [region, setRegion] = useState<MapRegion | null>(null);
  /** Gesture travel already folded into `region` — see `MapSurface`. */
  const [absorbed, setAbsorbed] =
    useState<MapSurfaceAbsorbed>(NOTHING_ABSORBED);
  /** Measured once, so "2 rows and a bit" holds whatever a row contains. */
  const [rowHeight, setRowHeight] = useState(FALLBACK_ROW_HEIGHT);
  const rowMeasured = useRef(false);

  const window = useWindowDimensions();
  const [viewport, setViewport] = useState<MapSurfaceSize>({
    width: window.width,
    height: window.height,
  });
  const handleSizeChange = useCallback((size: MapSurfaceSize) => {
    setViewport((current) =>
      current.width === size.width && current.height === size.height
        ? current
        : size,
    );
  }, []);

  const entries = useMemo<MapEntry[]>(
    () =>
      data
        .filter((station) => station.distance_km <= radiusKm)
        .filter(hasCoordinates)
        .map((station) => ({
          station,
          coordinate: {
            latitude: station.latitudine_completa,
            longitude: station.longitudine_completa,
          },
          lines: priceLines(station.prices, preferredFuels),
          price: cheapestValue(station.prices, preferredFuels) ?? Infinity,
        }))
        .filter((entry) => entry.lines.length > 0),
    [data, preferredFuels, radiusKm],
  );

  const ranked = useMemo(
    () => [...entries].sort((a, b) => a.price - b.price),
    [entries],
  );
  const cheapestId = ranked[0]?.station.id_impianto;

  /**
   * The device's own fix is the natural centre. Without it (fix still
   * pending) the stations' centroid keeps the pins on screen; with neither,
   * there is nothing real to centre on and no map is drawn — no placeholder
   * location is invented.
   */
  const autoCenter = useMemo<Coordinate | null>(
    () => origin ?? centroid(entries.map((entry) => entry.coordinate)),
    [origin, entries],
  );

  const center = region?.center ?? autoCenter;
  const zoom = region?.zoom ?? DEFAULT_ZOOM;

  /**
   * Pan and pinch run simultaneously and each commits on its own `onEnd`, so
   * the second handler to fire would otherwise close over the region as it
   * was *before* the first one committed. Reading through a ref keeps every
   * commit based on what is actually on screen.
   */
  const regionRef = useRef({ center, zoom });
  regionRef.current = { center, zoom };

  const overscan = useMemo(
    () => ({
      x: Math.min(viewport.width * OVERSCAN_RATIO, MAX_OVERSCAN),
      y: Math.min(viewport.height * OVERSCAN_RATIO, MAX_OVERSCAN),
    }),
    [viewport.width, viewport.height],
  );

  const commitRegion = useCallback((next: MapRegion | null) => {
    // Move the ref ahead of the render too: a pinch and a two-finger drag end
    // in the same tick, and the second commit must build on the first rather
    // than on the state React has not re-rendered yet.
    if (next) regionRef.current = next;
    setRegion(next);
  }, []);

  /** A gesture ended: absorb its travel *and* fold it into the region. */
  const handleGesturePan = useCallback(
    (dx: number, dy: number) => {
      const current = regionRef.current;
      if (!current.center) return;
      setAbsorbed((value) => ({ ...value, x: value.x + dx, y: value.y + dy }));
      commitRegion({
        center: panCenter(current.center, current.zoom, dx, dy),
        zoom: current.zoom,
      });
    },
    [commitRegion],
  );

  /** Region-only zoom, for the on-screen buttons: no gesture to absorb. */
  const applyZoom = useCallback(
    (factor: number) => {
      const current = regionRef.current;
      if (!current.center) return;
      commitRegion({
        center: current.center,
        zoom: zoomByFactor(current.zoom, factor),
      });
    },
    [commitRegion],
  );

  const handleGestureZoom = useCallback(
    (factor: number) => {
      setAbsorbed((value) => ({ ...value, scale: value.scale * factor }));
      applyZoom(factor);
    },
    [applyZoom],
  );

  /**
   * One-shot: rows are not a fixed height (a station pricing two fuels is
   * taller), so the visible slice is measured rather than assumed — but
   * measuring it *repeatedly* feeds the list's own height back into the
   * layout that produced it, and sub-pixel differences then never settle.
   * The first row's height is taken once and kept.
   */
  const measureRow = useCallback((event: LayoutChangeEvent) => {
    if (rowMeasured.current) return;
    const height = Math.round(event.nativeEvent.layout.height);
    if (height <= 0) return;
    rowMeasured.current = true;
    setRowHeight(height);
  }, []);

  const handleRadiusChange = useCallback(
    (next: number) => {
      setRadiusKm(next);
      // Back to the automatic region, centred on the user again.
      commitRegion(null);
    },
    [commitRegion],
  );

  /**
   * Picking a row centres the map on that station and opens its callout —
   * the detail screen is then one deliberate tap away on "Apri". Selecting
   * from a list is a "show me where this is" action; navigating straight out
   * of the map made the list unusable for comparing what is around you.
   */
  const focusStation = useCallback(
    (entry: MapEntry) => {
      setSelectedId(entry.station.id_impianto);
      commitRegion({
        center: entry.coordinate,
        zoom: Math.max(regionRef.current.zoom, DEFAULT_ZOOM),
      });
    },
    [commitRegion],
  );

  /** Also the sheet's collapse travel: collapsing hides exactly the list. */
  const listHeight = (rowHeight + ROW_SPACING) * VISIBLE_ROWS + LIST_PADDING;

  // Derived, not stored: a station filtered out by a radius or fuel-preference
  // change must not leave a stale callout behind.
  const selected =
    entries.find((entry) => entry.station.id_impianto === selectedId) ?? null;

  const goToStation = (id: number) =>
    router.push({ pathname: "/stations/[id]", params: { id: String(id) } });

  if (status === "requesting-permission" || status === "loading") {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <LoadingPanel
          message={
            status === "requesting-permission"
              ? "Richiesta del permesso di posizione…"
              : "Ricerca degli impianti più vicini…"
          }
        />
      </SafeAreaView>
    );
  }

  if (
    status === "permission-denied" ||
    status === "unavailable" ||
    status === "error"
  ) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <MotusHeader showSearchIcon />
        <ErrorState
          message={errorMessage ?? "Si è verificato un errore."}
          onRetry={retry}
        />
      </SafeAreaView>
    );
  }

  const emptyMessage =
    data.length === 0
      ? "Nessun impianto con coordinate disponibili nelle vicinanze."
      : entries.length === 0
        ? preferredFuels.length > 0
          ? `Nessun impianto entro ${radiusKm} km vende ${preferredFuels.join(" o ")}. Allarga il raggio o cambia carburante dal Profilo.`
          : `Nessun impianto entro ${radiusKm} km. Allarga il raggio.`
        : null;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-mapBackground">
      <MotusHeader showSearchIcon />

      <View className="flex-1">
        <MapSurface
          absorbed={absorbed}
          onSizeChange={handleSizeChange}
          onPan={handleGesturePan}
          onZoom={handleGestureZoom}
          background={
            <>
              <MapGridBackground />
              {center ? (
                <MapTileLayer
                  center={center}
                  zoom={zoom}
                  viewport={viewport}
                  overscan={overscan}
                />
              ) : null}
            </>
          }
        >
          {center ? (
            <>
              {origin ? (
                <UserLocationDot
                  point={projectToScreen(origin, center, zoom, viewport)}
                />
              ) : null}

              {entries.map((entry) => {
                const point = projectToScreen(
                  entry.coordinate,
                  center,
                  zoom,
                  viewport,
                );
                const isSelected = entry.station.id_impianto === selectedId;
                const isCheapest = entry.station.id_impianto === cheapestId;
                const priceSummary = entry.lines
                  .map((line) =>
                    line.fuel
                      ? `${line.fuel} ${line.priceLabel}`
                      : line.priceLabel,
                  )
                  .join(", ");
                return (
                  <View
                    key={entry.station.id_impianto}
                    pointerEvents="box-none"
                    style={{
                      position: "absolute",
                      left: point.x - PIN_BOX_WIDTH / 2,
                      top: point.y - PIN_BOX_HEIGHT,
                      width: PIN_BOX_WIDTH,
                      height: PIN_BOX_HEIGHT,
                      alignItems: "center",
                      justifyContent: "flex-end",
                      // A tapped pin comes to the front; the cheapest one still
                      // outranks the rest. `elevation` is the Android
                      // counterpart of `zIndex` for overlapping siblings.
                      zIndex: isSelected ? 30 : isCheapest ? 20 : 10,
                      elevation: isSelected ? 30 : isCheapest ? 20 : 10,
                    }}
                  >
                    <MapPin
                      lines={entry.lines}
                      highlighted={isCheapest}
                      selected={isSelected}
                      accessibilityLabel={`${stationTitle(entry.station)}, ${priceSummary}${
                        isCheapest ? ", prezzo più basso nel raggio" : ""
                      }`}
                      onPress={() => setSelectedId(entry.station.id_impianto)}
                    />
                  </View>
                );
              })}

              {selected ? (
                <StationPopup
                  point={projectToScreen(
                    selected.coordinate,
                    center,
                    zoom,
                    viewport,
                  )}
                  viewport={viewport}
                  pinLines={selected.lines.length}
                  title={stationTitle(selected.station)}
                  distanceKm={selected.station.distance_km}
                  priceLabel={selected.lines[0]?.priceLabel}
                  onOpenDetails={() => {
                    const id = selected.station.id_impianto;
                    setSelectedId(null);
                    goToStation(id);
                  }}
                  onClose={() => setSelectedId(null)}
                />
              ) : null}
            </>
          ) : null}
        </MapSurface>

        {emptyMessage ? (
          <View className="absolute inset-0 items-center justify-center px-lg">
            <AppText color="muted" className="text-center">
              {emptyMessage}
            </AppText>
          </View>
        ) : null}

        {/* Overlay column across the top of the map area. `box-none` lets drags
          on the gaps between the controls reach the map underneath. */}
        <View
          pointerEvents="box-none"
          className="absolute left-0 right-0 top-0 pt-sm"
        >
          <MapRadiusSelector value={radiusKm} onChange={handleRadiusChange} />

          <View className="items-end px-md pt-md" pointerEvents="box-none">
            <MapControls
              onZoomIn={() => applyZoom(2)}
              onZoomOut={() => applyZoom(0.5)}
              onRecenter={region ? () => commitRegion(null) : undefined}
            />
          </View>
        </View>

        {/* Required by the tile provider's terms (`tileSource.ts`). Sits at the
          map's bottom edge, where the bottom sheet may cover it until the
          user drags the sheet down — the same placement every map app uses. */}
        <View className="absolute bottom-sm left-sm rounded-md bg-surface px-xs">
          <AppText variant="caption" color="muted">
            {TILE_ATTRIBUTION}
          </AppText>
        </View>

        {ranked.length > 0 ? (
          <DraggableBottomSheet
            collapsedTravel={listHeight}
            header={
              <View className="flex-row items-center justify-between border-b-hairline border-border px-md pb-sm">
                <View className="flex-1 pr-sm">
                  <View className="flex-row items-center gap-xs">
                    <Icon name="local-gas-station" color="primary" size={20} />
                    <AppText accessibilityRole="header" variant="headlineMd">
                      Impianti più vicini
                    </AppText>
                  </View>
                  <AppText variant="bodyMd" color="muted">
                    {preferredFuels.length > 0
                      ? `Entro ${radiusKm} km · ${preferredFuels.join(", ")}`
                      : `Entro ${radiusKm} km · ordinati per prezzo`}
                  </AppText>
                  <AppText variant="caption" color="muted">
                    Il pin blu è il prezzo più basso nel raggio.
                  </AppText>
                </View>
                <HeaderIconButton
                  icon="view-list"
                  accessibilityLabel="Vedi come elenco"
                  onPress={() => router.push("/nearby")}
                  color="primary"
                />
              </View>
            }
          >
            <ScrollView className="px-xs py-xs" style={{ height: listHeight }}>
              {ranked.map((entry, index) => {
                const isCheapest = entry.station.id_impianto === cheapestId;
                return (
                  <Pressable
                    key={entry.station.id_impianto}
                    onLayout={index === 0 ? measureRow : undefined}
                    accessibilityRole="button"
                    accessibilityLabel={`Mostra ${stationTitle(entry.station)} sulla mappa`}
                    accessibilityState={{
                      selected: entry.station.id_impianto === selectedId,
                    }}
                    onPress={() => focusStation(entry)}
                    className={`m-xs flex-row items-center gap-sm rounded-xl p-sm ${
                      isCheapest
                        ? "border-hairline border-primary bg-selected"
                        : "border-hairline border-border bg-surface"
                    }`}
                  >
                    <View className="h-12 w-12 items-center justify-center rounded-lg border-hairline border-border bg-surfaceContainerLowest">
                      <Icon name="local-gas-station" color="muted" size={20} />
                    </View>
                    <View className="flex-1">
                      <AppText variant="headlineMd" numberOfLines={1}>
                        {stationTitle(entry.station)}
                      </AppText>
                      <AppText variant="bodyMd" color="muted">
                        {`${entry.station.distance_km.toFixed(1)} km`}
                      </AppText>
                    </View>
                    <View className="items-end gap-xs">
                      {/* Same lines as this station's pin — the sheet and the
                        map can never disagree about what is on offer. */}
                      {entry.lines.map((line) => (
                        <View
                          key={`${line.fuel ?? ""}-${line.priceLabel}`}
                          className="flex-row items-baseline gap-xs"
                        >
                          {line.fuel ? (
                            <AppText variant="caption" color="muted">
                              {line.fuel}
                            </AppText>
                          ) : null}
                          <AppText
                            variant={
                              entry.lines.length === 1 ? "title" : "headlineMd"
                            }
                            color={isCheapest ? "primary" : "foreground"}
                            className="font-bold"
                          >
                            {line.priceLabel}
                          </AppText>
                        </View>
                      ))}
                      {hasCoordinates(entry.station) ? (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Naviga verso ${stationTitle(entry.station)}`}
                          onPress={() =>
                            void openExternalNavigation(
                              entry.coordinate.latitude,
                              entry.coordinate.longitude,
                            )
                          }
                          className="flex-row items-center gap-xs"
                        >
                          <AppText variant="labelMd" color="primary">
                            Naviga
                          </AppText>
                          <Icon
                            name="arrow-forward"
                            color="primary"
                            size={14}
                          />
                        </Pressable>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </DraggableBottomSheet>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
