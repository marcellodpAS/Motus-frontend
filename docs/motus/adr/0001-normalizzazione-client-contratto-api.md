# ADR-0001 — Normalizzazione lato client delle incoerenze del contratto API

## Stato

Accettata.

## Contesto

`api-discrepancies.md` e `open-questions.md` documentano incoerenze reali e verificate nel contratto del backend Motus, tra cui:

- il campo che rappresenta il totale di paginazione si chiama `total` su `GET /api/stations` e `GET /api/prices`, ma `total_available` su `GET /api/stations/nearby`, con semantica leggermente diversa;
- l'oggetto risultato di `GET /api/prices` (`PriceRow`) è strutturalmente diverso e più povero dell'oggetto risultato di `GET /api/stations`/`GET /api/stations/nearby` (`Station`) — non contiene `indirizzo`, `gestore`, `bandiera`, `tipo_impianto`.

Il backend è un repository separato, senza contratto versionato (nessun OpenAPI, nessuna documentazione auto-descrittiva — `api-contract.md`), e questo task non prevede di modificarlo.

## Decisione

Il livello `src/services/motus` normalizza **solo** le incoerenze che rappresentano lo stesso concetto con nomi diversi (es. `total`/`total_available` → un solo campo `Pagination.total` nel tipo client-side). Non forza invece un tipo unico dove il contratto descrive realmente due forme diverse: `Station` e `PriceRow` restano due tipi TypeScript distinti, e i componenti di riga risultato di S01/S04 non sono riusati per S02.

## Conseguenze

- I consumer (`features`, `components`) non devono mai gestire `total`/`total_available` come due casi diversi: vedono un solo campo.
- Un futuro allineamento del backend (se `total_available` venisse rinominato `total`) richiede una modifica isolata in `src/services/motus`, non nei componenti.
- Il rischio di "appiattire" `PriceRow` su `Station` con campi opzionali fittizi (es. `indirizzo?: string` sempre `undefined`) è esplicitamente evitato: sarebbe un'astrazione falsa, non richiesta da nessun caso d'uso.
