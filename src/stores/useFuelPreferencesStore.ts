import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Preferred fuel type(s), local to the device — same reasoning as
 * `useFavoritesStore`: no backend endpoint or user identity exists for
 * preferences (`source-requirements-inventory.md` §4), so this can only
 * ever be a client-side concept. Empty `fuels` means "no preference" —
 * every screen falls back to its current default (cheapest overall)
 * rather than showing nothing.
 */
export interface FuelPreferencesState {
  fuels: string[];
  toggle: (fuel: string) => void;
}

export const useFuelPreferencesStore = create<FuelPreferencesState>()(
  persist(
    (set) => ({
      fuels: [],
      toggle: (fuel) =>
        set((state) => ({
          fuels: state.fuels.includes(fuel)
            ? state.fuels.filter((existing) => existing !== fuel)
            : [...state.fuels, fuel],
        })),
    }),
    {
      name: "motus.fuel-preferences",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ fuels: state.fuels }),
    },
  ),
);
