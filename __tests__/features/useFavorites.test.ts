import { renderHook, waitFor } from "@testing-library/react-native";

import { useFavorites } from "@/features/favorites/useFavorites";
import { getById } from "@/services/motus/stations";
import type { StationSummary } from "@/services/motus/types";
import { useFavoritesStore } from "@/stores/useFavoritesStore";

jest.mock("@/services/motus/stations");

const getByIdMock = getById as jest.MockedFunction<typeof getById>;

function stationSummaryFixture(
  overrides: Partial<StationSummary> = {},
): StationSummary {
  return {
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
    ...overrides,
  };
}

describe("useFavorites", () => {
  beforeEach(() => {
    getByIdMock.mockReset();
    useFavoritesStore.setState({ ids: [] });
  });

  it("is empty when no station has been saved", async () => {
    const { result } = await renderHook(() => useFavorites());

    await waitFor(() => expect(result.current.status).toBe("empty"));
    expect(result.current.favorites).toEqual([]);
    expect(getByIdMock).not.toHaveBeenCalled();
  });

  it("resolves each saved id via GET /api/stations/{id}, never from cached/local data", async () => {
    useFavoritesStore.setState({ ids: [1] });
    getByIdMock.mockResolvedValue({
      station: stationSummaryFixture(),
      prices: [],
    });

    const { result } = await renderHook(() => useFavorites());

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(getByIdMock).toHaveBeenCalledWith("1", expect.anything());
    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.favorites[0].station.nome_impianto).toBe(
      "Impianto Test",
    );
  });

  it("silently drops a saved id whose station now 404s, instead of crashing or showing an error", async () => {
    useFavoritesStore.setState({ ids: [1, 2] });
    getByIdMock.mockImplementation((id) =>
      id === "1"
        ? Promise.resolve({ station: stationSummaryFixture(), prices: [] })
        : Promise.reject(new Error("404")),
    );

    const { result } = await renderHook(() => useFavorites());

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.favorites).toHaveLength(1);
  });

  it("shows an error state when every saved station fails to resolve", async () => {
    useFavoritesStore.setState({ ids: [1] });
    getByIdMock.mockRejectedValue(new Error("network error"));

    const { result } = await renderHook(() => useFavorites());

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.errorMessage).toBeTruthy();
  });
});
