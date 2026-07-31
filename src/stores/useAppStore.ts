import { create } from "zustand";

export type AppState = {
  isAppReady: boolean;
};

export type AppActions = {
  setAppReady: (isAppReady: boolean) => void;
  reset: () => void;
};

export type AppStore = AppState & AppActions;

export const initialAppState: AppState = {
  isAppReady: false,
};

export const useAppStore = create<AppStore>()((set) => ({
  ...initialAppState,
  setAppReady: (isAppReady) => set({ isAppReady }),
  reset: () => set(initialAppState),
}));
