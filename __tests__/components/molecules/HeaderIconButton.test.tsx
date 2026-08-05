import { fireEvent, render } from "@testing-library/react-native";

import { HeaderIconButton } from "@/components/molecules/HeaderIconButton";

describe("HeaderIconButton", () => {
  it("exposes the given accessibility label and a button role", async () => {
    const { getByRole } = await render(
      <HeaderIconButton icon="search" accessibilityLabel="Cerca impianti" />,
    );
    expect(getByRole("button", { name: "Cerca impianti" })).toBeTruthy();
  });

  it("fires onPress", async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(
      <HeaderIconButton
        icon="search"
        accessibilityLabel="Cerca impianti"
        onPress={onPress}
      />,
    );

    await fireEvent.press(getByRole("button", { name: "Cerca impianti" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
