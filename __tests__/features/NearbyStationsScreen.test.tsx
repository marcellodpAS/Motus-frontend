import { fireEvent, render, waitFor } from "@testing-library/react-native";
import * as Location from "expo-location";

import { NearbyStationsScreen } from "@/features/nearby-stations/NearbyStationsScreen";
import { nearby } from "@/services/motus/stations";
import type { NearbyStation } from "@/services/motus/types";

jest.mock("expo-location");
jest.mock("@/services/motus/stations");

const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
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

function nearbyStationFixture(
  overrides: Partial<NearbyStation> = {},
): NearbyStation {
  return {
    id_impianto: 1,
    gestore: "Esempio",
    bandiera: "Agip Eni",
    tipo_impianto: "Stradale",
    nome_impianto: "",
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
    prices: [],
    distance_km: 1.234,
    ...overrides,
  };
}

describe("NearbyStationsScreen", () => {
  beforeEach(() => {
    requestForegroundPermissionsAsyncMock.mockReset();
    hasServicesEnabledAsyncMock.mockReset();
    getCurrentPositionAsyncMock.mockReset();
    nearbyMock.mockReset();
    mockPush.mockReset();
    mockBack.mockReset();
  });

  it("renders populated results ordered by the server, with distance and fallback title", async () => {
    requestForegroundPermissionsAsyncMock.mockResolvedValue(
      grantedPermission(),
    );
    hasServicesEnabledAsyncMock.mockResolvedValue(true);
    getCurrentPositionAsyncMock.mockResolvedValue(positionFixture());
    nearbyMock.mockResolvedValue({
      origin: { lat: 41.9028, lon: 12.4964 },
      data: [nearbyStationFixture()],
      pagination: { limit: 20, offset: 0, total: 1 },
    });

    const { findByText } = await render(<NearbyStationsScreen />);

    // nome_impianto: "" falls back to bandiera, same as S01.
    expect(await findByText("Agip Eni")).toBeTruthy();
    expect(await findByText(/1\.2 km/)).toBeTruthy();
  });

  it("shows an explicit message when no station has coordinates available (not an ambiguous empty list)", async () => {
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

    const { findByText } = await render(<NearbyStationsScreen />);

    expect(
      await findByText(
        "Nessun impianto con coordinate disponibili nelle vicinanze.",
      ),
    ).toBeTruthy();
  });

  it("shows a distinct message when location permission is denied, not an empty list", async () => {
    requestForegroundPermissionsAsyncMock.mockResolvedValue({
      status: Location.PermissionStatus.DENIED,
      granted: false,
      canAskAgain: true,
      expires: "never" as const,
    });

    const { findByText } = await render(<NearbyStationsScreen />);

    expect(await findByText(/Permesso di posizione negato/)).toBeTruthy();
    expect(nearbyMock).not.toHaveBeenCalled();
  });

  it("navigates to S03 on row press", async () => {
    requestForegroundPermissionsAsyncMock.mockResolvedValue(
      grantedPermission(),
    );
    hasServicesEnabledAsyncMock.mockResolvedValue(true);
    getCurrentPositionAsyncMock.mockResolvedValue(positionFixture());
    nearbyMock.mockResolvedValue({
      origin: { lat: 41.9028, lon: 12.4964 },
      data: [nearbyStationFixture({ id_impianto: 42 })],
      pagination: { limit: 20, offset: 0, total: 1 },
    });

    const { findByText } = await render(<NearbyStationsScreen />);
    const row = await findByText("Agip Eni");
    await fireEvent.press(row);

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/stations/[id]",
      params: { id: "42" },
    });
  });
});
