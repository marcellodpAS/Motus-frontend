import { router } from "expo-router";
import { act, fireEvent, renderRouter } from "expo-router/testing-library";
import * as Location from "expo-location";

import { search as searchPrices } from "@/services/motus/prices";
import {
  getById,
  nearby,
  search as searchStations,
} from "@/services/motus/stations";
import type {
  NearbyStation,
  PriceRow,
  StationSummary,
} from "@/services/motus/types";

// docs/motus/testing-strategy.md §2: no real network call in any automatic
// test, even in a navigation-shell test — mock every service module and
// expo-location.
jest.mock("@/services/motus/stations");
jest.mock("@/services/motus/prices");
jest.mock("expo-location");

const searchStationsMock = searchStations as jest.MockedFunction<
  typeof searchStations
>;
const getByIdMock = getById as jest.MockedFunction<typeof getById>;
const nearbyMock = nearby as jest.MockedFunction<typeof nearby>;
const searchPricesMock = searchPrices as jest.MockedFunction<
  typeof searchPrices
>;

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

function stationSummaryFixture(): StationSummary {
  return {
    id_impianto: 57660,
    gestore: "Esempio Gestore",
    bandiera: "Agip Eni",
    tipo_impianto: "Stradale",
    nome_impianto: "Impianto Test",
    indirizzo: "VIA ESEMPIO 1",
    comune: "Roma",
    provincia: "RM",
    latitudine: 41.9028,
    longitudine: 12.4964,
    updated_at: "2026-08-04T06:30:00.377849+00:00",
    via_geocoded: null,
    latitudine_completa: 41.9028,
    longitudine_completa: 12.4964,
    geocoding_status: "success",
  };
}

function priceRowFixture(): PriceRow {
  return {
    id_impianto: 57660,
    carburante: "Benzina",
    prezzo: 1.754,
    self_service: 1,
    data_comunicazione: "31/07/2026 10:28:04",
    updated_at: "2026-08-04T06:30:00.377849+00:00",
    nome_impianto: "NURE SUD",
    comune: "Roma",
    provincia: "RM",
    via_geocoded: null,
    latitudine_completa: 41.9028,
    longitudine_completa: 12.4964,
  };
}

function nearbyStationFixture(): NearbyStation {
  return {
    id_impianto: 57660,
    gestore: "Esempio Gestore",
    bandiera: "Agip Eni",
    tipo_impianto: "Stradale",
    nome_impianto: "",
    indirizzo: "VIA ESEMPIO 1",
    comune: "Roma",
    provincia: "RM",
    latitudine: 41.9028,
    longitudine: 12.4964,
    updated_at: "2026-08-04T06:30:00.377849+00:00",
    via_geocoded: null,
    latitudine_completa: 41.9028,
    longitudine_completa: 12.4964,
    geocoding_status: "success",
    prices: [],
    distance_km: 1.234,
  };
}

function grantedPermission() {
  return {
    status: Location.PermissionStatus.GRANTED,
    granted: true,
    canAskAgain: true,
    expires: "never" as const,
  };
}

function deniedPermission() {
  return {
    status: Location.PermissionStatus.DENIED,
    granted: false,
    canAskAgain: true,
    expires: "never" as const,
  };
}

