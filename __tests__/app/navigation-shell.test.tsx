import { router } from "expo-router";
import { act, fireEvent, renderRouter } from "expo-router/testing-library";

import { search } from "@/services/motus/stations";

// docs/motus/testing-strategy.md §2: no real network call in any automatic
// test, even in a navigation-shell test — mock the service module.
jest.mock("@/services/motus/stations");
const searchMock = search as jest.MockedFunction<typeof search>;

describe("stations navigation shell (first flow: S01 -> S03)", () => {
  beforeEach(() => {
    searchMock.mockReset();
    searchMock.mockResolvedValue({
      data: [],
      pagination: { limit: 50, offset: 0, total: 0 },
    });
  });

  it("navigates from the home button to the S01 entry route", async () => {
    const testInstance = renderRouter("src/app", { initialUrl: "/" });
    const view = await testInstance;

    await fireEvent.press(view.getByText("Cerca impianti"));

    expect(testInstance.getPathname()).toBe("/stations");
    expect(view.getByRole("header", { name: "Impianti" })).toBeTruthy();
  });

  it("renders the S01 entry route at /stations", async () => {
    const testInstance = renderRouter("src/app", { initialUrl: "/stations" });
    const view = await testInstance;

    expect(view.getByRole("header", { name: "Impianti" })).toBeTruthy();
    expect(testInstance.getPathname()).toBe("/stations");
  });

  it("navigates from the list to the detail route with the id_impianto param, then back", async () => {
    const testInstance = renderRouter("src/app", { initialUrl: "/stations" });
    const view = await testInstance;
    expect(view.getByRole("header", { name: "Impianti" })).toBeTruthy();

    await act(async () => {
      router.push("/stations/57660");
    });

    expect(
      view.getByRole("header", { name: "Dettaglio impianto" }),
    ).toBeTruthy();
    expect(testInstance.getSearchParams()).toEqual({ id: "57660" });
    expect(view.getByText("57660")).toBeTruthy();

    await fireEvent.press(view.getByLabelText("Indietro"));

    expect(testInstance.getPathname()).toBe("/stations");
    expect(view.getByRole("header", { name: "Impianti" })).toBeTruthy();
  });
});
