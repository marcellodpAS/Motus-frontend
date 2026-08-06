import {
  cheapestPrice,
  cheapestValue,
  preferredPriceBreakdown,
  priceLines,
  stationTitle,
} from "@/services/motus/stationDisplay";
import type { Price } from "@/services/motus/types";

function priceFixture(overrides: Partial<Price> = {}): Price {
  return {
    id_impianto: 1,
    carburante: "Benzina",
    prezzo: 1.754,
    self_service: 1,
    data_comunicazione: "31/07/2026 10:28:04",
    updated_at: "2026-08-04T06:30:00.377849+00:00",
    ...overrides,
  };
}

describe("stationTitle", () => {
  it("uses nome_impianto when present", () => {
    expect(
      stationTitle({
        id_impianto: 1,
        bandiera: "Agip Eni",
        nome_impianto: "NURE SUD",
      }),
    ).toBe("NURE SUD");
  });

  it("falls back to bandiera when nome_impianto is an empty string (observed live, impianto 57660)", () => {
    expect(
      stationTitle({
        id_impianto: 57660,
        bandiera: "Agip Eni",
        nome_impianto: "",
      }),
    ).toBe("Agip Eni");
  });

  it("falls back to the id when both nome_impianto and bandiera are empty", () => {
    expect(
      stationTitle({ id_impianto: 42, bandiera: "", nome_impianto: "" }),
    ).toBe("Impianto 42");
  });
});

describe("cheapestPrice", () => {
  it("returns undefined for an empty prices array (observed live, impianto 3498)", () => {
    expect(cheapestPrice([])).toBeUndefined();
  });

  it("returns the lowest prezzo formatted with 3 decimals and the euro sign", () => {
    const prices = [
      priceFixture({ prezzo: 1.899 }),
      priceFixture({ prezzo: 1.754, carburante: "Gasolio" }),
      priceFixture({ prezzo: 1.999, carburante: "GPL" }),
    ];

    expect(cheapestPrice(prices)).toBe("1.754 €");
  });

  it("with a fuel preference, returns the cheapest among matching fuels only", () => {
    const prices = [
      priceFixture({ prezzo: 1.899, carburante: "Benzina" }),
      priceFixture({ prezzo: 1.754, carburante: "Gasolio" }),
      priceFixture({ prezzo: 1.65, carburante: "Benzina Shell V Power" }),
    ];

    expect(cheapestPrice(prices, ["Benzina"])).toBe("1.650 €");
  });

  it("falls back to the overall cheapest when the preference matches nothing at this station", () => {
    const prices = [
      priceFixture({ prezzo: 1.899, carburante: "Benzina" }),
      priceFixture({ prezzo: 1.754, carburante: "Gasolio" }),
    ];

    expect(cheapestPrice(prices, ["Metano"])).toBe("1.754 €");
  });
});

describe("preferredPriceBreakdown", () => {
  it("returns one labelled line per preferred fuel that has a match", () => {
    const prices = [
      priceFixture({ prezzo: 1.899, carburante: "Benzina" }),
      priceFixture({ prezzo: 1.85, carburante: "Benzina Shell V Power" }),
      priceFixture({ prezzo: 1.72, carburante: "Gasolio" }),
    ];

    expect(preferredPriceBreakdown(prices, ["Benzina", "Gasolio"])).toEqual([
      { fuel: "Benzina", priceLabel: "1.850 €" },
      { fuel: "Gasolio", priceLabel: "1.720 €" },
    ]);
  });

  it("omits a preferred fuel with no match at this station, never a fabricated line", () => {
    const prices = [priceFixture({ prezzo: 1.899, carburante: "Benzina" })];

    expect(preferredPriceBreakdown(prices, ["Benzina", "Metano"])).toEqual([
      { fuel: "Benzina", priceLabel: "1.899 €" },
    ]);
  });
});

describe("priceLines", () => {
  it("shows the single cheapest price, unlabelled, when nothing is preferred", () => {
    const prices = [
      priceFixture({ prezzo: 1.899, carburante: "Benzina" }),
      priceFixture({ prezzo: 1.72, carburante: "Gasolio" }),
    ];

    expect(priceLines(prices, [])).toEqual([{ priceLabel: "1.720 €" }]);
  });

  it("labels the line even when a single fuel is preferred", () => {
    const prices = [
      priceFixture({ prezzo: 1.899, carburante: "Benzina" }),
      priceFixture({ prezzo: 1.72, carburante: "Gasolio" }),
    ];

    expect(priceLines(prices, ["Gasolio"])).toEqual([
      { fuel: "Gasolio", priceLabel: "1.720 €" },
    ]);
  });

  it("returns nothing when the station sells none of the preferred fuels", () => {
    const prices = [priceFixture({ prezzo: 1.899, carburante: "Benzina" })];

    // Strict, unlike `cheapestPrice`: a pin the user filtered out must not
    // reappear priced on some other fuel.
    expect(priceLines(prices, ["Metano"])).toEqual([]);
  });

  it("returns nothing for a station with no prices at all", () => {
    expect(priceLines([], [])).toEqual([]);
  });
});

describe("cheapestValue", () => {
  it("is the overall cheapest with no preference", () => {
    const prices = [
      priceFixture({ prezzo: 1.899, carburante: "Benzina" }),
      priceFixture({ prezzo: 1.72, carburante: "Gasolio" }),
    ];

    expect(cheapestValue(prices)).toBe(1.72);
  });

  it("is the cheapest among the preferred fuels only", () => {
    const prices = [
      priceFixture({ prezzo: 1.899, carburante: "Benzina" }),
      priceFixture({ prezzo: 1.72, carburante: "Gasolio" }),
    ];

    expect(cheapestValue(prices, ["Benzina"])).toBe(1.899);
  });

  it("is null when the preference matches nothing, so the station cannot rank as cheapest", () => {
    const prices = [priceFixture({ prezzo: 1.899, carburante: "Benzina" })];

    expect(cheapestValue(prices, ["Metano"])).toBeNull();
    expect(cheapestValue([], [])).toBeNull();
  });
});
