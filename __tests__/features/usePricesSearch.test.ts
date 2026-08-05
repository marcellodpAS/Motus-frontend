import { act, renderHook, waitFor } from "@testing-library/react-native";

import { usePricesSearch } from "@/features/prices-search/usePricesSearch";
import { search } from "@/services/motus/prices";
import type { PriceRow } from "@/services/motus/types";

jest.mock("@/services/motus/prices");

const searchMock = search as jest.MockedFunction<typeof search>;

function priceRowFixture(overrides: Partial<PriceRow> = {}): PriceRow {
  return {
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
    ...overrides,
  };
}

describe("usePricesSearch", () => {
  beforeEach(() => {
    searchMock.mockReset();
  });

  it("stays idle and never calls the service until a filter is set (api-screen-mapping.md §S02)", async () => {
    const { result } = await renderHook(() => usePricesSearch());

    expect(result.current.status).toBe("idle");
    expect(searchMock).not.toHaveBeenCalled();
  });

  it("fetches once a filter is set, with limit=50/offset=0", async () => {
    searchMock.mockResolvedValue({
      data: [priceRowFixture()],
      pagination: { limit: 50, offset: 0, total: 1 },
    });

    const { result } = await renderHook(() => usePricesSearch());

    await act(async () => {
      result.current.setFilters({ carburante: "Benzina" });
    });

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(searchMock).toHaveBeenCalledWith(
      { carburante: "Benzina", limit: 50, offset: 0 },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(result.current.data).toEqual([priceRowFixture()]);
  });

  it("goes back to idle (and stops fetching) when all filters are cleared", async () => {
    searchMock.mockResolvedValue({
      data: [priceRowFixture()],
      pagination: { limit: 50, offset: 0, total: 1 },
    });

    const { result } = await renderHook(() => usePricesSearch());
    await act(async () => {
      result.current.setFilters({ comune: "Roma" });
    });
    await waitFor(() => expect(result.current.status).toBe("success"));

    searchMock.mockClear();
    await act(async () => {
      result.current.setFilters({});
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.data).toEqual([]);
    expect(searchMock).not.toHaveBeenCalled();
  });

  it("stops paginating once offset + data.length >= pagination.total", async () => {
    searchMock.mockResolvedValueOnce({
      data: [priceRowFixture()],
      pagination: { limit: 50, offset: 0, total: 2 },
    });

    const { result } = await renderHook(() =>
      usePricesSearch({ carburante: "Benzina" }),
    );
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.hasMore).toBe(true);

    searchMock.mockResolvedValueOnce({
      data: [priceRowFixture({ id_impianto: 2 })],
      pagination: { limit: 50, offset: 1, total: 2 },
    });

    await act(async () => {
      result.current.loadMore();
    });

    await waitFor(() => expect(result.current.data).toHaveLength(2));
    expect(result.current.hasMore).toBe(false);
  });

  it("surfaces an application error and lets retry replay it", async () => {
    searchMock.mockRejectedValueOnce(
      new Error("Richiesta fallita con stato 500."),
    );

    const { result } = await renderHook(() =>
      usePricesSearch({ comune: "Roma" }),
    );
    await waitFor(() => expect(result.current.status).toBe("error"));

    searchMock.mockResolvedValueOnce({
      data: [priceRowFixture()],
      pagination: { limit: 50, offset: 0, total: 1 },
    });

    await act(async () => {
      result.current.retry();
    });

    await waitFor(() => expect(result.current.status).toBe("success"));
  });
});
