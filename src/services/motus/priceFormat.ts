const ITALIAN_DATETIME_PATTERN =
  /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/;

/**
 * `data_comunicazione` is `"GG/MM/AAAA HH:MM:SS"` (e.g. "31/07/2026
 * 10:28:04"), not ISO 8601 (api-contract.md) — passing it straight to
 * `new Date(string)` would parse day/month backwards or return an Invalid
 * Date depending on runtime. Shared by S02 (price rows) and S03 (station
 * detail prices), the only two screens rendering this field.
 */
export function parseDataComunicazione(value: string | null): Date | null {
  if (!value) return null;

  const match = ITALIAN_DATETIME_PATTERN.exec(value);
  if (!match) return null;

  const [, day, month, year, hour, minute, second] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  );

  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDataComunicazione(value: string | null): string {
  const date = parseDataComunicazione(value);
  if (!date) return "Data non disponibile";

  return date.toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
