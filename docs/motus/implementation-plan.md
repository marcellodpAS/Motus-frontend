# Motus — Piano di implementazione

Traduce `architecture.md` in una sequenza di fasi verificabili. Ogni fase raggruppa una o più vertical slice definite in `feature-backlog.md`, con un gate esplicito (criterio) per passare alla fase successiva. Nessuna fase implica l'aggiunta di dipendenze non già presenti, tranne dove esplicitamente segnalato (Fase 4).

## Vincoli che si applicano a tutte le fasi

- Nessuna fase introduce una nuova dipendenza, salvo la geolocalizzazione in Fase 4 (unico punto pianificato, vedi `architecture.md` §8).
- Ogni fase deve lasciare `pnpm validate` verde (lint, format, typecheck, test) prima di considerarsi conclusa.
- Ogni fase copre esplicitamente gli stati UI osservati o previsti nei documenti dei Task 2–3 (`user-flows.md`, `api-contract.md`, `api-screen-mapping.md`) per l'endpoint coinvolto — non solo il caso "successo".

---

## Fase 0 — Fondamenta (nessuna schermata)

**Contiene**: VS0 (servizi API e tipi), VS1 (kit UI condiviso per stati lista).

**Perché prima di tutto**: ogni vertical slice successiva dipende da entrambe (`architecture.md` §10). Costruirle una volta sola evita di ripetere client HTTP e gestione stati vuoto/caricamento/errore in ciascuna schermata.

**Gate di uscita**:

- `src/services/motus` espone tipi e funzioni per le 4 chiamate realmente necessarie (`stations.search`, `stations.getById`, `stations.nearby`, `prices.search`), verificati con test unitari contro le fixture derivate da `api-contract.md` (incluse le tre forme di risposta: successo, errore applicativo, lista vuota).
- Gli organism di stato condiviso (caricamento, vuoto, errore) esistono e sono testati in isolamento, senza dipendere da alcuna feature.
- Nessuna route applicativa nuova esiste ancora in `src/app`.

---

## Fase 1 — Prima vertical slice end-to-end

**Contiene**: VS2 (ricerca impianti, S01).

**Perché per prima tra le 4 schermate**: è il caso d'uso meglio definito (`UC2`), l'unico i cui filtri (`comune`, `provincia`, `q`) sono già interamente verificati dal vivo (`api-contract.md`), e la sua "forma" (lista con filtri e paginazione) è quella riusata da S02 e S04 — costruirla per prima ammortizza il costo del template su tutte le schermate successive.

**Gate di uscita**:

