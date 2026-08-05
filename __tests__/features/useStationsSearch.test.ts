import { act, renderHook, waitFor } from "@testing-library/react-native";

import { useStationsSearch } from "@/features/stations-search/useStationsSearch";
import { search } from "@/services/motus/stations";
import type { Station } from "@/services/motus/types";

jest.mock("@/services/motus/stations");

const searchMock = search as jest.MockedFunction<typeof search>;

// Fixtures derived from real observations in docs/motus/api-contract.md
// (docs/motus/testing-strategy.md §3): empty nome_impianto, prices: [].
function stationFixture(id: number): Station {
  return {
    id_impianto: id,
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
  };
}

describe("useStationsSearch", () => {
  beforeEach(() => {
    searchMock.mockReset();
  });

  it("fetches with no filters and limit=50/offset=0 on mount (S01 initial opening)", async () => {
    searchMock.mockResolvedValue({
      data: [stationFixture(1)],
      pagination: { limit: 50, offset: 0, total: 1 },
    });

    const { result } = await renderHook(() => useStationsSearch());

    await waitFor(() => expect(result.current.status).toBe("success"));

    expect(searchMock).toHaveBeenCalledWith(
      { limit: 50, offset: 0 },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(result.current.data).toEqual([stationFixture(1)]);
  });

  it("re-fetches with the expected params for each filter combination", async () => {
    searchMock.mockResolvedValue({
      data: [],
      pagination: { limit: 50, offset: 0, total: 0 },
    });

    const { result } = await renderHook(() => useStationsSearch());
    await waitFor(() => expect(result.current.status).toBe("success"));

    await act(async () => {
      result.current.setFilters({ comune: "Milano" });
    });
    await waitFor(() =>
      expect(searchMock).toHaveBeenLastCalledWith(
        { comune: "Milano", limit: 50, offset: 0 },
        expect.anything(),
      ),
    );

    await act(async () => {
      result.current.setFilters({ comune: "Milano", provincia: "MI" });
    });
    await waitFor(() =>
      expect(searchMock).toHaveBeenLastCalledWith(
        { comune: "Milano", provincia: "MI", limit: 50, offset: 0 },
        expect.anything(),
      ),
    );

    await act(async () => {
      result.current.setFilters({ q: "Eni" });
    });
    await waitFor(() =>
      expect(searchMock).toHaveBeenLastCalledWith(
        { q: "Eni", limit: 50, offset: 0 },
        expect.anything(),
      ),
    );
  });

  it("stops paginating once offset + data.length >= pagination.total", async () => {
    searchMock.mockResolvedValueOnce({
      data: [stationFixture(1), stationFixture(2)],
      pagination: { limit: 50, offset: 0, total: 3 },
    });

    const { result } = await renderHook(() => useStationsSearch());
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.hasMore).toBe(true);

    searchMock.mockResolvedValueOnce({
      data: [stationFixture(3)],
      pagination: { limit: 50, offset: 2, total: 3 },
    });

    await act(async () => {
      result.current.loadMore();
    });

    await waitFor(() => expect(result.current.data).toHaveLength(3));
    expect(searchMock).toHaveBeenLastCalledWith(
      { limit: 50, offset: 2 },
      expect.anything(),
    );
    expect(result.current.hasMore).toBe(false);

    searchMock.mockClear();
    await act(async () => {
      result.current.loadMore();
    });
    expect(searchMock).not.toHaveBeenCalled();
  });

  it("surfaces the empty result as success with no data (200, data: [])", async () => {
    searchMock.mockResolvedValue({
      data: [],
      pagination: { limit: 50, offset: 0, total: 0 },
    });

    const { result } = await renderHook(() =>
      useStationsSearch({ comune: "Nessun Comune Reale" }),
    );

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.data).toEqual([]);
  });

  it("surfaces an application error message and lets retry replay the same request", async () => {
    searchMock.mockRejectedValueOnce(
      new Error("limit e offset devono essere numeri interi"),
    );

    const { result } = await renderHook(() => useStationsSearch());
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.errorMessage).toBe(
      "limit e offset devono essere numeri interi",
    );

    searchMock.mockResolvedValueOnce({
      data: [stationFixture(1)],
      pagination: { limit: 50, offset: 0, total: 1 },
    });

    await act(async () => {
      result.current.retry();
    });

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.data).toEqual([stationFixture(1)]);
  });
});
