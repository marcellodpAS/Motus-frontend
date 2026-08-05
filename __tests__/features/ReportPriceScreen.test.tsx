import { fireEvent, render } from "@testing-library/react-native";

import { ReportPriceScreen } from "@/features/report-price/ReportPriceScreen";
import { getById } from "@/services/motus/stations";
import type { StationSummary } from "@/services/motus/types";

jest.mock("@/services/motus/stations");

const mockBack = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack, push: jest.fn() }),
}));

const getByIdMock = getById as jest.MockedFunction<typeof getById>;

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

describe("ReportPriceScreen", () => {
  beforeEach(() => {
    getByIdMock.mockReset();
    mockBack.mockReset();
  });

  it("renders the station context once loaded", async () => {
    getByIdMock.mockResolvedValue({
      station: stationSummaryFixture(),
      prices: [],
    });

    const { findByText } = await render(<ReportPriceScreen id="57660" />);

    expect(await findByText("Impianto Test")).toBeTruthy();
    expect(await findByText("VIA ESEMPIO 1")).toBeTruthy();
  });

  it("keeps the submit action disabled until at least one price is entered", async () => {
    getByIdMock.mockResolvedValue({
      station: stationSummaryFixture(),
      prices: [],
    });

    const { getByRole } = await render(<ReportPriceScreen id="57660" />);

    expect(getByRole("button", { name: "Invia segnalazione" })).toHaveProp(
      "accessibilityState",
      { disabled: true, busy: false },
    );
  });

  it("shows an explicit not-available outcome on submit — never a fake success (no write endpoint exists)", async () => {
    getByIdMock.mockResolvedValue({
      station: stationSummaryFixture(),
      prices: [],
    });

    const { getByLabelText, getByText, queryByText } = await render(
      <ReportPriceScreen id="57660" />,
    );

    await fireEvent.changeText(getByLabelText("Benzina"), "1.85");
    await fireEvent.press(getByText("Invia segnalazione"));

    expect(
      await getByText("Invio non disponibile in questa versione"),
    ).toBeTruthy();
    expect(queryByText("Invia segnalazione")).toBeNull();
  });

  it("calls router.back() from the header back action", async () => {
    getByIdMock.mockResolvedValue({
      station: stationSummaryFixture(),
      prices: [],
    });

    const { getByLabelText } = await render(<ReportPriceScreen id="57660" />);
    await fireEvent.press(getByLabelText("Indietro"));

    expect(mockBack).toHaveBeenCalled();
  });
});
