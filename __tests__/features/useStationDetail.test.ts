import { act, renderHook, waitFor } from "@testing-library/react-native";

import { useStationDetail } from "@/features/station-detail/useStationDetail";
import { ApiHttpError } from "@/services/motus/errors";
import { getById } from "@/services/motus/stations";
import type { StationSummary } from "@/services/motus/types";

jest.mock("@/services/motus/stations");

const getByIdMock = getById as jest.MockedFunction<typeof getById>;

function stationSummaryFixture(): StationSummary {
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
  };
}

describe("useStationDetail", () => {
  beforeEach(() => {
    getByIdMock.mockReset();
  });

  it("fetches by id on mount and surfaces the populated result", async () => {
    getByIdMock.mockResolvedValue({
      station: stationSummaryFixture(),
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
    });

    const { result } = await renderHook(() => useStationDetail("57660"));

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(getByIdMock).toHaveBeenCalledWith(
      "57660",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(result.current.station).toEqual(stationSummaryFixture());
    expect(result.current.prices).toHaveLength(1);
  });

  it("surfaces prices: [] as success with an empty prices array (observed live, impianto 3498)", async () => {
    getByIdMock.mockResolvedValue({
      station: {
        ...stationSummaryFixture(),
        id_impianto: 3498,
        nome_impianto: "NURE SUD",
      },
      prices: [],
    });

    const { result } = await renderHook(() => useStationDetail("3498"));

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.prices).toEqual([]);
  });

  it("maps a 404 with the specific message to a not-found status, distinct from a generic error", async () => {
    getByIdMock.mockRejectedValue(
      new ApiHttpError(404, "impianto non trovato"),
    );

    const { result } = await renderHook(() => useStationDetail("999999999"));

    await waitFor(() => expect(result.current.status).toBe("not-found"));
    expect(result.current.errorMessage).toBe("impianto non trovato");
  });

  it("maps the generic 404 for a malformed id to not-found too (client cannot discriminate)", async () => {
    getByIdMock.mockRejectedValue(
      new ApiHttpError(404, "endpoint non trovato"),
    );

    const { result } = await renderHook(() => useStationDetail("abc"));

    await waitFor(() => expect(result.current.status).toBe("not-found"));
    expect(result.current.errorMessage).toBe("endpoint non trovato");
  });

  it("surfaces a 500/network error as error and lets retry replay the request", async () => {
    getByIdMock.mockRejectedValueOnce(
      new Error("Richiesta fallita con stato 500."),
    );

    const { result } = await renderHook(() => useStationDetail("57660"));

    await waitFor(() => expect(result.current.status).toBe("error"));

    getByIdMock.mockResolvedValueOnce({
      station: stationSummaryFixture(),
      prices: [],
    });

    await act(async () => {
      result.current.retry();
    });

    await waitFor(() => expect(result.current.status).toBe("success"));
  });
});
