import { fireEvent, render } from "@testing-library/react-native";

import { Button } from "@/components/atoms/Button";

describe("Button", () => {
  it("renders its label and fires onPress", async () => {
    const onPress = jest.fn();
    const { getByRole, getByText } = await render(
      <Button onPress={onPress}>Cerca</Button>,
    );

    expect(getByText("Cerca")).toBeTruthy();
    await fireEvent.press(getByRole("button"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not fire onPress and reports the disabled state when disabled", async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(
      <Button onPress={onPress} disabled>
        Cerca
      </Button>,
    );

    const button = getByRole("button");
    expect(button).toHaveProp("accessibilityState", {
      disabled: true,
      busy: false,
    });
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it("shows a loading Spinner, blocks onPress and reports busy while loading", async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(
      <Button onPress={onPress} loading>
        Cerca
      </Button>,
    );

    const button = getByRole("button");
    expect(getByRole("progressbar")).toBeTruthy();
    expect(button).toHaveProp("accessibilityState", {
      disabled: true,
      busy: true,
    });
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it("forwards native Pressable props such as testID and pressIn/pressOut callbacks", async () => {
    const onPressIn = jest.fn();
    const onPressOut = jest.fn();
    const { getByTestId } = await render(
      <Button
        testID="search-button"
        onPress={() => {}}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        Cerca
      </Button>,
    );

    const button = getByTestId("search-button");
    await fireEvent(button, "pressIn");
    await fireEvent(button, "pressOut");
    expect(onPressIn).toHaveBeenCalledTimes(1);
    expect(onPressOut).toHaveBeenCalledTimes(1);
  });

  it("renders both explicit variants without crashing", async () => {
    await expect(
      render(<Button variant="danger">Elimina</Button>),
    ).resolves.toBeTruthy();
    await expect(
      render(<Button variant="primary">Conferma</Button>),
    ).resolves.toBeTruthy();
  });
});
