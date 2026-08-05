import { render } from "@testing-library/react-native";

import { ProfileScreen } from "@/features/profile/ProfileScreen";

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe("ProfileScreen", () => {
  it("shows an explicit unavailable state rather than fabricated account data", async () => {
    const { getByText } = await render(<ProfileScreen />);

    expect(getByText("Profilo non disponibile")).toBeTruthy();
    expect(getByText(/Motus non richiede ancora un account/)).toBeTruthy();
  });
});
