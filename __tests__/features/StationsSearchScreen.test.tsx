import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { StationsSearchScreen } from "@/features/stations-search/StationsSearchScreen";
import { search } from "@/services/motus/stations";
import type { Station } from "@/services/motus/types";

jest.mock("@/services/motus/stations");

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn() }),
}));

const searchMock = search as jest.MockedFunction<typeof search>;

// Fixtures derived from real observations (docs/motus/api-contract.md,
// docs/motus/testing-strategy.md §3): empty nome_impianto, prices: [].
const stationWithPrice: Station = {
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
  prices: [
    {
      id_impianto: 57660,
      carburante: "Benzina",
      prezzo: 1.754,
      self_service: 1,
      data_comunicazione: "04/08/2026 06:30:00",
      updated_at: "2026-08-04T06:30:00.377849+00:00",
    },
  ],
};

const stationNoPrices: Station = {
  ...stationWithPrice,
  id_impianto: 3498,
  nome_impianto: "NURE SUD",
  prices: [],
};

describe("StationsSearchScreen", () => {
  beforeEach(() => {
    searchMock.mockReset();
    mockPush.mockReset();
  });

  it("renders the header and search field immediately", async () => {
    searchMock.mockResolvedValue({
      data: [],
      pagination: { limit: 50, offset: 0, total: 0 },
    });

    const { getByRole, getByLabelText } = await render(
      <StationsSearchScreen />,
    );

    expect(getByRole("header", { name: "Impianti" })).toBeTruthy();
    expect(getByLabelText("Cerca")).toBeTruthy();
  });

  it("shows the empty state for a 200 response with data: []", async () => {
    searchMock.mockResolvedValue({
      data: [],
      pagination: { limit: 50, offset: 0, total: 0 },
    });

    const { findByText } = await render(<StationsSearchScreen />);

    expect(await findByText("Nessun impianto da mostrare.")).toBeTruthy();
  });

  it("renders populated results, handling empty nome_impianto and empty prices", async () => {
    searchMock.mockResolvedValue({
      data: [stationWithPrice, stationNoPrices],
      pagination: { limit: 50, offset: 0, total: 2 },
    });

    const { findByText } = await render(<StationsSearchScreen />);

    // nome_impianto: "" falls back to bandiera.
    expect(await findByText("Agip Eni")).toBeTruthy();
    expect(await findByText("1.754 €")).toBeTruthy();
    // prices: [] renders the row without a price, no crash.
    expect(await findByText("NURE SUD")).toBeTruthy();
  });

  it("shows an error state for a server error and retries the same request on demand", async () => {
    searchMock.mockRejectedValueOnce(
      new Error("Richiesta fallita con stato 500."),
    );

    const { findByText, getByText } = await render(<StationsSearchScreen />);

    expect(await findByText("Richiesta fallita con stato 500.")).toBeTruthy();

    searchMock.mockResolvedValueOnce({
      data: [stationWithPrice],
      pagination: { limit: 50, offset: 0, total: 1 },
    });

    await fireEvent.press(getByText("Riprova"));

    expect(await findByText("Agip Eni")).toBeTruthy();
  });

  it("shows an error state for a 400 application error (non-integer limit/offset)", async () => {
    searchMock.mockRejectedValue(
      Object.assign(new Error("limit e offset devono essere numeri interi"), {
        status: 400,
      }),
    );

    const { findByText } = await render(<StationsSearchScreen />);

    expect(
      await findByText("limit e offset devono essere numeri interi"),
    ).toBeTruthy();
  });

  it("tracks typed search text and re-queries with q", async () => {
    searchMock.mockResolvedValue({
      data: [],
      pagination: { limit: 50, offset: 0, total: 0 },
    });

    const { getByLabelText } = await render(<StationsSearchScreen />);

    const field = getByLabelText("Cerca");
    await fireEvent.changeText(field, "Milano");
    expect(field).toHaveProp("value", "Milano");

    await waitFor(() =>
      expect(searchMock).toHaveBeenLastCalledWith(
        { q: "Milano", limit: 50, offset: 0 },
        expect.anything(),
      ),
    );
  });

  it("navigates to S03 with the selected id_impianto", async () => {
    searchMock.mockResolvedValue({
      data: [stationWithPrice],
      pagination: { limit: 50, offset: 0, total: 1 },
    });

    const { findByText } = await render(<StationsSearchScreen />);
    const row = await findByText("Agip Eni");

    await fireEvent.press(row);

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/stations/[id]",
      params: { id: "57660" },
    });
  });
});
