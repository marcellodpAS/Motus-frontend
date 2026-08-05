import { fireEvent, render } from "@testing-library/react-native";

import { StationsSearchScreen } from "@/features/stations-search/StationsSearchScreen";

describe("StationsSearchScreen", () => {
  it("renders the S01 shell: header, search control and the empty state (no feature hook wired yet)", async () => {
    const { getByRole, getByLabelText, getByText } = await render(
      <StationsSearchScreen />,
    );

    expect(getByRole("header", { name: "Impianti" })).toBeTruthy();
    expect(getByLabelText("Cerca")).toBeTruthy();
    expect(getByText("Nessun impianto da mostrare.")).toBeTruthy();
  });

  it("tracks typed search text as local state", async () => {
    const { getByLabelText } = await render(<StationsSearchScreen />);

    const field = getByLabelText("Cerca");
    await fireEvent.changeText(field, "Milano");
    expect(field).toHaveProp("value", "Milano");
  });
});
