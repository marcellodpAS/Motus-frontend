import { fireEvent, render } from "@testing-library/react-native";

import { MapPin } from "@/components/molecules/MapPin";

describe("MapPin", () => {
  it("renders the price label and exposes the given accessibility label", async () => {
    const { getByText, getByRole } = await render(
      <MapPin
        lines={[{ priceLabel: "1.69 €" }]}
        accessibilityLabel="Motus Station, 1.69 €"
      />,
    );

    expect(getByText("1.69 €")).toBeTruthy();
    expect(getByRole("button", { name: "Motus Station, 1.69 €" })).toBeTruthy();
  });

  it("renders one labelled row per preferred fuel", async () => {
    const { getByText } = await render(
      <MapPin
        lines={[
          { fuel: "Benzina", priceLabel: "1.850 €" },
          { fuel: "Gasolio", priceLabel: "1.720 €" },
        ]}
        accessibilityLabel="Motus Station"
      />,
    );

    expect(getByText("Benzina")).toBeTruthy();
    expect(getByText("1.850 €")).toBeTruthy();
    expect(getByText("Gasolio")).toBeTruthy();
    expect(getByText("1.720 €")).toBeTruthy();
  });

  it("renders nothing when there is no price to show", async () => {
    const { toJSON } = await render(
      <MapPin lines={[]} accessibilityLabel="Motus Station" />,
    );

    expect(toJSON()).toBeNull();
  });

  it("reports its selected state to assistive technology", async () => {
    const { getByRole } = await render(
      <MapPin
        lines={[{ priceLabel: "1.69 €" }]}
        accessibilityLabel="Motus Station"
        selected
      />,
    );

    expect(
      getByRole("button", { name: "Motus Station", selected: true }),
    ).toBeTruthy();
  });

  it("fires onPress", async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(
      <MapPin
        lines={[{ priceLabel: "1.69 €" }]}
        accessibilityLabel="Motus Station"
        onPress={onPress}
      />,
    );

    await fireEvent.press(getByRole("button", { name: "Motus Station" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
