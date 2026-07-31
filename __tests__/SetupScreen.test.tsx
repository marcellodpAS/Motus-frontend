import { render } from "@testing-library/react-native";

import SetupScreen from "@/app/index";

describe("SetupScreen", () => {
  it("shows the technical setup confirmation", async () => {
    const { getByRole, getByText } = await render(<SetupScreen />);

    expect(getByRole("header", { name: "Motus" })).toBeTruthy();
    expect(getByText("Setup completato")).toBeTruthy();
  });
});
