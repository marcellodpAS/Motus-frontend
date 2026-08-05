import { search } from "@/services/motus/prices";
import type { PriceRow } from "@/services/motus/types";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

// Fixture derived from api-contract.md §GET /api/prices: flattened row,
// missing indirizzo/gestore/bandiera/tipo_impianto on purpose (ADR-0001).
const priceRowFixture: PriceRow = {
  id_impianto: 57660,
  carburante: "Benzina",
  prezzo: 1.754,
  self_service: 1,
  data_comunicazione: "31/07/2026 10:28:04",
  updated_at: "2026-08-04T06:30:00.377849+00:00",
  nome_impianto: "",
  comune: "Roma",
  provincia: "RM",
  via_geocoded: null,
  latitudine_completa: 41.9028,
  longitudine_completa: 12.4964,
};

describe("prices.search", () => {
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

  it("requests /api/prices with the given filters as query params", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse(200, {
        data: [priceRowFixture],
        pagination: { limit: 50, offset: 0, total: 1 },
      }),
    );

    const result = await search({
      carburante: "Benzina",
      provincia: "RM",
      comune: "Roma",
      limit: 50,
      offset: 0,
    });

    const [url] = (global.fetch as jest.Mock).mock.calls[0] as [string];
    const parsed = new URL(url);
    expect(parsed.pathname).toBe("/api/prices");
    expect(parsed.searchParams.get("carburante")).toBe("Benzina");
    expect(parsed.searchParams.get("provincia")).toBe("RM");
    expect(parsed.searchParams.get("comune")).toBe("Roma");
    expect(result.data).toEqual([priceRowFixture]);
  });

  it("returns an empty list without error when no results match", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse(200, {
        data: [],
        pagination: { limit: 50, offset: 0, total: 0 },
      }),
    );

    const result = await search({ carburante: "Nessun Carburante Reale" });

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
