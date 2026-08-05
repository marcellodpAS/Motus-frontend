import { render } from "@testing-library/react-native";

import { InfoPanel } from "@/components/organisms/InfoPanel";

describe("InfoPanel", () => {
  it("renders an optional title and every row's label/value", async () => {
    const { getByText } = await render(
      <InfoPanel
        title="Dati impianto"
        rows={[
          { label: "Bandiera", value: "Eni" },
          { label: "Comune", value: "Milano" },
        ]}
      />,
    );

    expect(getByText("Dati impianto")).toBeTruthy();
    expect(getByText("Bandiera")).toBeTruthy();
    expect(getByText("Eni")).toBeTruthy();
    expect(getByText("Comune")).toBeTruthy();
    expect(getByText("Milano")).toBeTruthy();
  });

  it("renders with no title", async () => {
    const { queryByText, getByText } = await render(
      <InfoPanel rows={[{ label: "Bandiera", value: "Eni" }]} />,
    );

    expect(queryByText("Dati impianto")).toBeNull();
    expect(getByText("Bandiera")).toBeTruthy();
  });
});
