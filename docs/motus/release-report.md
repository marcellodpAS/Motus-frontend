# Motus — Rapporto di rilascio (Task 17, Fase 6 — Stabilizzazione)

Data: 2026-08-05. Copre tutti i task da 1 a 17 eseguiti su `Motus-frontend`
(vedi `git log`). Nessuna nuova feature introdotta in questo task: solo
verifica, rimozione di duplicazione/debito rilevato, documentazione e
reportistica.

## 1. Funzionalità implementate

| Funzionalità                    | Stato       | Dettaglio                                                                                                                                                          |
| ------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| S01 — Ricerca impianti          | ✅ Completa | `useStationsSearch` + `StationsSearchScreen` (Task 13): filtri, paginazione a offset, retry dell'ultima richiesta, stati loading/success/empty/error, naviga a S03 |
| Client API generico             | ✅ Completo | `src/services/motus/client.ts`: `fetch`, timeout, `AbortSignal`, normalizzazione errori in `ApiError` (Task 7)                                                     |
| Kit UI condiviso stati lista    | ✅ Completo | `FunctionalList`/`LoadingPanel`/`EmptyState`/`ErrorState`/`ListScreenTemplate` (Task 11–12)                                                                        |
| Sistema di platform capability  | ✅ Completo | `src/platform`: rilevamento `ios`/`android` a runtime, capability tipizzate anche per `android-auto`/`carplay` mai risolte a runtime (Task 8)                      |
| Design token                    | ✅ Completo | `src/theme/tokens.ts`, unica fonte per TypeScript/Tailwind/adapter (Task 10)                                                                                       |
| Modello condiviso automotive    | ✅ Completo | `src/automotive`: tipi, mapping `Station`→view model, comandi, adapter tipizzati, nessun SDK nativo (Task 14)                                                      |
| Scaffolding nativo Android Auto | ⚠️ Parziale | `native/android-auto/` + config plugin isolato, non compilato, non registrato in `app.json` (Task 15) — vedi §3                                                    |
| Identità visiva / brand         | ✅ Completo | Asset e guida di brand (Task 9), token colore derivati                                                                                                             |

## 2. Funzionalità parziali

- **S03 — Dettaglio impianto**: solo shell (`StationDetailScreen`), mostra
  l'`id_impianto` ricevuto dalla route ma non ha ancora un hook dati reale
  verso `GET /api/stations/{id}` (VS3 non completata, `feature-backlog.md`).
- **Android Auto**: scaffolding tecnicamente corretto (7 file Kotlin + config
  plugin), ma non compilato in nessuna sessione di sviluppo (nessun
  toolchain Java/Android SDK disponibile), non testato su Desktop Head
  Unit/Emulator, `MotusDataSource` è un'interfaccia vuota non implementata.
  Dettagli: `docs/motus/android-auto-integration.md`.

## 3. Funzionalità non implementate

- **S02 — Ricerca prezzi per carburante** (VS4): nessun modulo `prices.ts`,
  nessuna schermata cablata.
- **S04 — Impianti vicini** (VS5): nessun modulo `nearby`, nessuna
  geolocalizzazione installata (`expo-location` mai aggiunto).
- **Shell di navigazione tra punti di ingresso** (VS6): dipende da VS4/VS5,
  non ancora raggiungibile.
- **Apple CarPlay**: bloccato allo stato `requires-product-clarification`,
  nessun codice nativo, nessun entitlement richiesto. Vedi
  `docs/motus/carplay-integration.md`.
- **Autenticazione, dark mode definitivo, offline/cache persistente**: fuori
  perimetro per assenza di requisito di prodotto (`open-questions.md`,
  `feature-backlog.md` "Fuori da questo backlog").

## 4. Endpoint verificati

Verificati dal vivo contro il backend reale in `docs/motus/api-contract.md`:

| Endpoint                   | Verificato dal vivo | Consumato da un modulo client |
| -------------------------- | ------------------- | ----------------------------- |
| `GET /health`              | ✅                  | No (nessuna schermata lo usa) |
| `GET /api/stations`        | ✅                  | ✅ `stations.search`          |
| `GET /api/stations/{id}`   | ✅                  | ❌ non ancora implementato    |
| `GET /api/prices`          | ✅                  | ❌ non ancora implementato    |
| `GET /api/stations/nearby` | ✅                  | ❌ non ancora implementato    |

Incongruenze note e isolate lato client (non propagate alla UI): `total` vs
`total_available` (ADR-0001); `Station` e `PriceRow` restano tipi distinti
per scelta esplicita, non forzati a una forma comune.

## 5. Asset creati

21 file in `assets/` (icone adattive Android, favicon web, icona/splash app,
simboli e loghi di brand in PNG + SVG — versioni chiara/scura/monocromatica),
prodotti nel Task 9. Nessun font incluso (`assets/fonts/` resta vuota, nessun
typeface approvato dal brand).

## 6. Schermate realizzate

