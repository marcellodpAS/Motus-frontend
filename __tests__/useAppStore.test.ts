import { initialAppState, useAppStore } from "@/stores/useAppStore";

describe("useAppStore", () => {
  afterEach(() => {
    useAppStore.getState().reset();
  });

  it("updates and resets the shared ready state", () => {
    expect(useAppStore.getState().isAppReady).toBe(false);

    useAppStore.getState().setAppReady(true);
    expect(useAppStore.getState().isAppReady).toBe(true);

    useAppStore.getState().reset();
    expect(useAppStore.getState().isAppReady).toBe(initialAppState.isAppReady);
  });
});
