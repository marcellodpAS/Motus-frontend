import { cheapestPrice, stationTitle } from "@/services/motus/stationDisplay";
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
});