describe("navigation shell (Task 19: tab bar -> S01/S02/S03/S04/report, and back)", () => {
  beforeEach(() => {
    searchStationsMock.mockReset();
    searchStationsMock.mockResolvedValue({
      data: [],
      pagination: { limit: 50, offset: 0, total: 0 },
    });
    getByIdMock.mockReset();
    nearbyMock.mockReset();
    searchPricesMock.mockReset();
    requestForegroundPermissionsAsyncMock.mockReset();
    hasServicesEnabledAsyncMock.mockReset();
    getCurrentPositionAsyncMock.mockReset();
  });

  it(
    "renders the Map tab at / by default, with the Favorites/Pro/Profile tabs reachable",
    async () => {
      requestForegroundPermissionsAsyncMock.mockResolvedValue(
        deniedPermission(),
      );

      const testInstance = renderRouter("src/app", { initialUrl: "/" });
      const view = await testInstance;

      expect(testInstance.getPathname()).toBe("/");
      // Permission denied -> ErrorState is rendered instead of the map itself.
      expect(
        await view.findByText(/Permesso di posizione negato/),
      ).toBeTruthy();

      await fireEvent.press(view.getByLabelText(/^Favorites, tab/));
      expect(testInstance.getPathname()).toBe("/favorites");

      await fireEvent.press(view.getByLabelText(/^Pro, tab/));
      expect(testInstance.getPathname()).toBe("/pro");
      expect(
        await view.findByText("Previsioni non ancora disponibili"),
      ).toBeTruthy();

      await fireEvent.press(view.getByLabelText(/^Profile, tab/));
      expect(testInstance.getPathname()).toBe("/profile");
      expect(await view.findByText("Profilo non disponibile")).toBeTruthy();
    },
    // First render of the whole tab shell (root layout + 4 screens) is the
    // heaviest mount in this file; under full-suite worker contention (CI)
    // it clears 600ms standalone but can cross the 5000ms default when many
    // suites run in parallel. Bump it instead of the whole file/suite.
    15000,
  );

  it("reaches S01 from the Map header search icon, and back navigates to the tab shell", async () => {
    requestForegroundPermissionsAsyncMock.mockResolvedValue(deniedPermission());

    const testInstance = renderRouter("src/app", { initialUrl: "/" });
    const view = await testInstance;
    await view.findByText(/Permesso di posizione negato/);

    await fireEvent.press(view.getByLabelText("Cerca impianti"));

    expect(testInstance.getPathname()).toBe("/stations");
    expect(view.getByRole("header", { name: "Impianti" })).toBeTruthy();

    await fireEvent.press(view.getByLabelText("Indietro"));
    expect(testInstance.getPathname()).toBe("/");
  });

  it("reaches S02 from S01's header action and back navigates to S01", async () => {
    const testInstance = renderRouter("src/app", { initialUrl: "/stations" });
    const view = await testInstance;

    await fireEvent.press(view.getByLabelText("Cerca prezzi carburante"));

    expect(testInstance.getPathname()).toBe("/prices");
    expect(
      view.getByRole("header", { name: "Prezzi carburante" }),
    ).toBeTruthy();

    await fireEvent.press(view.getByLabelText("Indietro"));
    expect(testInstance.getPathname()).toBe("/stations");
  });

  it("navigates from the S01 list to the S03 detail route with the id_impianto param, then back", async () => {
    getByIdMock.mockResolvedValue({
      station: stationSummaryFixture(),
      prices: [],
    });

    const testInstance = renderRouter("src/app", { initialUrl: "/stations" });
    const view = await testInstance;
    expect(view.getByRole("header", { name: "Impianti" })).toBeTruthy();

    await act(async () => {
      router.push("/stations/57660");
    });

    expect(
      await view.findByRole("header", { name: "Dettaglio impianto" }),
    ).toBeTruthy();
    expect(testInstance.getSearchParams()).toEqual({ id: "57660" });
    expect(await view.findByText("Impianto Test")).toBeTruthy();

    await fireEvent.press(view.getByLabelText("Indietro"));

    expect(testInstance.getPathname()).toBe("/stations");
    expect(view.getByRole("header", { name: "Impianti" })).toBeTruthy();
  });

  it("navigates from an S02 price row to the S03 detail route", async () => {
    searchPricesMock.mockResolvedValue({
      data: [priceRowFixture()],
      pagination: { limit: 50, offset: 0, total: 1 },
    });
    getByIdMock.mockResolvedValue({
      station: stationSummaryFixture(),
      prices: [],
    });

    const testInstance = renderRouter("src/app", { initialUrl: "/prices" });
    const view = await testInstance;

    await fireEvent.changeText(view.getByLabelText("Carburante"), "Benzina");
    const row = await view.findByText("NURE SUD");
    await fireEvent.press(row);

    expect(testInstance.getPathname()).toBe("/stations/57660");
    expect(
      await view.findByRole("header", { name: "Dettaglio impianto" }),
    ).toBeTruthy();
  });

  it("navigates from an S04 nearby station to the S03 detail route", async () => {
    requestForegroundPermissionsAsyncMock.mockResolvedValue(
      grantedPermission(),
    );
    hasServicesEnabledAsyncMock.mockResolvedValue(true);
    getCurrentPositionAsyncMock.mockResolvedValue({
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
    });
    nearbyMock.mockResolvedValue({
      origin: { lat: 41.9028, lon: 12.4964 },
      data: [nearbyStationFixture()],
      pagination: { limit: 20, offset: 0, total: 1 },
    });
    getByIdMock.mockResolvedValue({
      station: stationSummaryFixture(),
      prices: [],
    });

    const testInstance = renderRouter("src/app", { initialUrl: "/nearby" });
    const view = await testInstance;

    const row = await view.findByText("Agip Eni");
    await fireEvent.press(row);

    expect(testInstance.getPathname()).toBe("/stations/57660");
    expect(
      await view.findByRole("header", { name: "Dettaglio impianto" }),
    ).toBeTruthy();
  });

  it("reaches the Map tab's pins/bottom sheet when nearby stations are found, and can jump to the S04 list view", async () => {
    requestForegroundPermissionsAsyncMock.mockResolvedValue(
      grantedPermission(),
    );
    hasServicesEnabledAsyncMock.mockResolvedValue(true);
    getCurrentPositionAsyncMock.mockResolvedValue({
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
    });
    nearbyMock.mockResolvedValue({
      origin: { lat: 41.9028, lon: 12.4964 },
      data: [
        {
          ...nearbyStationFixture(),
          nome_impianto: "Impianto Test",
          prices: [
            {
              id_impianto: 57660,
              carburante: "Benzina",
              prezzo: 1.699,
              self_service: 1,
              data_comunicazione: null,
              updated_at: "2026-08-04T06:30:00.377849+00:00",
            },
          ],
        },
      ],
      pagination: { limit: 20, offset: 0, total: 1 },
    });

    const testInstance = renderRouter("src/app", { initialUrl: "/" });
    const view = await testInstance;

    expect(await view.findByText("Impianti più vicini")).toBeTruthy();
    expect(await view.findByText("Impianto Test")).toBeTruthy();

    await fireEvent.press(view.getByLabelText("Vedi come elenco"));
    expect(testInstance.getPathname()).toBe("/nearby");
  });

  it("reaches Segnala Prezzo from the S03 action row, with the station context and a not-available submit outcome", async () => {
    getByIdMock.mockResolvedValue({
      station: stationSummaryFixture(),
      prices: [],
    });

    const testInstance = renderRouter("src/app", {
      initialUrl: "/stations/57660",
    });
    const view = await testInstance;
    await view.findByText("Impianto Test");

    await fireEvent.press(view.getByLabelText("Segnala prezzo"));

    expect(testInstance.getPathname()).toBe("/stations/57660/report");
    expect(
      await view.findByRole("header", { name: "Segnala Prezzo" }),
    ).toBeTruthy();
    expect(await view.findAllByText("Impianto Test")).toBeTruthy();

    await fireEvent.changeText(view.getByLabelText("Benzina"), "1.85");
    await fireEvent.press(view.getByText("Invia segnalazione"));

    expect(
      await view.findByText("Invio non disponibile in questa versione"),
    ).toBeTruthy();

    await fireEvent.press(view.getByLabelText("Indietro"));
    expect(testInstance.getPathname()).toBe("/stations/57660");
  });
});