| ID  | Schermata          | Stato UI                                                                     |
| --- | ------------------ | ---------------------------------------------------------------------------- |
| S01 | Ricerca impianti   | Completa (route `src/app/stations/index.tsx`)                                |
| S03 | Dettaglio impianto | Shell (route `src/app/stations/[id].tsx`)                                    |
| S02 | Ricerca prezzi     | Non realizzata                                                               |
| S04 | Impianti vicini    | Non realizzata                                                               |
| —   | Setup/landing      | Realizzata (`src/app/index.tsx`, punto di ingresso originario del bootstrap) |

## 7. Componenti Atomic Design

| Livello   | Componenti                                                                        | Conteggio |
| --------- | --------------------------------------------------------------------------------- | --------- |
| atoms     | `AppText`, `Button`, `TextInput`, `Spinner`                                       | 4         |
| molecules | `ListItem`, `SearchControl`, `EmptyState`, `ErrorState`, `CompactCard`, `InfoRow` | 6         |
| organisms | `FunctionalList`, `LoadingPanel`, `InfoPanel`, `AppHeader`                        | 4         |
| templates | `ListScreenTemplate`, `ScrollScreenTemplate`, `ScreenTemplate`                    | 3         |

Ogni componente ha un test dedicato in `__tests__/components/<livello>/`.

## 8. Architettura adottata

Architettura a livelli per vertical slice: `app` (route Expo Router, solo
composizione) → `features` (screen + hook dati locali, isolate tra loro) →
(`components` Atomic Design + `services/motus` + `stores` Zustand) →
`theme` (token semantici, unica fonte di verità). Automotive (`src/automotive`,
`src/platform`) è un layer parallelo, deliberatamente non accoppiato al
mobile (ADR-0003): nessun componente mobile importa da `src/automotive` e
viceversa nessun modulo automotive importa componenti React Native — solo
`src/services/motus` (tipi/funzioni pure) è condiviso da entrambi, incluso
`stationTitle`, spostato in questo task da due copie letterali (una nella
schermata S01, una in `src/automotive/models`) a un'unica implementazione in
`src/services/motus/stationDisplay.ts` — l'unica duplicazione riscontrata
nell'audit di stabilizzazione. Decisioni tracciate come ADR: normalizzazione contratto API (0001),
nessuna libreria di data-fetching (0002), automotive non accoppiato (0003),
Zustand solo per stato condiviso reale (0004), navigazione costruita
incrementalmente (0005). Dettaglio completo: `docs/motus/architecture.md`.

## 9. Dipendenze aggiunte

**Nessuna**, in nessun task da 1 a 17. Tutte le dipendenze in `package.json`
risalgono al bootstrap iniziale del repository (Expo, Expo Router,
NativeWind, Zustand, React Native core e i suoi peer — reanimated,
gesture-handler, screens, worklets, safe-area-context, css-interop). Vincolo
esplicito rispettato in ogni vertical slice (ADR-0002); l'unica dipendenza
pianificata ma non ancora aggiunta è `expo-location`, riservata all'avvio
della vertical slice S04 (VS5).

## 10. Test eseguiti

`pnpm test -- --runInBand`: **38 suite, 195 test, tutti superati**, 0
falliti, 0 skippati.

| Area                                                                               | Suite di test |
| ---------------------------------------------------------------------------------- | ------------- |
| Componenti (atoms/molecules/organisms/templates)                                   | 16            |
| Automotive (modelli, comandi, capability, adapter, contratto nativo, gate CarPlay) | 6             |
| Servizi (`client`, `config`, `errors`, `stations`)                                 | 4             |
| Feature (screen + hook S01, shell S03)                                             | 3             |
| Piattaforma (capability, device context)                                           | 2             |
| Theme (token, shadow)                                                              | 2             |
| Plugin (manifest Android Auto)                                                     | 1             |
| App (navigazione, root)                                                            | 1             |
| Root (`AppText`, `SetupScreen`, `useAppStore`)                                     | 3             |

Nessun test esegue chiamate di rete reali (mock a `fetch` o al modulo
servizio, `testing-strategy.md` §2). Nessuna soglia di copertura numerica
imposta (`pnpm test:coverage` disponibile ma non gated in CI, per evitare
una copertura 100% su codice non ancora maturo — motivazione già
tracciata in `repository-audit.md`).

## 11. Risultato dei controlli

Eseguiti in questa sessione, sull'albero di lavoro corrente:

| Controllo                            | Comando                                          | Esito                                                                                                                                                    |
| ------------------------------------ | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lint                                 | `pnpm lint`                                      | ✅ Nessun errore                                                                                                                                         |
| Formattazione                        | `pnpm format:check`                              | ✅ Tutti i file conformi a Prettier                                                                                                                      |
| Type checking                        | `pnpm typecheck`                                 | ✅ Nessun errore (`tsc --noEmit`)                                                                                                                        |
| Test                                 | `pnpm test -- --runInBand`                       | ✅ 38/38 suite, 195/195 test                                                                                                                             |
| Diagnostica Expo                     | `npx expo-doctor`                                | ✅ 17/17 controlli superati                                                                                                                              |
| Verifica Git (segreti/file generati) | `git status`, `git ls-files`, `git check-ignore` | ✅ Nessun segreto tracciato, nessuna cartella `ios/`/`android/`/`node_modules` committata, `.env` correttamente ignorato (solo `.env.example` tracciato) |

