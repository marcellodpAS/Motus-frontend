# Motus — Modello condiviso per l'esperienza automotive (Task 14)

Deliverable del Task 14 (`src/automotive`). Prepara la parte condivisa dell'esperienza automotive — tipi, mapping dati→template, comandi, stati, adapter tipizzati — senza dipendere da alcun SDK nativo, coerentemente con `automotive-architecture-decision.md` (Task 5) e ADR-0003 ("no automotive SDK"). Nessun componente React Native, nessuna route, nessuna dipendenza aggiunta.

## 1. Perché solo S04 e S03

`automotive-feasibility.md` §1.3/§2.3 classifica le 4 schermate mobile così: S04 (impianti vicini) è "ottimo fit" per entrambe le piattaforme (nessun input testuale, corrisponde letteralmente alla categoria `POI`); S03 (dettaglio) è "compatibile" come `Pane` raggiunta da un elenco; S01/S02 (ricerca testuale) sono "compatibili solo in parte", perché richiedono testo libero da tastiera — input esplicitamente sconsigliato alla guida (`textEntry: false` per entrambe le piattaforme, `platform-capabilities.md` §3) — e la loro riprogettazione (solo da fermo, o tramite voce) è una decisione di prodotto non ancora presa (`automotive-architecture-decision.md`, "domande aperte").

Questo modulo modella quindi solo le due schermate già "pronte" concettualmente: una lista di POI (S04-shaped, riusabile anche per S01/S02 se in futuro produrranno una lista compatibile) e un dettaglio a righe piatte (S03-shaped). Non introduce alcun comando di ricerca testuale.

## 2. Nota sullo stato delle vertical slice mobile sorgente

VS5 (S04, impianti vicini) e VS4 (S02) **non sono ancora implementate** (`feature-backlog.md`); anche VS3 (S03) è solo una shell senza hook dati reale. Questo modulo non dipende dal loro completamento: mappa direttamente dai tipi applicativi già reali e stabili (`Station`, `Price`, `src/services/motus/types.ts`), con un parametro esplicito `distanceKm` opzionale al posto di un campo `distance_km` sul tipo `Station` che l'endpoint nearby (non ancora costruito) non esiste ancora per produrre. Quando VS5 verrà implementata, la sua risposta si mappa su questo stesso modello senza modifiche al modulo automotive.

## 3. Struttura

```text
src/automotive/
├── types/
│   ├── template.ts     # AutomotiveTemplateKind, view model (place-list/place-detail/message)
│   ├── state.ts         # stati richiesta (loading/empty/error/success + location-denied)
│   ├── capability.ts     # capability richieste per superficie/comando + hasRequiredCapabilities
│   └── index.ts
├── models/
│   ├── stationTitle.ts    # fallback nome_impianto -> bandiera -> id_impianto (identico a VS2)
│   ├── placeItem.ts        # Station (+ distanza opzionale) -> AutomotivePlaceItem
│   ├── placeList.ts         # Station[] -> AutomotivePlaceListViewModel
│   ├── placeDetail.ts        # Station -> AutomotivePlaceDetailViewModel
│   ├── message.ts             # errore/vuoto/posizione negata -> AutomotiveMessageViewModel
│   └── index.ts
├── commands/
│   ├── types.ts    # AutomotiveCommand: refresh-nearby, select-place, back, voice-search
│   ├── effects.ts   # resolveCommandEffect (comando -> effetto dichiarativo), canExecuteCommand
│   └── index.ts
├── adapters/
│   ├── types.ts             # AutomotiveAdapter, AutomotiveRenderPlan, AutomotivePlatform
│   ├── capabilityGuard.ts    # invarianti verificabili (device automotive, piattaforma coerente, righe non vuote)
│   ├── createAdapter.ts       # factory condivisa (stessa logica, capability diverse per piattaforma)
│   ├── androidAutoAdapter.ts   # createAutomotiveAdapter("android-auto")
│   ├── carplayAdapter.ts        # createAutomotiveAdapter("carplay")
│   └── index.ts
└── index.ts   # barrel pubblico
```

