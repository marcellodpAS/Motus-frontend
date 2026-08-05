import { getById, nearby, search } from "@/services/motus/stations";
import type { NearbyStation, Station } from "@/services/motus/types";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

// Fixtures derived from real observations in docs/motus/api-contract.md
// (docs/motus/testing-strategy.md §3): empty nome_impianto (57660), prices: [].
const stationFixture: Station = {
  id_impianto: 57660,
  gestore: "Esempio Gestore",
  bandiera: "Agip Eni",
  tipo_impianto: "Stradale",
  nome_impianto: "",
  indirizzo: "VIA BRUNETTO FERRARI 21/23, 42049 - -",
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
};

describe("stations.search", () => {
  const originalUrl = process.env.EXPO_PUBLIC_API_URL;
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.EXPO_PUBLIC_API_URL = "http://localhost:8080";
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env.EXPO_PUBLIC_API_URL = originalUrl;
    global.fetch = originalFetch;
  });

  it("returns the populated list with normalized pagination", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse(200, {
        data: [stationFixture],
        pagination: { limit: 50, offset: 0, total: 23962 },
      }),
    );

    const result = await search({ comune: "Roma" });

    expect(result.data).toEqual([stationFixture]);
    expect(result.pagination).toEqual({ limit: 50, offset: 0, total: 23962 });
  });

  it("requests /api/stations with the given filters as query params", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse(200, {
        data: [],
        pagination: { limit: 50, offset: 0, total: 0 },
      }),
    );

    await search({
      comune: "Roma",
      provincia: "RM",
      q: "Eni",
      limit: 10,
      offset: 20,
    });

    const [url] = (global.fetch as jest.Mock).mock.calls[0] as [string];
    const parsed = new URL(url);
    expect(parsed.pathname).toBe("/api/stations");
    expect(parsed.searchParams.get("comune")).toBe("Roma");
    expect(parsed.searchParams.get("provincia")).toBe("RM");
    expect(parsed.searchParams.get("q")).toBe("Eni");
    expect(parsed.searchParams.get("limit")).toBe("10");
    expect(parsed.searchParams.get("offset")).toBe("20");
  });

  it("returns an empty list without error when no results match", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse(200, {
        data: [],
        pagination: { limit: 50, offset: 0, total: 0 },
      }),
    );

    const result = await search({ comune: "Nessun Comune Reale" });

    expect(result.data).toEqual([]);
    expect(result.pagination.total).toBe(0);
  });

  it("propagates the 400 application error for non-integer limit/offset", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse(400, {
        error: "limit e offset devono essere numeri interi",
      }),
    );

    await expect(search({ limit: Number.NaN })).rejects.toMatchObject({
      status: 400,
      message: "limit e offset devono essere numeri interi",
    });
  });
});

describe("stations.getById", () => {
  const originalUrl = process.env.EXPO_PUBLIC_API_URL;
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.EXPO_PUBLIC_API_URL = "http://localhost:8080";
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env.EXPO_PUBLIC_API_URL = originalUrl;
    global.fetch = originalFetch;
  });

  it("requests /api/stations/{id} and returns station + prices separately", async () => {
    const { prices, ...stationWithoutPrices } = stationFixture;
    void prices;
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse(200, {
        station: stationWithoutPrices,
        prices: [
          {
            id_impianto: 57660,
            carburante: "Benzina",
            prezzo: 1.754,
            self_service: 1,
            data_comunicazione: "31/07/2026 10:28:04",
            updated_at: "2026-08-04T06:30:00.377849+00:00",
          },
        ],
      }),
    );

    const result = await getById("57660");

    const [url] = (global.fetch as jest.Mock).mock.calls[0] as [string];
    expect(new URL(url).pathname).toBe("/api/stations/57660");
    expect(result.station).toEqual(stationWithoutPrices);
    expect(result.prices).toHaveLength(1);
  });

  it("propagates the specific 404 for a numeric but nonexistent id", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse(404, { error: "impianto non trovato" }),
    );

    await expect(getById("999999999")).rejects.toMatchObject({
      status: 404,
      message: "impianto non trovato",
    });
  });

  it("propagates the generic 404 for a malformed (non-numeric) id", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse(404, { error: "endpoint non trovato" }),
    );

    await expect(getById("abc")).rejects.toMatchObject({
      status: 404,
      message: "endpoint non trovato",
    });
  });
});

describe("stations.nearby", () => {
  const originalUrl = process.env.EXPO_PUBLIC_API_URL;
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.EXPO_PUBLIC_API_URL = "http://localhost:8080";
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env.EXPO_PUBLIC_API_URL = originalUrl;
    global.fetch = originalFetch;
  });

  it("requests /api/stations/nearby with lat/lon/limit and normalizes total_available to total (ADR-0001)", async () => {
    const nearbyStation: NearbyStation = {
      ...stationFixture,
      distance_km: 1.234,
    };
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse(200, {
        origin: { lat: 41.9028, lon: 12.4964 },
        data: [nearbyStation],
        pagination: { limit: 20, total_available: 23961 },
      }),
    );

    const result = await nearby({ lat: 41.9028, lon: 12.4964, limit: 20 });

    const [url] = (global.fetch as jest.Mock).mock.calls[0] as [string];
    const parsed = new URL(url);
    expect(parsed.pathname).toBe("/api/stations/nearby");
    expect(parsed.searchParams.get("lat")).toBe("41.9028");
    expect(parsed.searchParams.get("lon")).toBe("12.4964");
    expect(parsed.searchParams.get("limit")).toBe("20");
    expect(result.data).toEqual([nearbyStation]);
    expect(result.pagination).toEqual({ limit: 20, offset: 0, total: 23961 });
  });

  it("propagates the 400 application error for out-of-range lat", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse(400, { error: "lat deve essere compresa tra -90 e 90" }),
    );

    await expect(nearby({ lat: 200, lon: 12.4964 })).rejects.toMatchObject({
      status: 400,
      message: "lat deve essere compresa tra -90 e 90",
    });
  });

  it("returns an empty list with total 0 when no station has coordinates available", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse(200, {
        origin: { lat: 0, lon: 0 },
        data: [],
        pagination: { limit: 20, total_available: 0 },
      }),
    );

    const result = await nearby({ lat: 0, lon: 0 });

    expect(result.data).toEqual([]);
    expect(result.pagination.total).toBe(0);
  });
});
