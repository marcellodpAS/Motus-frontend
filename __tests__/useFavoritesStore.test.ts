import { act } from "@testing-library/react-native";

import { useFavoritesStore } from "@/stores/useFavoritesStore";

describe("useFavoritesStore", () => {
  beforeEach(() => {
    useFavoritesStore.setState({ ids: [] });
  });

  it("starts empty", () => {
    expect(useFavoritesStore.getState().ids).toEqual([]);
    expect(useFavoritesStore.getState().isFavorite(57660)).toBe(false);
  });

  it("toggle adds an id not already saved", () => {
    act(() => useFavoritesStore.getState().toggle(57660));

    expect(useFavoritesStore.getState().ids).toEqual([57660]);
    expect(useFavoritesStore.getState().isFavorite(57660)).toBe(true);
  });

  it("toggle removes an id already saved", () => {
    act(() => useFavoritesStore.getState().toggle(57660));
    act(() => useFavoritesStore.getState().toggle(57660));

    expect(useFavoritesStore.getState().ids).toEqual([]);
    expect(useFavoritesStore.getState().isFavorite(57660)).toBe(false);
  });

  it("keeps multiple saved ids independent", () => {
    act(() => useFavoritesStore.getState().toggle(1));
    act(() => useFavoritesStore.getState().toggle(2));
    act(() => useFavoritesStore.getState().toggle(1));

    expect(useFavoritesStore.getState().ids).toEqual([2]);
  });
});
