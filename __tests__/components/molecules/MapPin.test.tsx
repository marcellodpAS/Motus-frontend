import { fireEvent, render } from "@testing-library/react-native";

import { MapPin } from "@/components/molecules/MapPin";

describe("MapPin", () => {
  it("renders the price label and exposes the given accessibility label", async () => {
    const { getByText, getByRole } = await render(
      <MapPin priceLabel="1.69 €" accessibilityLabel="Motus Station, 1.69 €" />,
    );

    expect(getByText("1.69 €")).toBeTruthy();
    expect(getByRole("button", { name: "Motus Station, 1.69 €" })).toBeTruthy();
  });

  it("fires onPress", async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(
      <MapPin
        priceLabel="1.69 €"
        accessibilityLabel="Motus Station"
        onPress={onPress}
      />,
    );

    await fireEvent.press(getByRole("button", { name: "Motus Station" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
