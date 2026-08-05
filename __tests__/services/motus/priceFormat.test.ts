import {
  formatDataComunicazione,
  parseDataComunicazione,
} from "@/services/motus/priceFormat";

describe("parseDataComunicazione", () => {
  it("parses the observed GG/MM/AAAA HH:MM:SS format explicitly (not via new Date(string))", () => {
    // 31/07/2026 is day=31, month=07 (July) — a naive `new Date("31/07/2026 10:28:04")`
    // would either produce an Invalid Date or, in some engines, silently
    // swap day/month; this must not happen (api-contract.md, VS4).
    const date = parseDataComunicazione("31/07/2026 10:28:04");

    expect(date).not.toBeNull();
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(6); // July, 0-indexed
    expect(date?.getDate()).toBe(31);
    expect(date?.getHours()).toBe(10);
    expect(date?.getMinutes()).toBe(28);
    expect(date?.getSeconds()).toBe(4);
  });

  it("returns null for a missing value", () => {
    expect(parseDataComunicazione(null)).toBeNull();
  });

  it("returns null for an unrecognized format instead of an Invalid Date", () => {
    expect(parseDataComunicazione("2026-07-31T10:28:04Z")).toBeNull();
    expect(parseDataComunicazione("not a date")).toBeNull();
  });
});

describe("formatDataComunicazione", () => {
  it("formats a valid value for display", () => {
    expect(formatDataComunicazione("31/07/2026 10:28:04")).toContain("2026");
  });

  it("falls back to an explicit message for a missing/invalid value", () => {
    expect(formatDataComunicazione(null)).toBe("Data non disponibile");
    expect(formatDataComunicazione("garbage")).toBe("Data non disponibile");
  });
});