- Dall'avvio dell'app è raggiungibile una lista reale di impianti (anche solo tramite un'unica route, senza shell di navigazione — vedi Fase 5).
- Coperti: popolato, nessun risultato (`data: []`), errore parametri (400 solo per `limit`/`offset` non interi), errore server (mockato, 500 non riproducibile dal vivo).
- Paginazione funzionante secondo la regola osservata (`offset` incrementale, stop quando `offset + data.length >= pagination.total`).

---

## Fase 2 — Dettaglio

**Contiene**: VS3 (dettaglio impianto, S03).

**Perché subito dopo S01**: è la destinazione di navigazione di tutte le altre schermate (S01, S02, S04 puntano tutte a S03) — costruirla presto permette a S02 e S04 (Fasi 3–4) di collegarsi a una destinazione reale invece che a un placeholder.

**Gate di uscita**:

- Raggiungibile da VS2 con `id_impianto` reale.
- Coperti tutti gli stati osservati dal vivo in `api-screen-mapping.md`: popolato con prezzi, popolato senza prezzi (`prices: []`), senza coordinate geocodificate (`geocoding_status` ≠ `success`), non trovato (404 `"impianto non trovato"`), id malformato (404 `"endpoint non trovato"` — messaggio indistinguibile, la UI non deve fingere di saperne di più del backend).

---

## Fase 3 — Seconda via di ricerca

**Contiene**: VS4 (ricerca prezzi per carburante, S02).

**Perché dopo S03 e non prima**: riusa sia il template "lista con filtri" (validato in Fase 1) sia la destinazione S03 (pronta da Fase 2), quindi non introduce nulla di nuovo a livello di architettura — solo un nuovo modulo di servizio (`prices.search`) e il tipo distinto `PriceRow` già previsto in `architecture.md` §5.

**Gate di uscita**:

- Filtro per `carburante` funzionante (nessuna validazione enum lato client: il campo è testo libero non enumerato in modo esaustivo, `open-questions.md` #11).
- Riga risultato naviga a S03 riusando la stessa route dinamica di VS3, non una copia.
- Coperti: popolato, vuoto, errore parametri, errore server — stessa evidenza di VS2.

---

## Fase 4 — Capability nativa

**Contiene**: VS5 (impianti vicini, S04).

**Perché per ultima tra le schermate**: è l'unica che richiede una capability di piattaforma non ancora presente nel repository (geolocalizzazione) e un permesso runtime — introduce un asse di complessità (gestione permesso negato/non disponibile) che le altre tre schermate non hanno.

**Azione di apertura fase, non anticipata altrove**: aggiunta formale di `expo-location` (o libreria Expo equivalente al momento dell'implementazione, da verificare contro la documentazione versionata SDK 54 — `AGENTS.md`) tramite `expo install`, così da restare allineata al resolver Expo.

**Gate di uscita**:

- Permesso di posizione richiesto con fallback esplicito se negato o non disponibile (nessun requisito di background location, `product-requirements.md` §10).
- Riusa il template "lista con filtri" (senza filtri testuali, solo posizione + `limit`).
- Coperti: popolato ordinato per distanza, nessun impianto con coordinate disponibili (`total_available: 0`), posizione mancante/non numerica (400), posizione fuori range (400, messaggi distinti lat/lon).
- Nota di prodotto riportata in UI o log, non silenziata: impianti `geocoding_status: "source_only"` visibili in S01/S02/S03 non compariranno mai qui (`open-questions.md` #10) — comportamento del backend, non un bug del client.

---

## Fase 5 — Composizione di navigazione

**Contiene**: VS6 (shell di navigazione).

**Perché per ultima**: solo ora esistono realmente ≥ 2 schermate di ingresso (S01, S02, S04) da collegare — costruire prima la shell sarebbe stata IA speculativa (ADR-0005).

**Gate di uscita**:

- I tre punti di ingresso (S01, S02, S04) sono raggiungibili da una navigazione coerente (tab o equivalente, deciso in fase di implementazione, non in questo piano).
- Nessuna schermata rimane isolata o raggiungibile solo da deep link manuale.
- Back-navigation da S03 riporta alla schermata di provenienza corretta.

---

## Fasi non pianificate in questo task

Le seguenti attività **non hanno una fase assegnata** perché dipendono da decisioni non ancora prese (prodotto, design, o entrambe) — sono elencate per tracciabilità, non per pianificazione:

| Attività                             | Bloccata da                                                                                                | Documento                             |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Automotive (Android Auto / CarPlay)  | Decisione di prodotto su quali schermate portare in auto; per CarPlay anche approvazione entitlement Apple | `automotive-architecture-decision.md` |
| Design system definitivo             | Riferimento "Stitch" irrisolto; nessun progetto su `DesignSync`                                            | `design-inputs.md`, `mcp-audit.md`    |
| Dark mode esplicito                  | Nessun requisito raccolto                                                                                  | `product-requirements.md`             |
| Modalità offline / cache persistente | Nessun requisito raccolto, nessuna libreria di cache introdotta (ADR-0002)                                 | `open-questions.md` #7                |
| Autenticazione                       | Assenza dichiarata intenzionale o provvisoria, non chiarito                                                | `open-questions.md` #5                |

## Riepilogo ordine

```text
Fase 0 — VS0 Servizi API + VS1 Kit UI condiviso   (nessuna dipendenza da fasi precedenti)
Fase 1 — VS2 Ricerca impianti (S01)                dipende da Fase 0
Fase 2 — VS3 Dettaglio impianto (S03)              dipende da Fase 0 (e da Fase 1 per un ingresso reale)
Fase 3 — VS4 Ricerca prezzi (S02)                  dipende da Fase 0, Fase 2
Fase 4 — VS5 Impianti vicini (S04)                 dipende da Fase 0, Fase 2, + expo-location
Fase 5 — VS6 Shell di navigazione                  dipende da Fasi 1, 2, 3, 4
```
