// Locks the JSON shape the native Android Auto scaffold (Task 15,
// native/android-auto/MotusViewModel.kt) parses against the *real* Task 14
// mapping functions (src/automotive/models) — not a hand-written fixture
// object. If a future change to template.ts/placeItem.ts/placeDetail.ts
// renames or drops a field MotusViewModelJson.parsePlaceList/parsePlaceDetail
// reads (org.json getString/getInt calls, native/android-auto/MotusViewModel.kt),
// this test fails here, in CI, instead of surfacing as a native crash nobody
// can run in this environment (no Java/Android SDK — see
// docs/motus/android-auto-integration.md, "Verifiche manuali").
import {
  toPlaceDetailViewModel,
  toPlaceItem,
  toPlaceListViewModel,
} from "@/automotive/models";
import type { Station } from "@/services/motus/types";

const station: Station = {
  id_impianto: 3498,
  gestore: "Esempio Gestore",
  bandiera: "Q8",
  tipo_impianto: "Stradale",
  nome_impianto: "NURE SUD",
  indirizzo: "VIA EMILIA 100",
  comune: "Piacenza",
  provincia: "PC",
  latitudine: 44.9,
  longitudine: 9.7,
  updated_at: "2026-08-04T06:30:00.377849+00:00",
  via_geocoded: null,
  latitudine_completa: 44.9,
  longitudine_completa: 9.7,
  geocoding_status: "success",
  prices: [
    {
      id_impianto: 3498,
      carburante: "Benzina",
      prezzo: 1.799,
      self_service: 1,
      data_comunicazione: "04/08/2026 06:30:00",
      updated_at: "2026-08-04T06:30:00.377849+00:00",
    },
  ],
};

// Keys MotusViewModelJson.parsePlaceList (native/android-auto/MotusViewModel.kt)
// reads off each item via JSONObject.getInt/getString/optionalString.
const NATIVE_PLACE_ITEM_KEYS = ["id", "title", "subtitle", "priceLabel"].sort();
// Keys MotusViewModelJson.parsePlaceList reads off the list envelope.
const NATIVE_PLACE_LIST_KEYS = ["headline", "items"].sort();
// Keys MotusViewModelJson.parsePlaceDetail reads.
const NATIVE_PLACE_DETAIL_KEYS = ["title", "rows"].sort();
const NATIVE_DETAIL_ROW_KEYS = ["label", "value"].sort();

describe("native Android Auto contract (Task 15 <-> Task 14)", () => {
  it("toPlaceItem produces exactly the keys MotusViewModelJson.parsePlaceList reads per item", () => {
    const item = toPlaceItem(station, 2.3);
    expect(Object.keys(item).sort()).toEqual(NATIVE_PLACE_ITEM_KEYS);
  });

  it("toPlaceListViewModel's envelope matches the keys MotusViewModelJson.parsePlaceList reads", () => {
    const viewModel = toPlaceListViewModel({
      headline: "Impianti vicini",
      stations: [station],
    });
    // "template" is a Task 14 discriminant the native scaffold doesn't
    // need (the caller already knows which Screen it's building), so it's
    // deliberately excluded from the native envelope keys, not read by
    // MotusViewModelJson.parsePlaceList.
    const { template: _template, ...envelope } = viewModel;
    expect(Object.keys(envelope).sort()).toEqual(NATIVE_PLACE_LIST_KEYS);
  });

  it("toPlaceDetailViewModel's shape matches the keys MotusViewModelJson.parsePlaceDetail reads", () => {
    const viewModel = toPlaceDetailViewModel(station);
    const { template: _template, ...envelope } = viewModel;
    expect(Object.keys(envelope).sort()).toEqual(NATIVE_PLACE_DETAIL_KEYS);
    for (const row of viewModel.rows) {
      expect(Object.keys(row).sort()).toEqual(NATIVE_DETAIL_ROW_KEYS);
    }
  });

  it("id stays a JSON number (MotusPlaceItem.id is a Kotlin Int, not a String)", () => {
    const item = toPlaceItem(station);
    expect(typeof item.id).toBe("number");
    expect(Number.isInteger(item.id)).toBe(true);
  });
});
