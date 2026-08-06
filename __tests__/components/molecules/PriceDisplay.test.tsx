import { render } from "@testing-library/react-native";

import { PriceDisplay } from "@/components/molecules/PriceDisplay";
import type { Price } from "@/services/motus/types";

function priceFixture(overrides: Partial<Price> = {}): Price {
  return {
    id_impianto: 1,
    carburante: "Benzina",
    prezzo: 1.754,
    self_service: 1,
    data_comunicazione: null,
    updated_at: "2026-08-04T06:30:00.377849+00:00",
    ...overrides,
  };
}

describe("PriceDisplay", () => {
  it("shows a single cheapest price when no fuel is preferred", async () => {
    const { getByText } = await render(
      <PriceDisplay
        prices={[
          priceFixture({ prezzo: 1.899 }),
          priceFixture({ prezzo: 1.754 }),
        ]}
        preferredFuels={[]}
      />,
    );

    expect(getByText("1.754 €")).toBeTruthy();
  });

  it("shows a single price narrowed to the one preferred fuel", async () => {
    const { getByText } = await render(
      <PriceDisplay
        prices={[
          priceFixture({ prezzo: 1.65, carburante: "Benzina" }),
          priceFixture({ prezzo: 1.5, carburante: "Gasolio" }),
        ]}
        preferredFuels={["Gasolio"]}
      />,
    );

    expect(getByText("1.500 €")).toBeTruthy();
  });

  it("shows a labelled breakdown when 2+ fuels are preferred", async () => {
    const { getByText } = await render(
      <PriceDisplay
        prices={[
          priceFixture({ prezzo: 1.65, carburante: "Benzina" }),
          priceFixture({ prezzo: 1.5, carburante: "Gasolio" }),
        ]}
        preferredFuels={["Benzina", "Gasolio"]}
      />,
    );

    expect(getByText("Benzina")).toBeTruthy();
    expect(getByText("1.650 €")).toBeTruthy();
    expect(getByText("Gasolio")).toBeTruthy();
    expect(getByText("1.500 €")).toBeTruthy();
  });

  it("renders nothing for an empty prices array", async () => {
    const { queryByText, toJSON } = await render(
      <PriceDisplay prices={[]} preferredFuels={[]} />,
    );

    expect(queryByText(/€/)).toBeNull();
    expect(toJSON()).toBeNull();
  });
});
