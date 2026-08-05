# ADR-0004 — Zustand riservato allo stato realmente condiviso tra schermate

## Stato

Accettata.

## Contesto

Il repository ha già Zustand installato e uno store dimostrativo (`useAppStore`/`isAppReady`, `repository-audit.md`), esplicitamente segnalato come "non rappresenta stato di business" e da sostituire, non estendere, quando emergerà il primo stato realmente condiviso. Nessuna delle 4 vertical slice di schermata (VS2–VS5) ha, allo stato attuale dei requisiti raccolti, un caso d'uso confermato in cui due schermate diverse devono leggere/scrivere lo stesso stato in tempo reale.

## Decisione

Ogni feature possiede il proprio stato locale (filtri, stato di richiesta, paginazione) tramite `useState`/`useReducer` dentro il proprio hook. Uno store Zustand viene creato **solo** quando una seconda schermata ha bisogno reale dello stesso stato di una prima — non prima, non "per sicurezza".

## Conseguenze

- Oggi nessuna vertical slice del backlog crea un nuovo store Zustand. Il candidato più vicino (posizione geografica corrente, usata da VS5) resta locale alla feature finché nessun'altra schermata la consuma.
- Evita lo store sprawl (molti store piccoli e scollegati) osservato come rischio comune in app che introducono state management globale prima di averne bisogno.
- Se una futura schermata (non pianificata in questo backlog) necessitasse di condividere filtri o posizione tra S01/S02/S04, la promozione a Zustand è un refactor isolato dell'hook esistente, non una riscrittura della UI (i componenti già ricevono stato via prop, non accedono allo store direttamente).