Struttura adattata rispetto al deliverable indicativo del Task 14: i test vivono in `__tests__/automotive/` (non in `src/automotive/__tests__/`), per restare coerenti con la convenzione già in uso in tutto il repository (`__tests__/platform/`, `__tests__/services/motus/`, ecc. — nessun test è mai colocato sotto `src/`).

## 4. Comandi e capability richieste

Solo 4 comandi (poche azioni, `AutomotiveCommand` in `commands/types.ts`): `refresh-nearby`, `select-place`, `back`, `voice-search`. Ogni comando richiede `automotive: true`; `voice-search` richiede in aggiunta `voiceInput: true` (`canExecuteCommand`, `commands/effects.ts`) — l'unica combinazione oggi vera per android-auto/carplay (`platform-capabilities.md` §3), mai per ios/android. `resolveCommandEffect` traduce ogni comando in un effetto dichiarativo (`fetch-nearby`, `navigate-to-detail`, `navigate-back`, `voice-search`) senza chiamare alcuna funzione di fetch o di navigazione: né Expo Router né alcuno stack nativo esistono in questo modulo, entrambi vanno collegati dal futuro host nativo (`automotive-feasibility.md` §1.11/§2.11: nessuna vista React Native è renderizzabile su nessuna delle due piattaforme).

## 5. Adapter tipizzati indipendenti dagli SDK

`adapters/createAdapter.ts` produce un `AutomotiveRenderPlan` (`templateKind`, `viewModel` invariato, `warnings`) senza importare alcun modulo nativo — non esiste `androidx.car.app.*` né `CarPlay` in questo repository (ADR-0003). `androidAutoAdapter`/`carplayAdapter` condividono la stessa funzione `render`: le due piattaforme hanno oggi lo stesso comportamento di validazione, la differenza reale è nelle `PlatformCapabilities` passate a runtime tramite `DeviceContext` (`src/platform`, Task 8), non nel codice dell'adapter. Le `warnings` prodotte sono invarianti verificabili concretamente, non un tentativo di simulare l'intero ruleset UX automotive (es. il limite di 5 passaggi, `automotive-feasibility.md` §1.5, richiede un contesto di flusso che questo layer — un `render()` per singolo view model — non ha):

- il `DeviceContext` passato non è un host automotive (`capabilities.automotive === false`);
- il `DeviceContext` passato appartiene a una piattaforma diversa da quella dell'adapter;
- un `place-detail` senza righe (mirror del vincolo già esplicito in VS3, `feature-backlog.md`: "fallback esplicito, non un crash o un campo vuoto silenzioso").

## 6. Cosa NON è stato fatto (rispetto dei vincoli del Task 14)

- Nessun SDK automotive installato, nessun `CarAppService`/`CPTemplateApplicationSceneDelegate`.
- Nessuna schermata React Native esistente presentata come CarPlay/Android Auto: questo modulo non ha componenti React, non renderizza nulla.
- Nessuna duplicazione della UI mobile: i view model automotive sono un sottoinsieme deliberatamente più povero (testo breve, gerarchia piatta, poche azioni), non una copia di `StationsSearchScreen`/`StationDetailScreen`.
- Nessun comando di ricerca testuale libera (S01/S02 esclusi, §1 sopra).

## 7. Test

`__tests__/automotive/`: `models.test.ts` (mapping da fixture `Station`/`Price` osservate dal vivo — `nome_impianto` vuoto su 57660, `prices: []` su 3498, stesse fixture della suite VS2/VS0), `commands.test.ts` (`resolveCommandEffect`, `canExecuteCommand` per piattaforma automotive vs mobile), `capability.test.ts` (`hasRequiredCapabilities` contro i profili reali `ANDROID_AUTO_CAPABILITIES`/`CARPLAY_CAPABILITIES`/`MOBILE_CAPABILITIES` di `src/platform`), `adapters.test.ts` (le due warning condition + passthrough del view model, usando `buildDeviceContext` puro — mai un `Platform.OS` reale, coerente con `platform-capabilities.md` §1: nessun automotive risolvibile a runtime).
