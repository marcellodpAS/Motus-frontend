import { fireEvent, render } from "@testing-library/react-native";

import { TextInput } from "@/components/atoms/TextInput";

describe("TextInput", () => {
  it("renders the label and forwards typed text via onChangeText", async () => {
    const onChangeText = jest.fn();
    const { getByText, getByLabelText } = await render(
      <TextInput label="Comune" onChangeText={onChangeText} />,
    );

    expect(getByText("Comune")).toBeTruthy();
    await fireEvent.changeText(getByLabelText("Comune"), "Milano");
    expect(onChangeText).toHaveBeenCalledWith("Milano");
  });

  it("shows the error message and folds it into the accessible name", async () => {
    const { getByText, getByLabelText } = await render(
      <TextInput label="Comune" error="Campo obbligatorio" />,
    );

    expect(getByText("Campo obbligatorio")).toBeTruthy();
    expect(getByLabelText("Comune. Campo obbligatorio")).toBeTruthy();
  });

  it("respects an explicit accessibilityLabel override", async () => {
    const { getByLabelText } = await render(
      <TextInput label="Comune" accessibilityLabel="Cerca per comune" />,
    );

    expect(getByLabelText("Cerca per comune")).toBeTruthy();
  });

  it("marks the field non-editable and disabled when disabled", async () => {
    const { getByLabelText } = await render(
      <TextInput label="Comune" disabled />,
    );

    const field = getByLabelText("Comune");
    expect(field).toHaveProp("editable", false);
    expect(field).toHaveProp("accessibilityState", { disabled: true });
  });

  it("tracks focus/blur while still forwarding the caller's own handlers", async () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const { getByLabelText } = await render(
      <TextInput label="Comune" onFocus={onFocus} onBlur={onBlur} />,
    );

    const field = getByLabelText("Comune");
    await fireEvent(field, "focus");
    expect(onFocus).toHaveBeenCalledTimes(1);
    await fireEvent(field, "blur");
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});
