import { render } from "@testing-library/react-native";

import { LoadingPanel } from "@/components/organisms/LoadingPanel";

describe("LoadingPanel", () => {
  it("renders a progressbar and the default message", async () => {
    const { getByRole, getByText } = await render(<LoadingPanel />);

    expect(getByRole("progressbar")).toBeTruthy();
    expect(getByText("Caricamento in corso")).toBeTruthy();
  });

  it("accepts a custom message", async () => {
    const { getByText } = await render(
      <LoadingPanel message="Ricerca impianti in corso" />,
    );

    expect(getByText("Ricerca impianti in corso")).toBeTruthy();
  });
});
