import { fireEvent, render } from "@testing-library/react-native";

import { ProPredictionsScreen } from "@/features/pro-predictions/ProPredictionsScreen";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("ProPredictionsScreen", () => {
  beforeEach(() => {
    mockPush.mockReset();
  });

  it("shows an explicit unavailable state instead of fabricated predictive data", async () => {
    const { getByText, queryByText } = await render(<ProPredictionsScreen />);

    expect(getByText("Previsioni non ancora disponibili")).toBeTruthy();
    // None of Stitch's example numbers should ever be rendered as if real.
    expect(queryByText(/-\$0\.12/)).toBeNull();
    expect(queryByText("Wait to Fuel Up")).toBeNull();
  });

  it("the CTA navigates to the Map tab", async () => {
    const { getByText } = await render(<ProPredictionsScreen />);

    await fireEvent.press(getByText("Vai alla mappa"));
    expect(mockPush).toHaveBeenCalledWith("/");
  });
});
