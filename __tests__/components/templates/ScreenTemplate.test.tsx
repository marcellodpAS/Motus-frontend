import { render } from "@testing-library/react-native";
import { Text } from "react-native";

import { ScreenTemplate } from "@/components/templates/ScreenTemplate";

describe("ScreenTemplate", () => {
  it("renders the header and children", async () => {
    const { getByRole, getByText } = await render(
      <ScreenTemplate title="Impianti">
        <Text>Contenuto</Text>
      </ScreenTemplate>,
    );

    expect(getByRole("header", { name: "Impianti" })).toBeTruthy();
    expect(getByText("Contenuto")).toBeTruthy();
  });

  it("wires onBack through to the header", async () => {
    const { getByLabelText } = await render(
      <ScreenTemplate title="Dettaglio" onBack={() => {}}>
        <Text>Contenuto</Text>
      </ScreenTemplate>,
    );

    expect(getByLabelText("Indietro")).toBeTruthy();
  });
});
