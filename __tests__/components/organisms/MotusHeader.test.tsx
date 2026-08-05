import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";

import { MotusHeader } from "@/components/organisms/MotusHeader";

const pushMock = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

describe("MotusHeader", () => {
  beforeEach(() => {
    pushMock.mockReset();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
  });

  it("standard variant: shows back button + title, calls onBack", async () => {
    const onBack = jest.fn();
    const { getByRole, getByLabelText } = await render(
      <MotusHeader title="Dettaglio impianto" onBack={onBack} />,
    );

    expect(getByRole("header", { name: "Dettaglio impianto" })).toBeTruthy();
    await fireEvent.press(getByLabelText("Indietro"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("renders the MOTUS wordmark when logoPosition is left and there is no back action", async () => {
    const { getByText } = await render(<MotusHeader logoPosition="left" />);
    expect(getByText("MOTUS")).toBeTruthy();
  });

  it("search icon navigates to /stations", async () => {
    const { getByLabelText } = await render(
      <MotusHeader logoPosition="left" showSearchIcon />,
    );

    await fireEvent.press(getByLabelText("Cerca impianti"));
    expect(pushMock).toHaveBeenCalledWith("/stations");
  });

  it("search bar variant navigates to /stations and shows the placeholder text", async () => {
    const { getByLabelText, getByText } = await render(
      <MotusHeader showSearchBar />,
    );

    expect(getByText("Cerca impianti…")).toBeTruthy();
    await fireEvent.press(getByLabelText("Cerca impianti di rifornimento"));
    expect(pushMock).toHaveBeenCalledWith("/stations");
  });

  it("always exposes a Profilo button and calls onProfilePress", async () => {
    const onProfilePress = jest.fn();
    const { getByLabelText } = await render(
      <MotusHeader logoPosition="left" onProfilePress={onProfilePress} />,
    );

    await fireEvent.press(getByLabelText("Profilo"));
    expect(onProfilePress).toHaveBeenCalledTimes(1);
  });
});
