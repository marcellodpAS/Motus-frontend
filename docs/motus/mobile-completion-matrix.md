# Motus — Matrice di completamento mobile (Task 18)

Strumento operativo, non deliverable finale. Stato rilevato a inizio Task 18
(dopo il commit di stabilizzazione Task 17), aggiornato a fine task con lo
stato reale raggiunto. Riferimenti: `screen-inventory.md`, `user-flows.md`,
`feature-backlog.md`, `api-screen-mapping.md`.

> ⚠️ **Invalidata dal Task 19** (`docs/motus/stitch-implementation-gap.md`).
> Ogni riga `complete-and-verified` qui sotto copriva solo il contratto
> dati col backend (chiamate live, sola lettura) — **mai** un confronto
> visivo con un riferimento di design reale (Stitch non era raggiungibile
> in questo task) né un'esecuzione su simulatore/emulatore. Il Task 19 ha
> inoltre sostituito interamente il modello di navigazione (tab bar
> Map/Favorites/Pro/Profile al posto della Home a 3 pulsanti) e aggiunto 4
> schermate assenti da questa matrice (Mappa, Segnala Prezzo, Previsioni
> Pro, Favorites/Profile). Fonti aggiornate, in ordine di priorità:
> `stitch-screen-inventory.md`, `source-requirements-inventory.md`,
> `stitch-implementation-gap.md`, `visual-validation/README.md`. Questo
> file resta come registro storico dello stato a fine Task 18, non come
> stato attuale del prodotto.

## Schermate

| ID  | Schermata               | Route             | Componenti                                                        | Endpoint                   | Stato iniziale (inizio Task 18)                     | Stato finale (fine Task 18) | Problemi rilevati                                                                         | Intervento eseguito                                                                                                                   | Test esistenti                                               | Test aggiunti                                                                              |
| --- | ----------------------- | ----------------- | ----------------------------------------------------------------- | -------------------------- | --------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| S01 | Ricerca impianti        | `/stations`       | `StationsSearchScreen`, `useStationsSearch`, `ListScreenTemplate` | `GET /api/stations`        | complete-and-verified                               | complete-and-verified       | Nessuno                                                                                   | Nessuno (invariata)                                                                                                                   | `useStationsSearch.test.ts`, `StationsSearchScreen.test.tsx` | Nessuno                                                                                    |
| S03 | Dettaglio impianto      | `/stations/[id]`  | `StationDetailScreen`, `useStationDetail` (nuovo)                 | `GET /api/stations/{id}`   | implemented-but-not-wired (shell, nessun hook dati) | complete-and-verified       | Mostrava solo `id_impianto` grezzo, nessuna chiamata reale, nessun 404/500                | Aggiunto `stations.getById` + `useStationDetail` (loading/success/empty-prices/no-coords/not-found/error/retry), schermata ricomposta | `StationDetailScreen.test.tsx` (solo shell)                  | `stations.getById` (service), `useStationDetail`, `StationDetailScreen` (tutti gli stati)  |
| S02 | Ricerca prezzi          | `/prices` (nuova) | `PricesSearchScreen`, `usePricesSearch` (nuovi)                   | `GET /api/prices`          | missing                                             | complete-and-verified       | Nessun modulo `prices.ts`, nessuna schermata, nessuna route                               | Aggiunto `stations` service module `prices.ts`, hook, schermata, route, parsing `data_comunicazione` non-ISO                          | Nessuno                                                      | `prices.ts` (service), `usePricesSearch`, `PricesSearchScreen`, parsing data               |
| S04 | Impianti vicini         | `/nearby` (nuova) | `NearbyStationsScreen`, `useNearbyStations` (nuovi)               | `GET /api/stations/nearby` | missing                                             | complete-and-verified       | Nessun modulo, nessuna geolocalizzazione installata                                       | Aggiunto `expo-location`, `stations.nearby`, hook con stato permesso (undetermined/granted/denied/unavailable), schermata, route      | Nessuno                                                      | `stations.nearby` (service), `useNearbyStations` (permesso + dati), `NearbyStationsScreen` |
| —   | Home / punti d'ingresso | `/` (`index.tsx`) | `HomeRoute` (sostituisce `SetupScreen`)                           | Nessuno                    | placeholder ("Setup completato", solo un pulsante)  | complete-and-verified       | Testo dimostrativo di bootstrap, un solo punto di ingresso (S01), S02/S04 irraggiungibili | Sostituito con schermata Home reale: 3 punti di ingresso (S01/S02/S04), nessun testo dimostrativo                                     | `SetupScreen.test.tsx` (testo bootstrap)                     | `HomeScreen.test.tsx` (3 pulsanti, navigazione, ex `SetupScreen.test.tsx`)                 |

## Flussi

