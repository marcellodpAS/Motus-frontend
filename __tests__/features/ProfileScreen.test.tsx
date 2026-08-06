import { fireEvent, render } from "@testing-library/react-native";

import { ProfileScreen } from "@/features/profile/ProfileScreen";
import { useFuelPreferencesStore } from "@/stores/useFuelPreferencesStore";

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe("ProfileScreen", () => {
  beforeEach(() => {
    useFuelPreferencesStore.setState({ fuels: [] });
  });

  it("shows an explicit unavailable state rather than fabricated account data", async () => {
    const { getByText } = await render(<ProfileScreen />);

    expect(getByText("Profilo non disponibile")).toBeTruthy();
    expect(getByText(/Motus non richiede ancora un account/)).toBeTruthy();
  });

  it("lets the user select a preferred fuel, persisted in the local store", async () => {
    const { getByRole } = await render(<ProfileScreen />);

    const chip = getByRole("checkbox", { name: "Benzina" });
    expect(chip).toHaveProp("accessibilityState", { checked: false });

    await fireEvent.press(chip);

    expect(useFuelPreferencesStore.getState().fuels).toEqual(["Benzina"]);
  });

  it("supports selecting more than one fuel", async () => {
    const { getByRole } = await render(<ProfileScreen />);

    await fireEvent.press(getByRole("checkbox", { name: "Benzina" }));
    await fireEvent.press(getByRole("checkbox", { name: "Gasolio" }));

    expect(useFuelPreferencesStore.getState().fuels).toEqual([
      "Benzina",
      "Gasolio",
    ]);
  });

  it("deselecting a fuel removes it from the preference", async () => {
    useFuelPreferencesStore.setState({ fuels: ["Benzina"] });
    const { getByRole } = await render(<ProfileScreen />);

    const chip = getByRole("checkbox", { name: "Benzina" });
    expect(chip).toHaveProp("accessibilityState", { checked: true });

    await fireEvent.press(chip);

    expect(useFuelPreferencesStore.getState().fuels).toEqual([]);
  });
});
