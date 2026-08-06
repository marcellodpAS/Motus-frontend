import { matchesFuelPreference } from "@/services/motus/fuelPreference";

describe("matchesFuelPreference", () => {
  it("matches everything when no fuel is selected (no preference set)", () => {
    expect(matchesFuelPreference("Benzina", [])).toBe(true);
    expect(matchesFuelPreference("Qualsiasi cosa", [])).toBe(true);
  });

  it("matches an exact category name", () => {
    expect(matchesFuelPreference("Benzina", ["Benzina"])).toBe(true);
  });

  it("matches branded variants via substring, same semantics as the backend's carburante filter", () => {
    expect(matchesFuelPreference("Benzina Shell V Power", ["Benzina"])).toBe(
      true,
    );
    expect(matchesFuelPreference("Gasolio Artico Igloo", ["Gasolio"])).toBe(
      true,
    );
  });

  it("is case-insensitive", () => {
    expect(matchesFuelPreference("BENZINA SUPER", ["benzina"])).toBe(true);
  });

  it("does not match an unrelated fuel", () => {
    expect(matchesFuelPreference("Metano", ["Benzina", "Gasolio"])).toBe(false);
  });
});
