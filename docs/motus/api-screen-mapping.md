# Motus — Mappatura schermate ↔ endpoint API

Basato su `docs/motus/screen-inventory.md` (Task 2, schermate S01–S04, tutte marcate 🟡 assunzione) e sul contratto verificato in `docs/motus/api-contract.md` (Task 3). Ogni riga indica esattamente quale chiamata la schermata deve eseguire e con quali parametri, sulla base del comportamento **realmente osservato**, non solo dichiarato.

---

## S01 — Ricerca impianti

**Endpoint**: `GET /api/stations` — ✅ verificato

| Momento della schermata                   | Chiamata                                                                                                                                    |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Apertura iniziale (nessun filtro)         | `GET /api/stations?limit=50` — ✅ limit di default confermato 50 dal vivo                                                                   |
| Utente filtra per comune                  | `GET /api/stations?comune={valore}&limit=50`                                                                                                |
| Utente filtra per provincia (in aggiunta) | `GET /api/stations?comune={valore}&provincia={sigla}&limit=50`                                                                              |
| Utente usa ricerca libera                 | `GET /api/stations?q={testo}&limit=50` — ⚠️ parametro non documentato nel README, solo verificato nel codice/live in questo task            |
| Scroll/paginazione                        | Incrementare `offset` di `limit` a ogni pagina; interrompere quando `data.length < limit` oppure `offset + data.length >= pagination.total` |
| Selezione impianto                        | Naviga a S03 passando `id_impianto`                                                                                                         |

**Dati da mappare in UI per ogni riga risultato**: `nome_impianto` (⚠️ gestire stringa vuota `""` — osservato live), `bandiera`, `indirizzo`/`comune`/`provincia`, prezzo minimo o prezzo self-service da `prices[]` (⚠️ `prices` può essere `[]` — osservato live, impianto senza alcun prezzo comunicato).

**Stati UI da coprire (con evidenza)**:

- Caricamento → nessuna evidenza specifica richiesta (stato client-side)
- Popolato → ✅ verificato
- Nessun risultato → ✅ verificato (`data: []`, `pagination.total: 0`, HTTP 200 — **non** è un errore)
- Errore parametri → ✅ verificato: solo se `limit`/`offset` non sono interi (400); filtri testuali non generano mai 400
- Errore server → 📄 solo da specifica (500, non riproducibile senza operazione distruttiva)

---

## S02 — Ricerca prezzi per carburante

**Endpoint**: `GET /api/prices` — ✅ verificato

| Momento della schermata | Chiamata                                                                                                                                                                                                                                            |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Apertura iniziale       | ⚠️ Se non deve mostrare TUTTI i 93.396 prezzi, la UI deve **obbligare** almeno un filtro prima della prima chiamata (nessun limite implicito lato prodotto, solo `limit=50` lato server)                                                            |
| Filtro per carburante   | `GET /api/prices?carburante={valore}&limit=50` — ⚠️ il valore deve corrispondere (anche parzialmente, `LIKE`) a uno dei 31+ valori osservati in `api-contract.md` (es. `Benzina`, `Gasolio`, `GPL`, `Metano`, `HVO100`, ecc. — lista non esaustiva) |
| Filtro combinato area   | `GET /api/prices?carburante={valore}&provincia={sigla}&comune={valore}&limit=50`                                                                                                                                                                    |
| Paginazione             | Come S01: `offset` incrementale, stop quando `offset + data.length >= pagination.total`                                                                                                                                                             |
| Selezione riga          | Naviga a S03 passando `id_impianto` (presente in ogni riga di `data[]`)                                                                                                                                                                             |

**Dati da mappare in UI per ogni riga**: qui l'oggetto è "appiattito" (⚠️ verificato: **non** contiene `indirizzo`, `gestore`, `bandiera`, `tipo_impianto`, a differenza di S01/S03) — solo `nome_impianto`, `comune`, `provincia`, `via_geocoded`, coordinate, più i campi prezzo (`carburante`, `prezzo`, `self_service`, `data_comunicazione` in formato `GG/MM/AAAA HH:MM:SS` ⚠️ non ISO).

**Stati UI**: identici a S01 (popolato / vuoto / errore parametri / errore server), tutti con la stessa evidenza di verifica.

---

## S03 — Dettaglio impianto

**Endpoint**: `GET /api/stations/{id}` — ✅ verificato

| Momento della schermata | Chiamata                          |
| ----------------------- | --------------------------------- |
| Apertura da S01/S02/S04 | `GET /api/stations/{id_impianto}` |

