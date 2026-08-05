import { render } from "@testing-library/react-native";

import { StationDetailScreen } from "@/features/station-detail/StationDetailScreen";

describe("StationDetailScreen", () => {
  it("renders the S03 shell showing the real id param (no fabricated station data)", async () => {
    const { getByRole, getByLabelText, getByText } = await render(
      <StationDetailScreen id="57660" />,
    );

    expect(getByRole("header", { name: "Dettaglio impianto" })).toBeTruthy();
    expect(getByLabelText("Indietro")).toBeTruthy();
    expect(getByText("ID impianto")).toBeTruthy();
    expect(getByText("57660")).toBeTruthy();
  });
});
