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

describe("navigation shell (VS6: Home -> S01/S02/S04 -> S03 -> back)", () => {
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

  it("reaches S01 from the home button and renders it directly at /stations", async () => {
    const testInstance = renderRouter("src/app", { initialUrl: "/" });
    const view = await testInstance;

    await fireEvent.press(view.getByText("Cerca impianti"));

    expect(testInstance.getPathname()).toBe("/stations");
    expect(view.getByRole("header", { name: "Impianti" })).toBeTruthy();
  });

  it("reaches S02 from the home button and back navigates to home", async () => {
    const testInstance = renderRouter("src/app", { initialUrl: "/" });
    const view = await testInstance;

    await fireEvent.press(view.getByText("Cerca prezzi carburante"));

    expect(testInstance.getPathname()).toBe("/prices");
    expect(
      view.getByRole("header", { name: "Prezzi carburante" }),
    ).toBeTruthy();

    await fireEvent.press(view.getByLabelText("Indietro"));
    expect(testInstance.getPathname()).toBe("/");
  });

  it("reaches S04 from the home button and back navigates to home", async () => {
    requestForegroundPermissionsAsyncMock.mockResolvedValue({
      status: Location.PermissionStatus.DENIED,
      granted: false,
      canAskAgain: true,
      expires: "never",
    });

    const testInstance = renderRouter("src/app", { initialUrl: "/" });
    const view = await testInstance;

    await fireEvent.press(view.getByText("Impianti vicini a me"));

    expect(testInstance.getPathname()).toBe("/nearby");
    expect(view.getByRole("header", { name: "Impianti vicini" })).toBeTruthy();

    await fireEvent.press(view.getByLabelText("Indietro"));
    expect(testInstance.getPathname()).toBe("/");
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
    expect(await view.findByText("Agip Eni")).toBeTruthy();

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
});
