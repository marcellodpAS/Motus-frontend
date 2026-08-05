import { fireEvent, render } from "@testing-library/react-native";
import { Text } from "react-native";

import { AppHeader } from "@/components/organisms/AppHeader";

describe("AppHeader", () => {
  it("renders the title as a header and no back action by default", async () => {
    const { getByRole, queryByLabelText } = await render(
      <AppHeader title="Impianti" />,
    );

    expect(getByRole("header", { name: "Impianti" })).toBeTruthy();
    expect(queryByLabelText("Indietro")).toBeNull();
  });

  it("renders and fires the back action when onBack is given", async () => {
    const onBack = jest.fn();
    const { getByLabelText } = await render(
      <AppHeader title="Dettaglio impianto" onBack={onBack} />,
    );

    await fireEvent.press(getByLabelText("Indietro"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("renders an arbitrary trailing slot", async () => {
    const { getByText } = await render(
      <AppHeader title="Impianti" right={<Text>Filtra</Text>} />,
    );

    expect(getByText("Filtra")).toBeTruthy();
  });
});
