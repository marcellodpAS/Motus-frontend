import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * "Save" (Task 19, `stitch-implementation-gap.md` row 10): the backend has
 * no write endpoint at all (`POST` → `501`, `source-requirements-inventory.md`
 * §4) and no user identity, so a favorite can only ever be a client-side
 * concept — a set of `id_impianto` persisted on-device, never synced. This
 * is the one Stitch-only feature in the gap matrix realizable end-to-end
 * with real data (each favorite still resolves to a real station via
 * `GET /api/stations/{id}`, never fabricated).
 */
export interface FavoritesState {
  ids: number[];
  isFavorite: (id: number) => boolean;
  toggle: (id: number) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      isFavorite: (id) => get().ids.includes(id),
      toggle: (id) =>
        set((state) => ({
          ids: state.ids.includes(id)
            ? state.ids.filter((existing) => existing !== id)
            : [...state.ids, id],
        })),
    }),
    {
      name: "motus.favorites",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ ids: state.ids }),
    },
  ),
);