Build di sviluppo/simulatori/emulatori **non eseguibili in questo ambiente**
(nessun Xcode, nessun Android Studio/SDK, nessun simulatore/emulatore
disponibile nella sessione): non dichiarati "verificati" per non violare il
vincolo "non dichiarare completato ciò che non è stato verificato". Verifica
manuale su simulatore iOS/emulatore Android resta un'attività di QA separata
prima del rilascio (già segnalato in `feature-backlog.md` VS2, Task 13).

## 12. Stato iOS

App mobile (S01, setup screen): nessun blocco tecnico noto, nessuna API
nativa custom richiesta oltre ai moduli Expo standard già installati.
**Non verificato su iOS Simulator in questa sessione** (nessun Xcode/macOS
con simulatore disponibile nell'ambiente di esecuzione) — verifica manuale
richiesta prima del rilascio. CarPlay: bloccato, vedi §3/§14.

## 13. Stato Android

App mobile: stesso stato di iOS, nessun blocco tecnico noto, **non
verificato su Android Emulator in questa sessione** (nessun Android
SDK/emulatore disponibile). Android Auto: vedi §15 — scaffolding presente,
non compilato, isolato dalla build mobile di default (nessun impatto
sull'app Android standard).

## 14. Stato Android Auto

`feasible-with-native-work` (`automotive-architecture-decision.md`).
Scaffolding tecnicamente corretto (`native/android-auto/`, config plugin in
`plugins/`), collegato ai view model condivisi del Task 14 e verificato
strutturalmente da `__tests__/automotive/nativeContract.test.ts`. Non
compilato, non registrato in `app.json`, non testato su Desktop Head
Unit/Emulator Automotive OS. Elenco completo delle verifiche manuali
mancanti: `docs/motus/android-auto-integration.md` §9.

## 15. Stato CarPlay

`requires-product-clarification`. Bloccato su base prodotto/business (due
incertezze: idoneità alla categoria "Fueling" e discrezionalità
dell'approvazione entitlement Apple), non su base tecnica. Nessun codice
nativo, config plugin o entitlement scritto o richiesto. Report di blocco
completo con criterio di sblocco futuro: `docs/motus/carplay-integration.md`.

## 16. Limiti tecnici

- Nessun ambiente con toolchain nativa (Java/Android SDK, Xcode) disponibile
  in nessuna sessione di sviluppo: impossibile compilare lo scaffolding
  Android Auto o eseguire build native/di sviluppo in questo task.
- Nessun simulatore iOS/emulatore Android disponibile per verifica manuale
  end-to-end delle schermate esistenti.
- `react-native-css-interop` non traduce `elevation` per le ombre Android
  (verificato leggendo il sorgente della libreria, `design-tokens.md` §4):
  `getShadowStyle()` va usato esplicitamente dove l'ombra deve essere
  visibile anche su Android, la sola className `shadow-*` non basta.
- Nessuna copertura di test per S02/S04/VS6/CarPlay: non hanno codice da
  testare, non un'omissione.

## 17. Assunzioni

- Le 4 schermate (S01–S04) sono un'assunzione derivata dagli endpoint
  disponibili, non da una specifica di prodotto formale (`screen-inventory.md`).
- Porta `8080` per il backend locale assunta come convenzione di sviluppo
  (coerente con la sessione che ha prodotto `api-contract.md`), non
  imposta da alcuna configurazione del backend stesso.
- `danger`/`warning`/`success` usano gli swatch standard Tailwind in assenza
  di un colore approvato dal brand (`design-tokens.md` §3).
- Nessuna soglia di design "compact" per i telefoni: `ComponentDensity`
  risolve solo `comfortable`/`automotive` (`platform-capabilities.md` §4).

## 18. Attività successive

1. Verifica manuale su iOS Simulator e Android Emulator/dispositivo fisico
   (nessuno disponibile in questa sessione).
2. Decisione di prodotto su S02/S04 (ricerca prezzi, impianti vicini) e
   priorità di implementazione (VS4/VS5, `feature-backlog.md`).
3. Implementazione dell'hook dati reale per S03 (VS3) prima di considerarla
   completa.
4. Per Android Auto: ambiente con Java/Android SDK per compilare e testare
   lo scaffolding su Desktop Head Unit/Emulator Automotive OS, poi
   implementare `MotusDataSource` contro il backend reale
   (`android-auto-integration.md` §9).
5. Per CarPlay: risposta di prodotto alle domande aperte in
   `carplay-integration.md`, lettura integrale della CarPlay Developer
   Guide, eventuale richiesta esplorativa di entitlement ad Apple.
6. Quando VS4/VS5 saranno complete: introdurre `expo-location` (unica
   dipendenza pianificata) e la shell di navigazione (VS6).
