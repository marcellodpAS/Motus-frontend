# ADR-0003 — Automotive fuori dal perimetro corrente, architettura mobile non accoppiata

## Stato

Accettata.

## Contesto

`automotive-architecture-decision.md` (Task 5) classifica Android Auto come `feasible-with-native-work` e Apple CarPlay come `requires-product-clarification`. Entrambi richiedono superfici native separate (`CarAppService` Kotlin/Java, `CPTemplateApplicationSceneDelegate` Swift): nessuna UI React Native è renderizzabile in nessuno dei due ambienti. Nessuna implementazione, dipendenza o config plugin automotive esiste oggi nel repository.

## Decisione

L'architettura mobile descritta in `architecture.md` non prende alcuna decisione **in funzione** di un futuro target automotive, e nessuna vertical slice di `feature-backlog.md` include lavoro automotive. L'unico artefatto potenzialmente riusabile in un'eventuale implementazione futura è il layer di contratto dati (`src/services/motus`, come riferimento concettuale per l'equivalente nativo) — non il codice React Native, non i componenti, non lo stato, non il routing.

## Conseguenze

- Nessun vincolo di "driver-distraction" o di semplificazione UI viene imposto oggi alle schermate mobile (S01–S04): sarebbe un'architettura speculativa per un target non deciso (violerebbe il vincolo "evita architetture speculative o sproporzionate").
- Se e quando l'automotive verrà sbloccato (decisione di prodotto su quali schermate portare in auto, più — per CarPlay — approvazione entitlement Apple), il lavoro richiederà una fase dedicata non pianificata in questo backlog, con prebuild Expo, config plugin e codice nativo separato dal codice React Native esistente.
- Questo ADR va rivisto (non sostituito silenziosamente) quando una decisione di prodotto sblocca l'automotive.
