import { fireEvent, render } from "@testing-library/react-native";

import { SearchControl } from "@/components/molecules/SearchControl";

describe("SearchControl", () => {
  it("renders the default placeholder/accessibility label and forwards typed text", async () => {
    const onChangeText = jest.fn();
    const { getByLabelText } = await render(
      <SearchControl value="" onChangeText={onChangeText} />,
    );

    const field = getByLabelText("Cerca");
    await fireEvent.changeText(field, "Milano");
    expect(onChangeText).toHaveBeenCalledWith("Milano");
  });

  it("accepts a custom placeholder and accessibility label", async () => {
    const { getByLabelText, getByPlaceholderText } = await render(
      <SearchControl
        value=""
        onChangeText={jest.fn()}
        placeholder="Cerca per comune"
        accessibilityLabel="Cerca impianti"
      />,
    );

    expect(getByPlaceholderText("Cerca per comune")).toBeTruthy();
    expect(getByLabelText("Cerca impianti")).toBeTruthy();
  });
});
