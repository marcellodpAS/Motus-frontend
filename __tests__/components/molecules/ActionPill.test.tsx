import { fireEvent, render } from "@testing-library/react-native";

import { ActionPill } from "@/components/molecules/ActionPill";

describe("ActionPill", () => {
  it("renders the label and fires onPress", async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(
      <ActionPill icon="directions" label="Naviga" onPress={onPress} />,
    );

    const button = getByRole("button", { name: "Naviga" });
    await fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("marks itself disabled and does not fire onPress when pressed", async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(
      <ActionPill
        icon="directions"
        label="Naviga"
        onPress={onPress}
        disabled
      />,
    );

    const button = getByRole("button", { name: "Naviga" });
    expect(button).toHaveProp("accessibilityState", { disabled: true });
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});
