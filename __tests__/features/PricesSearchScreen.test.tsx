import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { PricesSearchScreen } from "@/features/prices-search/PricesSearchScreen";
import { search } from "@/services/motus/prices";
import type { PriceRow } from "@/services/motus/types";

jest.mock("@/services/motus/prices");

const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

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

describe("PricesSearchScreen", () => {
  beforeEach(() => {
    searchMock.mockReset();
    mockPush.mockReset();
    mockBack.mockReset();
  });

  it("shows a prompt to enter a filter before any request is made", async () => {
    const { getByText } = await render(<PricesSearchScreen />);

    expect(
      getByText(
        "Inserisci almeno un filtro (carburante, comune o provincia) per iniziare la ricerca.",
      ),
    ).toBeTruthy();
    expect(searchMock).not.toHaveBeenCalled();
  });

  it("searches once a filter is typed and renders the flattened row (no bandiera/indirizzo)", async () => {
    searchMock.mockResolvedValue({
      data: [priceRowFixture()],
      pagination: { limit: 50, offset: 0, total: 1 },
    });

    const { getByLabelText, findByText } = await render(<PricesSearchScreen />);

    await fireEvent.changeText(getByLabelText("Carburante"), "Benzina");

    await waitFor(() =>
      expect(searchMock).toHaveBeenCalledWith(
        { carburante: "Benzina", limit: 50, offset: 0 },
        expect.anything(),
      ),
    );
    expect(await findByText(/Impianto 57660/)).toBeTruthy();
    expect(await findByText(/1\.754 €/)).toBeTruthy();
  });

  it("shows the empty-results message once a filter yields no rows", async () => {
    searchMock.mockResolvedValue({
      data: [],
      pagination: { limit: 50, offset: 0, total: 0 },
    });

    const { getByLabelText, findByText } = await render(<PricesSearchScreen />);

    await fireEvent.changeText(getByLabelText("Comune"), "Nessun Comune Reale");

    expect(
      await findByText("Nessun prezzo trovato per i filtri inseriti."),
    ).toBeTruthy();
  });

  it("shows an error state and retries on demand", async () => {
    searchMock.mockRejectedValueOnce(
      new Error("Richiesta fallita con stato 500."),
    );

    const { getByLabelText, findByText, getByText } = await render(
      <PricesSearchScreen />,
    );

    await fireEvent.changeText(getByLabelText("Provincia"), "RM");
    expect(await findByText("Richiesta fallita con stato 500.")).toBeTruthy();

    searchMock.mockResolvedValueOnce({
      data: [priceRowFixture()],
      pagination: { limit: 50, offset: 0, total: 1 },
    });
    await fireEvent.press(getByText("Riprova"));

    expect(await findByText(/Impianto 57660/)).toBeTruthy();
  });

  it("navigates to S03 with the row's id_impianto", async () => {
    searchMock.mockResolvedValue({
      data: [priceRowFixture({ nome_impianto: "NURE SUD" })],
      pagination: { limit: 50, offset: 0, total: 1 },
    });

    const { getByLabelText, findByText } = await render(<PricesSearchScreen />);
    await fireEvent.changeText(getByLabelText("Carburante"), "Benzina");

    const row = await findByText("NURE SUD");
    await fireEvent.press(row);

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/stations/[id]",
      params: { id: "57660" },
    });
  });
});
