import { fireEvent, render } from "@testing-library/react-native";

import { StationCallout } from "@/components/molecules/StationCallout";

describe("StationCallout", () => {
  it("renders the station name, distance and price", async () => {
    const { getByText } = await render(
      <StationCallout
        title="Impianto Test"
        distanceKm={1.234}
        priceLabel="1.699 €"
        onOpenDetails={jest.fn()}
        onClose={jest.fn()}
      />,
    );

    expect(getByText("Impianto Test")).toBeTruthy();
    expect(getByText("1.2 km")).toBeTruthy();
    expect(getByText("1.699 €")).toBeTruthy();
  });

  it("calls onOpenDetails from the 'Apri' action, not automatically", async () => {
    const onOpenDetails = jest.fn();
    const { getByLabelText } = await render(
      <StationCallout
        title="Impianto Test"
        distanceKm={1.2}
        onOpenDetails={onOpenDetails}
        onClose={jest.fn()}
      />,
    );

    expect(onOpenDetails).not.toHaveBeenCalled();
    await fireEvent.press(getByLabelText("Apri scheda di Impianto Test"));
    expect(onOpenDetails).toHaveBeenCalledTimes(1);
  });

  it("calls onClose from the close action", async () => {
    const onClose = jest.fn();
    const { getByLabelText } = await render(
      <StationCallout
        title="Impianto Test"
        distanceKm={1.2}
        onOpenDetails={jest.fn()}
        onClose={onClose}
      />,
    );

    await fireEvent.press(getByLabelText("Chiudi"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
