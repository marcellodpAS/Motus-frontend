import {
  toEmptyMessageViewModel,
  toErrorMessageViewModel,
  toLocationDeniedMessageViewModel,
  toPlaceDetailViewModel,
  toPlaceItem,
  toPlaceListViewModel,
} from "@/automotive/models";
import { ApiHttpError, ApiTimeoutError } from "@/services/motus";
import type { Station } from "@/services/motus/types";

// Fixtures mirror the live-observed edge cases already used by the
// services/motus and stations-search test suites (empty nome_impianto on
// impianto 57660, empty prices[] on impianto 3498, docs/motus/api-contract.md).
const namedStation: Station = {
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
    {
      id_impianto: 3498,
      carburante: "Gasolio",
      prezzo: 1.699,
      self_service: 1,
      data_comunicazione: "04/08/2026 06:30:00",
      updated_at: "2026-08-04T06:30:00.377849+00:00",
    },
  ],
};

const unnamedStationNoPrices: Station = {
  ...namedStation,
  id_impianto: 57660,
  nome_impianto: "",
  bandiera: "Agip Eni",
  prices: [],
};

describe("toPlaceItem", () => {
  it("uses nome_impianto as the title when present", () => {
    expect(toPlaceItem(namedStation).title).toBe("NURE SUD");
  });

  it("falls back to bandiera for the live-observed empty nome_impianto case", () => {
    expect(toPlaceItem(unnamedStationNoPrices).title).toBe("Agip Eni");
  });

  it("falls back to id_impianto when both nome_impianto and bandiera are empty", () => {
    const item = toPlaceItem({ ...unnamedStationNoPrices, bandiera: "" });
    expect(item.title).toBe("Impianto 57660");
  });

  it("shows the lowest price as priceLabel", () => {
    expect(toPlaceItem(namedStation).priceLabel).toBe("Gasolio 1.699 €");
  });

  it("has no priceLabel for the live-observed empty prices[] case", () => {
    expect(toPlaceItem(unnamedStationNoPrices).priceLabel).toBeUndefined();
  });

  it("uses distance as subtitle when provided (nearby shape)", () => {
    expect(toPlaceItem(namedStation, 2.34).subtitle).toBe("2.3 km");
  });

  it("falls back to comune/provincia as subtitle when no distance is given", () => {
    expect(toPlaceItem(namedStation).subtitle).toBe("Piacenza · PC");
  });
});

describe("toPlaceListViewModel", () => {
  it("maps each station to a place item under a flat place-list template", () => {
    const viewModel = toPlaceListViewModel({
      headline: "Impianti vicini",
      stations: [namedStation, unnamedStationNoPrices],
    });

    expect(viewModel.template).toBe("place-list");
    expect(viewModel.headline).toBe("Impianti vicini");
    expect(viewModel.items.map((item) => item.id)).toEqual([3498, 57660]);
  });

  it("attaches distance per station from distanceByStationId, keyed by id_impianto", () => {
    const viewModel = toPlaceListViewModel({
      headline: "Impianti vicini",
      stations: [namedStation],
      distanceByStationId: new Map([[3498, 0.8]]),
    });

    expect(viewModel.items[0].subtitle).toBe("0.8 km");
  });
});

describe("toPlaceDetailViewModel", () => {
  it("puts the address first, then one row per price, in the server's own order", () => {
    const viewModel = toPlaceDetailViewModel(namedStation);

    expect(viewModel.template).toBe("place-detail");
    expect(viewModel.title).toBe("NURE SUD");
    expect(viewModel.rows).toEqual([
      { label: "Indirizzo", value: "VIA EMILIA 100" },
      { label: "Benzina", value: "1.799 €" },
      { label: "Gasolio", value: "1.699 €" },
    ]);
  });

  it("shows only the address row for the live-observed empty prices[] case, no fabricated row", () => {
    const viewModel = toPlaceDetailViewModel(unnamedStationNoPrices);
    expect(viewModel.rows).toHaveLength(1);
  });
});

describe("message view models", () => {
  it("reuses the backend's own short error string for ApiHttpError", () => {
    const error = new ApiHttpError(400, "Bad Request", {
      error: "limit e offset devono essere numeri interi",
    });
    expect(toErrorMessageViewModel(error).body).toBe(
      "limit e offset devono essere numeri interi",
    );
  });

  it("falls back to a fixed short body for non-http errors, not the raw ApiError message", () => {
    const error = new ApiTimeoutError(5000);
    const viewModel = toErrorMessageViewModel(error);
    expect(viewModel.body).toBe("Riprova più tardi.");
    expect(viewModel.body).not.toContain("timeout");
  });

  it("produces a short, fixed empty-results message", () => {
    expect(toEmptyMessageViewModel().template).toBe("message");
  });

  it("produces a short, fixed location-denied message", () => {
    expect(toLocationDeniedMessageViewModel().template).toBe("message");
  });
});
