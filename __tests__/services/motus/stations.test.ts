import { search } from "@/services/motus/stations";
import type { Station } from "@/services/motus/types";

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
