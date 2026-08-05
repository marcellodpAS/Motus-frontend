import { render } from "@testing-library/react-native";

import { Spinner } from "@/components/atoms/Spinner";
import { colors } from "@/theme";

describe("Spinner", () => {
  it("exposes a progressbar role with a default Italian label", async () => {
    const { getByRole } = await render(<Spinner />);

    expect(getByRole("progressbar")).toHaveProp(
      "accessibilityLabel",
      "Caricamento in corso",
    );
  });

  it("accepts a custom accessibilityLabel override", async () => {
    const { getByRole } = await render(
      <Spinner accessibilityLabel="Ricerca in corso" />,
    );

    expect(getByRole("progressbar")).toHaveProp(
      "accessibilityLabel",
      "Ricerca in corso",
    );
  });

  it("resolves the color token to the real value the native indicator needs", async () => {
    const { getByRole, rerender } = await render(<Spinner color="primary" />);
    expect(getByRole("progressbar")).toHaveProp("color", colors.primary);

    await rerender(<Spinner color="onDanger" />);
    expect(getByRole("progressbar")).toHaveProp("color", colors.onDanger);
  });

  it("maps size onto ActivityIndicator's native sm/lg sizes", async () => {
    const { getByRole, rerender } = await render(<Spinner size="sm" />);
    expect(getByRole("progressbar")).toHaveProp("size", "small");

    await rerender(<Spinner size="lg" />);
    expect(getByRole("progressbar")).toHaveProp("size", "large");
  });
});
