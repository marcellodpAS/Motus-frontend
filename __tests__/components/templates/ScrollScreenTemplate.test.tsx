import { render } from "@testing-library/react-native";
import { Text } from "react-native";

import { ScrollScreenTemplate } from "@/components/templates/ScrollScreenTemplate";

describe("ScrollScreenTemplate", () => {
  it("renders the header and scrollable children", async () => {
    const { getByRole, getByText } = await render(
      <ScrollScreenTemplate title="Dettaglio impianto">
        <Text>Contenuto lungo</Text>
      </ScrollScreenTemplate>,
    );

    expect(getByRole("header", { name: "Dettaglio impianto" })).toBeTruthy();
    expect(getByText("Contenuto lungo")).toBeTruthy();
  });
});
