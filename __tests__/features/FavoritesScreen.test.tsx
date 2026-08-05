import { fireEvent, render } from "@testing-library/react-native";

import { FavoritesScreen } from "@/features/favorites/FavoritesScreen";
import { getById } from "@/services/motus/stations";
import type { StationSummary } from "@/services/motus/types";
import { useFavoritesStore } from "@/stores/useFavoritesStore";

jest.mock("@/services/motus/stations");

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const getByIdMock = getById as jest.MockedFunction<typeof getById>;

function stationSummaryFixture(
  overrides: Partial<StationSummary> = {},
): StationSummary {
  return {
    id_impianto: 1,
    gestore: "Esempio",
    bandiera: "Agip Eni",
    tipo_impianto: "Stradale",
    nome_impianto: "Impianto Salvato",
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

describe("FavoritesScreen", () => {
  beforeEach(() => {
    getByIdMock.mockReset();
    mockPush.mockReset();
    useFavoritesStore.setState({ ids: [] });
  });

  it("shows an explicit empty state when nothing is saved", async () => {
    const { findByText } = await render(<FavoritesScreen />);

    expect(await findByText(/Nessun impianto salvato/)).toBeTruthy();
  });

  it("renders a saved station and navigates to its detail on press", async () => {
    useFavoritesStore.setState({ ids: [1] });
    getByIdMock.mockResolvedValue({
      station: stationSummaryFixture(),
      prices: [],
    });

    const { findByText } = await render(<FavoritesScreen />);
    const row = await findByText("Impianto Salvato");
    await fireEvent.press(row);

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/stations/[id]",
      params: { id: "1" },
    });
  });
});