**Dati da mappare**: `station.*` (schema completo in `api-contract.md`) + `prices[]` ordinato per `carburante`, `self_service`.

**Stati UI (con evidenza)**:

- Popolato con prezzi → ✅ verificato (es. impianto 57660, 7 righe prezzo)
- Popolato **senza** prezzi → ✅ verificato dal vivo (impianto 3498, "NURE SUD", `prices: []`) — la UI **deve** gestire questo caso, non è teorico
- Impianto senza coordinate geocodificate (`latitudine_completa`/`longitudine_completa` entrambe `null`) → ✅ verificato dal vivo (impianto 60502, `geocoding_status: "source_only"`) — se S03 prevede una mappa, questo stato deve avere un fallback esplicito (nessuna mappa mostrabile)
- Non trovato → ✅ verificato: `id` numerico ma inesistente → 404 `"impianto non trovato"` (messaggio specifico, distinguibile)
- Id malformato (non numerico, se mai raggiungibile da un deep link) → ✅ verificato: 404 `"endpoint non trovato"` (⚠️ messaggio generico, **indistinguibile** da un endpoint realmente inesistente — la UI non può discriminare i due casi dal solo body)
- Errore server → 📄 solo da specifica

---

## S04 — Impianti vicini ("vicino a me")

**Endpoint**: `GET /api/stations/nearby` — ✅ verificato

| Momento della schermata            | Chiamata                                                                                                                                                                                                                                                 |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Apertura con posizione disponibile | `GET /api/stations/nearby?lat={lat}&lon={lon}&limit=20` — ⚠️ **la UI deve passare esplicitamente `limit=20` se vuole 20 risultati**: il default reale del server è **50**, non 20 come indicato nel README (`api-discrepancies.md`)                      |
| Aggiornamento posizione            | Ripetere la chiamata con nuove `lat`/`lon`; ✅ verificato: **non esiste paginazione utile qui** — `offset` è accettato ma ignorato, quindi "carica altri risultati" richiede di aumentare `limit` e rifare l'intera chiamata, non incrementare un offset |
| Selezione impianto                 | Naviga a S03                                                                                                                                                                                                                                             |

**Dati da mappare**: stesso oggetto impianto di S01 + `distance_km` (✅ verificato: ordinamento crescente garantito dal server, la UI non deve riordinare).

⚠️ **Vincolo di prodotto da questo endpoint, verificato dal vivo**: un impianto con `geocoding_status: "source_only"` (via nota ma nessuna coordinata numerica) **non comparirà mai** in questa schermata, anche se compare in S01/S02/S03. Se il prodotto richiede coerenza tra le liste, questo va gestito esplicitamente (fuori perimetro di questo task — segnalato anche in `open-questions.md`, punto 10).

**Stati UI (con evidenza)**:

- Popolato, ordinato per distanza → ✅ verificato
- Nessun impianto con coordinate disponibili → ✅ verificato: `data: []`, `pagination.total_available: 0`
- Posizione mancante/non numerica → ✅ verificato: 400 `"lat e lon sono obbligatorie e devono essere numeriche"`
- Posizione fuori range → ✅ verificato: due messaggi distinti per `lat` e `lon` fuori range (vedi `api-contract.md`) — la UI può mostrare un messaggio specifico per coordinata
- Errore server → 📄 solo da specifica

---

## Schermate senza endpoint dedicato (da `screen-inventory.md`)

| Schermata esclusa                  | Endpoint di supporto disponibile                                                                                                                                                                             |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| "Stato del servizio" / diagnostica | `GET /health` — ✅ verificato e disponibile, ma resta escluso come schermata utente per le stesse ragioni già registrate in `screen-inventory.md` (endpoint tecnico, non un caso d'uso end-user documentato) |

## Endpoint non necessari a nessuna schermata attuale

Nessuno tra i 5 endpoint verificati risulta inutilizzato: ognuno serve esattamente una schermata (`health`→nessuna schermata utente, `stations`→S01, `stations/{id}`→S03, `prices`→S02, `stations/nearby`→S04).

## Nota per l'implementazione del client tipizzato

Poiché `S02` (`/api/prices`) restituisce un oggetto **strutturalmente diverso** da `S01`/`S04` (`/api/stations`, `/api/stations/nearby` — che condividono lo stesso schema impianto), un client fortemente tipizzato **non può riusare lo stesso tipo `Station`** per i risultati di S02: servono due tipi distinti (es. `Station` vs `PriceWithStationSummary`), oppure una normalizzazione lato client esplicitamente documentata come tale.