| Flusso                        | Ingresso           | Percorso                       | Stato iniziale                   | Stato finale                     | Note                                                                                                     |
| ----------------------------- | ------------------ | ------------------------------ | -------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Flusso 1 — Ricerca impianti   | Home → `/stations` | S01 → seleziona riga → S03     | complete-and-verified            | complete-and-verified            | Invariato                                                                                                |
| Flusso 2 — Dettaglio impianto | S01/S02/S04 → S03  | Dati reali, back-navigation    | blocked (shell)                  | complete-and-verified            | Sbloccato da `useStationDetail`                                                                          |
| Flusso 3 — Ricerca prezzi     | Home → `/prices`   | S02 → seleziona riga → S03     | missing                          | complete-and-verified            | Richiede almeno un filtro prima della prima chiamata (vincolo di prodotto, `api-screen-mapping.md` §S02) |
| Flusso 4 — Impianti vicini    | Home → `/nearby`   | Permesso posizione → S04 → S03 | missing                          | complete-and-verified            | Permesso negato/non disponibile → stato esplicito, non lista vuota                                       |
| Flusso 5 — Stato servizio     | —                  | —                              | escluso (per requisito)          | escluso (per requisito)          | `GET /health` non ha una schermata utente, per decisione di prodotto già tracciata (Task 2)              |
| Flusso 6 — Import dati        | —                  | —                              | escluso (fuori perimetro mobile) | escluso (fuori perimetro mobile) | Flusso di sistema (cron/CLI), non un flusso mobile                                                       |

## Fuori perimetro di questo task (bloccati, non da tecnica mobile)

| Elemento                  | Stato                  | Motivo                                                                                                                                                                                                                 |
| ------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Android Auto              | blocked-by-requirement | `MotusDataSource` non implementato, nessun toolchain Java/Android SDK in nessuna sessione — vedi `android-auto-integration.md` §9. Task 18 non interviene: priorità esplicita a iOS/Android mobile (vincolo del task). |
| CarPlay                   | blocked-by-requirement | `requires-product-clarification` — due domande di prodotto/business aperte, non tecniche. Vedi `carplay-integration.md`.                                                                                               |
| Autenticazione            | blocked-by-requirement | Nessun requisito di prodotto in alcun documento (`product-requirements.md` §7–8, `open-questions.md`).                                                                                                                 |
| Dark mode definitivo      | blocked-by-requirement | Nessuna decisione di design approvata (`design-tokens.md` §3).                                                                                                                                                         |
| Offline/cache persistente | blocked-by-requirement | Fuori backlog per scelta esplicita (ADR-0002, nessuna libreria di data-fetching).                                                                                                                                      |

Nessun elemento è `blocked-by-api`: tutti e 4 gli endpoint richiesti dalle 4
schermate (`stations`, `stations/{id}`, `prices`, `stations/nearby`) sono
verificati dal vivo (`api-contract.md`) e vengono usati da un modulo client
reale a fine task.

## Verifica dal vivo eseguita in questa sessione

`EXPO_PUBLIC_API_URL` (`http://192.168.1.148:8080`) si è rivelato
raggiungibile dall'ambiente di esecuzione di questo task (diversamente dalle
sessioni precedenti, `release-report.md` §16). Chiamate reali, sola lettura,
eseguite direttamente contro il backend (non tramite l'app, che resta non
avviabile su simulatore/emulatore in questo ambiente — vedi §"Stato iOS"/"Stato
Android" in `release-report.md`):

| Chiamata                                                   | Esito                                                                                                                                                                                                                      |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /health`                                              | 200, `stations: 23962`, `prices: 93373`                                                                                                                                                                                    |
| `GET /api/stations?limit=2`                                | 200, `pagination.total: 23962`                                                                                                                                                                                             |
| `GET /api/stations/{id}` (id reale dalla chiamata sopra)   | 200, `station` **senza** campo `prices` nidificato, `prices: [...]` a 6 elementi — schema `StationSummary` confermato                                                                                                      |
| `GET /api/stations/999999999` (id numerico inesistente)    | 404, `{"error":"impianto non trovato"}` — identico al messaggio atteso da `useStationDetail`                                                                                                                               |
| `GET /api/stations/abc` (id malformato)                    | 404, `{"error":"endpoint non trovato"}` — identico al messaggio generico atteso                                                                                                                                            |
| `GET /api/prices?limit=2`                                  | 200, chiavi della riga identiche a `PriceRow` (`id_impianto, carburante, prezzo, self_service, data_comunicazione, updated_at, nome_impianto, comune, provincia, via_geocoded, latitudine_completa, longitudine_completa`) |
| `GET /api/stations/nearby?lat=41.9028&lon=12.4964&limit=2` | 200, `pagination: {"limit":2,"total_available":23961}` — nessun campo `offset`, coerente con la normalizzazione applicata in `stations.nearby`                                                                             |

Nessuna operazione distruttiva eseguita (solo `GET`). Questo conferma che i 4
adapter client (`stations.search`, `stations.getById`, `prices.search`,
`stations.nearby`) sono strutturalmente corretti contro le risposte reali del
backend, non solo contro le fixture dei test automatici. Resta non eseguibile
in questo ambiente l'avvio dell'app su un simulatore/emulatore reale (nessun
Xcode/Android SDK disponibile) — vedi limiti residui in `release-report.md`.
