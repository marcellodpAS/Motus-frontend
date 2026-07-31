import { render } from "@testing-library/react-native";

import { AppText } from "@/components/atoms/AppText";

describe("AppText", () => {
  it("renders its content and forwards essential text properties", async () => {
    const { getByRole, getByText } = await render(
      <AppText accessibilityRole="header" testID="app-text">
        Accessible text
      </AppText>,
    );

    expect(getByText("Accessible text")).toBeTruthy();
    expect(getByRole("header")).toHaveProp("testID", "app-text");
  });

  it("accepts an optional NativeWind className", async () => {
    await expect(
      render(<AppText className="text-primary">Motus</AppText>),
    ).resolves.toBeTruthy();
  });
});
