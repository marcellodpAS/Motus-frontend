import { fireEvent, render } from "@testing-library/react-native";
import { Text } from "react-native";

import { ListItem } from "@/components/molecules/ListItem";

describe("ListItem", () => {
  it("renders title and subtitle", async () => {
    const { getByText } = await render(
      <ListItem title="Impianto Nord" subtitle="Milano (MI)" />,
    );

    expect(getByText("Impianto Nord")).toBeTruthy();
    expect(getByText("Milano (MI)")).toBeTruthy();
  });

  it("fires onPress when pressable and exposes the button role", async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(
      <ListItem title="Impianto Nord" onPress={onPress} />,
    );

    await fireEvent.press(getByRole("button"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("renders as a plain, non-interactive row without onPress", async () => {
    const { queryByRole } = await render(<ListItem title="Impianto Nord" />);

    expect(queryByRole("button")).toBeNull();
  });

  it("renders an arbitrary trailing slot", async () => {
    const { getByText } = await render(
      <ListItem title="Impianto Nord" trailing={<Text>1,829 €</Text>} />,
    );

    expect(getByText("1,829 €")).toBeTruthy();
  });
});
