import type { Station } from "@/services/motus";

/**
 * Same fallback chain as VS2's result row
 * (docs/motus/feature-backlog.md §VS2 note: "nome_impianto -> bandiera ->
 * id_impianto", covering the live-observed empty `nome_impianto` string on
 * impianto 57660) — kept identical here so the automotive and mobile
 * surfaces never disagree on what a station is called.
 */
export function stationTitle(station: Station): string {
  return (
    station.nome_impianto ||
    station.bandiera ||
    `Impianto ${station.id_impianto}`
  );
}
