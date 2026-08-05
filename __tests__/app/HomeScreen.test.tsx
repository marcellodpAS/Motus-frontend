import { render } from "@testing-library/react-native";

import HomeRoute from "@/app/index";

describe("HomeRoute", () => {
  it("renders the three navigation entry points (VS6, docs/motus/feature-backlog.md)", async () => {
    const { getByRole, getByText } = await render(<HomeRoute />);

    expect(getByRole("header", { name: "Motus" })).toBeTruthy();
    expect(getByText("Cerca impianti")).toBeTruthy();
    expect(getByText("Cerca prezzi carburante")).toBeTruthy();
    expect(getByText("Impianti vicini a me")).toBeTruthy();
  });
});
