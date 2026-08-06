import { fireEvent, render } from "@testing-library/react-native";
import * as Location from "expo-location";

import { MapScreen } from "@/features/map/MapScreen";
import { nearby } from "@/services/motus/stations";
import type { NearbyStation, Price } from "@/services/motus/types";
import { useFuelPreferencesStore } from "@/stores/useFuelPreferencesStore";

jest.mock("expo-location");
jest.mock("@/services/motus/stations");

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const requestForegroundPermissionsAsyncMock =
  Location.requestForegroundPermissionsAsync as jest.MockedFunction<
    typeof Location.requestForegroundPermissionsAsync
  >;
const hasServicesEnabledAsyncMock =
  Location.hasServicesEnabledAsync as jest.MockedFunction<
    typeof Location.hasServicesEnabledAsync
  >;
const getCurrentPositionAsyncMock =
  Location.getCurrentPositionAsync as jest.MockedFunction<
    typeof Location.getCurrentPositionAsync
  >;
const nearbyMock = nearby as jest.MockedFunction<typeof nearby>;

function grantedPermission() {
  return {
    status: Location.PermissionStatus.GRANTED,
    granted: true,
    canAskAgain: true,
    expires: "never" as const,
  };
}

function positionFixture() {
  return {
    coords: {
      latitude: 41.9028,
      longitude: 12.4964,
      altitude: null,
      accuracy: 5,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: 1_754_000_000_000,
  };
}

function stationFixture(overrides: Partial<NearbyStation> = {}): NearbyStation {
  return {
    id_impianto: 1,
    gestore: "Esempio",
    bandiera: "Agip Eni",
    tipo_impianto: "Stradale",
    nome_impianto: "Impianto Est",
    indirizzo: "Via Test 1",
    comune: "Roma",
    provincia: "RM",
    latitudine: 41.9,
    longitudine: 12.5,
    updated_at: "2026-08-04T06:30:00.377849+00:00",
    via_geocoded: null,
    latitudine_completa: 41.9,
    longitudine_completa: 12.5,
    geocoding_status: "success",
    prices: [
      {
        id_impianto: 1,
        carburante: "Benzina",
        prezzo: 1.699,
        self_service: 1,
        data_comunicazione: null,
        updated_at: "2026-08-04T06:30:00.377849+00:00",
      },
    ],
    distance_km: 1.2,
    ...overrides,
  };
}

function priceFixture(overrides: Partial<Price> = {}): Price {
  return {
    id_impianto: 1,
    carburante: "Benzina",
    prezzo: 1.699,
    self_service: 1,
    data_comunicazione: null,
    updated_at: "2026-08-04T06:30:00.377849+00:00",
    ...overrides,
  };
}

/** Resolves the whole permission -> position -> nearby chain successfully. */
function mockNearby(data: NearbyStation[]) {
  requestForegroundPermissionsAsyncMock.mockResolvedValue(grantedPermission());
  hasServicesEnabledAsyncMock.mockResolvedValue(true);
  getCurrentPositionAsyncMock.mockResolvedValue(positionFixture());
  nearbyMock.mockResolvedValue({
    origin: { lat: 41.9028, lon: 12.4964 },
    data,
    pagination: { limit: 20, offset: 0, total: data.length },
  });
}

describe("MapScreen", () => {
  beforeEach(() => {
    requestForegroundPermissionsAsyncMock.mockReset();
    hasServicesEnabledAsyncMock.mockReset();
    getCurrentPositionAsyncMock.mockReset();
    nearbyMock.mockReset();
    mockPush.mockReset();
    // Persisted store, shared across tests in this file — reset before each
    // case (not after: the rendered tree is still mounted in `afterEach`, and
    // updating it there fires React's "not wrapped in act(...)" warning).
    useFuelPreferencesStore.setState({ fuels: [] });
  });

  it("renders pins and the 'cheapest nearby' bottom sheet ranked by price", async () => {
    requestForegroundPermissionsAsyncMock.mockResolvedValue(
      grantedPermission(),
    );
    hasServicesEnabledAsyncMock.mockResolvedValue(true);
    getCurrentPositionAsyncMock.mockResolvedValue(positionFixture());
    nearbyMock.mockResolvedValue({
      origin: { lat: 41.9028, lon: 12.4964 },
      data: [
        stationFixture({
          id_impianto: 1,
          nome_impianto: "Caro",
          prices: [
            {
              id_impianto: 1,
              carburante: "Benzina",
              prezzo: 1.9,
              self_service: 1,
              data_comunicazione: null,
              updated_at: "2026-08-04T06:30:00.377849+00:00",
            },
          ],
        }),
        stationFixture({
          id_impianto: 2,
          nome_impianto: "Economico",
          prices: [
            {
              id_impianto: 2,
              carburante: "Benzina",
              prezzo: 1.5,
              self_service: 1,
              data_comunicazione: null,
              updated_at: "2026-08-04T06:30:00.377849+00:00",
            },
          ],
        }),
      ],
      pagination: { limit: 20, offset: 0, total: 2 },
    });

    const { findByText, getAllByText } = await render(<MapScreen />);

    expect(await findByText("Impianti più vicini")).toBeTruthy();
    // Both stations rendered as pins AND as bottom-sheet rows -> price appears twice each.
    expect(getAllByText("1.900 €").length).toBeGreaterThan(0);
    expect(getAllByText("1.500 €").length).toBeGreaterThan(0);
  });

  it("centres the map on a station picked from the list instead of navigating", async () => {
    mockNearby([
      stationFixture({ id_impianto: 42, nome_impianto: "Impianto Est" }),
    ]);

    const { findByLabelText, getByLabelText, queryByLabelText } = await render(
      <MapScreen />,
    );

    const row = await findByLabelText("Mostra Impianto Est sulla mappa");
    await fireEvent.press(row);

    expect(mockPush).not.toHaveBeenCalled();
    // Centred (the recenter control only exists once the region moved) and
    // selected, with its callout open.
    expect(getByLabelText("Torna alla mia posizione")).toBeTruthy();
    expect(queryByLabelText("Apri scheda di Impianto Est")).toBeTruthy();
  });

  it("opens the detail route from the callout's 'Apri' after picking a row", async () => {
    mockNearby([
      stationFixture({ id_impianto: 42, nome_impianto: "Impianto Est" }),
    ]);

    const { findByLabelText, getByLabelText } = await render(<MapScreen />);

    await fireEvent.press(
      await findByLabelText("Mostra Impianto Est sulla mappa"),
    );
    await fireEvent.press(getByLabelText("Apri scheda di Impianto Est"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/stations/[id]",
      params: { id: "42" },
    });
  });

  it("tapping a pin shows an info popup instead of navigating directly", async () => {
    requestForegroundPermissionsAsyncMock.mockResolvedValue(
      grantedPermission(),
    );
    hasServicesEnabledAsyncMock.mockResolvedValue(true);
    getCurrentPositionAsyncMock.mockResolvedValue(positionFixture());
    nearbyMock.mockResolvedValue({
      origin: { lat: 41.9028, lon: 12.4964 },
      data: [
        stationFixture({ id_impianto: 42, nome_impianto: "Impianto Est" }),
      ],
      pagination: { limit: 20, offset: 0, total: 1 },
    });

    const { findByRole, queryByLabelText } = await render(<MapScreen />);
    const pin = await findByRole("button", {
      name: "Impianto Est, 1.699 €, prezzo più basso nel raggio",
    });
    await fireEvent.press(pin);

    expect(mockPush).not.toHaveBeenCalled();
    expect(queryByLabelText("Apri scheda di Impianto Est")).toBeTruthy();
  });

  it("the popup's 'Apri' action navigates to the station detail route", async () => {
    requestForegroundPermissionsAsyncMock.mockResolvedValue(
      grantedPermission(),
    );
    hasServicesEnabledAsyncMock.mockResolvedValue(true);
    getCurrentPositionAsyncMock.mockResolvedValue(positionFixture());
    nearbyMock.mockResolvedValue({
      origin: { lat: 41.9028, lon: 12.4964 },
      data: [
        stationFixture({ id_impianto: 42, nome_impianto: "Impianto Est" }),
      ],
      pagination: { limit: 20, offset: 0, total: 1 },
    });

    const { findByRole, getByLabelText } = await render(<MapScreen />);
    const pin = await findByRole("button", {
      name: "Impianto Est, 1.699 €, prezzo più basso nel raggio",
    });
    await fireEvent.press(pin);
    await fireEvent.press(getByLabelText("Apri scheda di Impianto Est"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/stations/[id]",
      params: { id: "42" },
    });
  });

  it("the popup's close action dismisses it without navigating", async () => {
    requestForegroundPermissionsAsyncMock.mockResolvedValue(
      grantedPermission(),
    );
    hasServicesEnabledAsyncMock.mockResolvedValue(true);
    getCurrentPositionAsyncMock.mockResolvedValue(positionFixture());
    nearbyMock.mockResolvedValue({
      origin: { lat: 41.9028, lon: 12.4964 },
      data: [
        stationFixture({ id_impianto: 42, nome_impianto: "Impianto Est" }),
      ],
      pagination: { limit: 20, offset: 0, total: 1 },
    });

    const { findByRole, getByLabelText, queryByLabelText } = await render(
      <MapScreen />,
    );
    const pin = await findByRole("button", {
      name: "Impianto Est, 1.699 €, prezzo più basso nel raggio",
    });
    await fireEvent.press(pin);
    await fireEvent.press(getByLabelText("Chiudi"));

    expect(mockPush).not.toHaveBeenCalled();
    expect(queryByLabelText("Apri scheda di Impianto Est")).toBeNull();
  });

  it("shows the user's own position once geolocated", async () => {
    mockNearby([stationFixture({ id_impianto: 42 })]);

    const { findByLabelText } = await render(<MapScreen />);

    expect(await findByLabelText("La tua posizione")).toBeTruthy();
  });

  it("marks a tapped pin as selected", async () => {
    mockNearby([
      stationFixture({ id_impianto: 42, nome_impianto: "Impianto Est" }),
    ]);

    const { findByRole, getByRole } = await render(<MapScreen />);
    const pin = await findByRole("button", {
      name: "Impianto Est, 1.699 €, prezzo più basso nel raggio",
    });
    await fireEvent.press(pin);

    expect(
      getByRole("button", {
        name: "Impianto Est, 1.699 €, prezzo più basso nel raggio",
        selected: true,
      }),
    ).toBeTruthy();
  });

  it("hides a station that sells none of the preferred fuels", async () => {
    useFuelPreferencesStore.setState({ fuels: ["Metano"] });
    mockNearby([
      stationFixture({
        id_impianto: 1,
        nome_impianto: "Solo benzina",
        prices: [priceFixture({ carburante: "Benzina", prezzo: 1.9 })],
      }),
      stationFixture({
        id_impianto: 2,
        nome_impianto: "Con metano",
        prices: [priceFixture({ carburante: "Metano", prezzo: 1.35 })],
      }),
    ]);

    const { findAllByText, queryByText } = await render(<MapScreen />);

    expect(await findAllByText("Con metano")).toBeTruthy();
    expect(queryByText("Solo benzina")).toBeNull();
    expect(queryByText("1.900 €")).toBeNull();
  });

  it("prices every preferred fuel a station sells, and only those", async () => {
    useFuelPreferencesStore.setState({ fuels: ["Benzina", "Gasolio", "GPL"] });
    mockNearby([
      stationFixture({
        id_impianto: 1,
        nome_impianto: "Impianto Est",
        prices: [
          priceFixture({ carburante: "Benzina", prezzo: 1.85 }),
          priceFixture({ carburante: "Gasolio", prezzo: 1.72 }),
          priceFixture({ carburante: "Metano", prezzo: 1.35 }),
        ],
      }),
    ]);

    const { findByRole, queryByText } = await render(<MapScreen />);

    // One pin, one labelled line per preferred fuel actually on offer — GPL
    // is not sold here and Metano was not asked for, so neither is shown.
    expect(
      await findByRole("button", {
        name: "Impianto Est, Benzina 1.850 €, Gasolio 1.720 €, prezzo più basso nel raggio",
      }),
    ).toBeTruthy();
    expect(queryByText("1.350 €")).toBeNull();
  });

  it("explains an empty map caused by the fuel preference itself", async () => {
    useFuelPreferencesStore.setState({ fuels: ["Metano"] });
    mockNearby([
      stationFixture({
        id_impianto: 1,
        prices: [priceFixture({ carburante: "Benzina", prezzo: 1.9 })],
      }),
    ]);

    const { findByText } = await render(<MapScreen />);

    expect(await findByText(/Nessun impianto entro 5 km vende/)).toBeTruthy();
  });

  it("hides stations beyond the selected radius, and reveals them when it widens", async () => {
    mockNearby([
      stationFixture({
        id_impianto: 1,
        nome_impianto: "Vicina",
        distance_km: 2.4,
      }),
      stationFixture({
        id_impianto: 2,
        nome_impianto: "Lontana",
        distance_km: 12.8,
      }),
    ]);

    const { findAllByText, queryByText, getByLabelText } = await render(
      <MapScreen />,
    );

    expect(await findAllByText("Vicina")).toBeTruthy();
    expect(queryByText("Lontana")).toBeNull();

    await fireEvent.press(getByLabelText("Raggio 20 km"));

    expect(await findAllByText("Lontana")).toBeTruthy();
  });

  it("offers a recenter control only once the map region has been changed", async () => {
    mockNearby([stationFixture({ id_impianto: 42 })]);

    const { findByLabelText, queryByLabelText, getByLabelText } = await render(
      <MapScreen />,
    );

    expect(await findByLabelText("Aumenta zoom")).toBeTruthy();
    expect(queryByLabelText("Torna alla mia posizione")).toBeNull();

    await fireEvent.press(getByLabelText("Aumenta zoom"));
    expect(getByLabelText("Torna alla mia posizione")).toBeTruthy();

    await fireEvent.press(getByLabelText("Torna alla mia posizione"));
    expect(queryByLabelText("Torna alla mia posizione")).toBeNull();
  });

  it("shows a distinct message when location permission is denied", async () => {
    requestForegroundPermissionsAsyncMock.mockResolvedValue({
      status: Location.PermissionStatus.DENIED,
      granted: false,
      canAskAgain: true,
      expires: "never" as const,
    });

    const { findByText } = await render(<MapScreen />);

    expect(await findByText(/Permesso di posizione negato/)).toBeTruthy();
    expect(nearbyMock).not.toHaveBeenCalled();
  });

  it("shows an explicit empty message when no station has coordinates", async () => {
    requestForegroundPermissionsAsyncMock.mockResolvedValue(
      grantedPermission(),
    );
    hasServicesEnabledAsyncMock.mockResolvedValue(true);
    getCurrentPositionAsyncMock.mockResolvedValue(positionFixture());
    nearbyMock.mockResolvedValue({
      origin: { lat: 41.9028, lon: 12.4964 },
      data: [],
      pagination: { limit: 20, offset: 0, total: 0 },
    });

    const { findByText } = await render(<MapScreen />);

    expect(
      await findByText(
        "Nessun impianto con coordinate disponibili nelle vicinanze.",
      ),
    ).toBeTruthy();
  });
});
