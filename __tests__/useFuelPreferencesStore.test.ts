import { useFuelPreferencesStore } from "@/stores/useFuelPreferencesStore";

describe("useFuelPreferencesStore", () => {
  beforeEach(() => {
    useFuelPreferencesStore.setState({ fuels: [] });
  });

  it("starts with no preference", () => {
    expect(useFuelPreferencesStore.getState().fuels).toEqual([]);
  });

  it("toggle adds a fuel not already selected", () => {
    useFuelPreferencesStore.getState().toggle("Benzina");

    expect(useFuelPreferencesStore.getState().fuels).toEqual(["Benzina"]);
  });

  it("toggle removes a fuel already selected", () => {
    useFuelPreferencesStore.getState().toggle("Benzina");
    useFuelPreferencesStore.getState().toggle("Benzina");

    expect(useFuelPreferencesStore.getState().fuels).toEqual([]);
  });

  it("supports selecting multiple fuels independently", () => {
    useFuelPreferencesStore.getState().toggle("Benzina");
    useFuelPreferencesStore.getState().toggle("Gasolio");
    useFuelPreferencesStore.getState().toggle("Benzina");

    expect(useFuelPreferencesStore.getState().fuels).toEqual(["Gasolio"]);
  });
});
