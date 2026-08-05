import { render } from "@testing-library/react-native";
import { Text } from "react-native";

import { CompactCard } from "@/components/molecules/CompactCard";

describe("CompactCard", () => {
  it("renders arbitrary children", async () => {
    const { getByText } = await render(
      <CompactCard>
        <Text>Contenuto</Text>
      </CompactCard>,
    );

    expect(getByText("Contenuto")).toBeTruthy();
  });
});
