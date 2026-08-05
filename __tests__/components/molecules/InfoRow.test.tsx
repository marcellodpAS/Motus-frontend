import { render } from "@testing-library/react-native";

import { InfoRow } from "@/components/molecules/InfoRow";

describe("InfoRow", () => {
  it("renders the label and value", async () => {
    const { getByText } = await render(
      <InfoRow label="Bandiera" value="Eni" />,
    );

    expect(getByText("Bandiera")).toBeTruthy();
    expect(getByText("Eni")).toBeTruthy();
  });
});
