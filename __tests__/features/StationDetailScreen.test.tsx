import { fireEvent, render } from "@testing-library/react-native";

import { StationDetailScreen } from "@/features/station-detail/StationDetailScreen";
import { ApiHttpError } from "@/services/motus/errors";
import { getById } from "@/services/motus/stations";
import type { StationSummary } from "@/services/motus/types";

jest.mock("@/services/motus/stations");

const mockBack = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack }),
}));

const getByIdMock = getById as jest.MockedFunction<typeof getById>;

function stationSummaryFixture(
  overrides: Partial<StationSummary> = {},
): StationSummary {
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
    ...overrides,
  };
}

describe("StationDetailScreen", () => {
  beforeEach(() => {
    getByIdMock.mockReset();
    mockBack.mockReset();
  });

  it("renders the header and back action immediately", async () => {
    getByIdMock.mockResolvedValue({
      station: stationSummaryFixture(),
      prices: [],
    });

    const { getByRole, getByLabelText } = await render(
      <StationDetailScreen id="57660" />,
    );

    expect(getByRole("header", { name: "Dettaglio impianto" })).toBeTruthy();
    expect(getByLabelText("Indietro")).toBeTruthy();
  });

  it("renders the populated station with its prices", async () => {
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

    const { findByText } = await render(<StationDetailScreen id="57660" />);

    expect(await findByText("Impianto Test")).toBeTruthy();
    expect(await findByText("Roma (RM)")).toBeTruthy();
    expect(await findByText(/1\.754 €/)).toBeTruthy();
  });

  it("falls back to bandiera for the empty nome_impianto (observed live, impianto 57660)", async () => {
    getByIdMock.mockResolvedValue({
      station: stationSummaryFixture({ nome_impianto: "" }),
      prices: [],
    });

    const { findAllByText } = await render(<StationDetailScreen id="57660" />);

    // "Agip Eni" now appears twice: once as the Nome fallback, once as Bandiera.
    expect(await findAllByText("Agip Eni")).toHaveLength(2);
  });

  it("shows an explicit message (not a crash or silent blank) when prices: []", async () => {
    getByIdMock.mockResolvedValue({
      station: stationSummaryFixture({
        id_impianto: 3498,
        nome_impianto: "NURE SUD",
      }),
      prices: [],
    });

    const { findByText } = await render(<StationDetailScreen id="3498" />);

    expect(
      await findByText("Nessun prezzo comunicato per questo impianto."),
    ).toBeTruthy();
  });

  it("shows an explicit fallback for missing geocoded coordinates instead of a blank/crash", async () => {
    getByIdMock.mockResolvedValue({
      station: stationSummaryFixture({
        id_impianto: 60502,
        latitudine_completa: null,
        longitudine_completa: null,
        geocoding_status: "source_only",
      }),
      prices: [],
    });

    const { findByText } = await render(<StationDetailScreen id="60502" />);

    expect(await findByText("Non disponibili")).toBeTruthy();
  });

  it("shows the specific not-found message for a numeric but nonexistent id, with no retry action", async () => {
    getByIdMock.mockRejectedValue(
      new ApiHttpError(404, "impianto non trovato"),
    );

    const { findByText, queryByText } = await render(
      <StationDetailScreen id="999999999" />,
    );

    expect(await findByText("impianto non trovato")).toBeTruthy();
    expect(queryByText("Riprova")).toBeNull();
  });

  it("shows the generic not-found message for a malformed (non-numeric) id, same as a nonexistent one", async () => {
    getByIdMock.mockRejectedValue(
      new ApiHttpError(404, "endpoint non trovato"),
    );

    const { findByText, queryByText } = await render(
      <StationDetailScreen id="abc" />,
    );

    expect(await findByText("endpoint non trovato")).toBeTruthy();
    expect(queryByText("Riprova")).toBeNull();
  });

  it("shows an error state with retry for a server error, and retry re-fetches", async () => {
    getByIdMock.mockRejectedValueOnce(
      new Error("Richiesta fallita con stato 500."),
    );

    const { findByText, getByText } = await render(
      <StationDetailScreen id="57660" />,
    );

    expect(await findByText("Richiesta fallita con stato 500.")).toBeTruthy();

    getByIdMock.mockResolvedValueOnce({
      station: stationSummaryFixture(),
      prices: [],
    });
    await fireEvent.press(getByText("Riprova"));

    expect(await findByText("Impianto Test")).toBeTruthy();
  });

  it("calls router.back() from the header back action", async () => {
    getByIdMock.mockResolvedValue({
      station: stationSummaryFixture(),
      prices: [],
    });

    const { getByLabelText } = await render(<StationDetailScreen id="57660" />);
    await fireEvent.press(getByLabelText("Indietro"));

    expect(mockBack).toHaveBeenCalled();
  });
});
