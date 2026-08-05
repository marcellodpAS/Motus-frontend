import { act, renderHook, waitFor } from "@testing-library/react-native";
import * as Location from "expo-location";

import { useNearbyStations } from "@/features/nearby-stations/useNearbyStations";
import { nearby } from "@/services/motus/stations";
import type { NearbyStation } from "@/services/motus/types";

jest.mock("expo-location");
jest.mock("@/services/motus/stations");

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

function deniedPermission(canAskAgain: boolean) {
  return {
    status: Location.PermissionStatus.DENIED,
    granted: false,
    canAskAgain,
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

describe("useNearbyStations", () => {
  beforeEach(() => {
    requestForegroundPermissionsAsyncMock.mockReset();
    hasServicesEnabledAsyncMock.mockReset();
    getCurrentPositionAsyncMock.mockReset();
    nearbyMock.mockReset();
  });

  it("requests permission, checks services, gets position and fetches nearby stations with limit=20", async () => {
    requestForegroundPermissionsAsyncMock.mockResolvedValue(
      grantedPermission(),
    );
    hasServicesEnabledAsyncMock.mockResolvedValue(true);
    getCurrentPositionAsyncMock.mockResolvedValue(positionFixture());
    const station: NearbyStation = {
      id_impianto: 1,
      gestore: "Esempio",
      bandiera: "Agip Eni",
      tipo_impianto: "Stradale",
      nome_impianto: "Impianto Test",
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
    };
    nearbyMock.mockResolvedValue({
      origin: { lat: 41.9028, lon: 12.4964 },
      data: [station],
      pagination: { limit: 20, offset: 0, total: 1 },
    });

    const { result } = await renderHook(() => useNearbyStations());

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(nearbyMock).toHaveBeenCalledWith(
      { lat: 41.9028, lon: 12.4964, limit: 20 },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(result.current.data).toEqual([station]);
  });

  it("surfaces a permission-denied status distinct from an empty result", async () => {
    requestForegroundPermissionsAsyncMock.mockResolvedValue(
      deniedPermission(true),
    );

    const { result } = await renderHook(() => useNearbyStations());

    await waitFor(() =>
      expect(result.current.status).toBe("permission-denied"),
    );
    expect(result.current.errorMessage).toContain("negato");
    expect(nearbyMock).not.toHaveBeenCalled();
  });

  it("surfaces a distinct message when the permission is permanently denied (canAskAgain: false)", async () => {
    requestForegroundPermissionsAsyncMock.mockResolvedValue(
      deniedPermission(false),
    );

    const { result } = await renderHook(() => useNearbyStations());

    await waitFor(() =>
      expect(result.current.status).toBe("permission-denied"),
    );
    expect(result.current.errorMessage).toContain("impostazioni");
  });

  it("surfaces an unavailable status when location services are disabled on the device", async () => {
    requestForegroundPermissionsAsyncMock.mockResolvedValue(
      grantedPermission(),
    );
    hasServicesEnabledAsyncMock.mockResolvedValue(false);

    const { result } = await renderHook(() => useNearbyStations());

    await waitFor(() => expect(result.current.status).toBe("unavailable"));
    expect(getCurrentPositionAsyncMock).not.toHaveBeenCalled();
  });

  it("surfaces a network/server error and lets retry replay the whole chain", async () => {
    requestForegroundPermissionsAsyncMock.mockResolvedValue(
      grantedPermission(),
    );
    hasServicesEnabledAsyncMock.mockResolvedValue(true);
    getCurrentPositionAsyncMock.mockResolvedValue(positionFixture());
    nearbyMock.mockRejectedValueOnce(
      new Error("Richiesta fallita con stato 500."),
    );

    const { result } = await renderHook(() => useNearbyStations());
    await waitFor(() => expect(result.current.status).toBe("error"));

    nearbyMock.mockResolvedValueOnce({
      origin: { lat: 41.9028, lon: 12.4964 },
      data: [],
      pagination: { limit: 20, offset: 0, total: 0 },
    });

    await act(async () => {
      result.current.retry();
    });

    await waitFor(() => expect(result.current.status).toBe("success"));
  });
});
