# Motus — Rapporto di rilascio (Task 18 — Completamento app mobile)

Data: 2026-08-05. Copre tutti i task da 1 a 18 eseguiti su `Motus-frontend`
(vedi `git log`). Task 18 completa le quattro vertical slice di schermata
(S01–S04) e la shell di navigazione tra i loro punti di ingresso — le uniche
rimaste incomplete dopo la stabilizzazione del Task 17 (`feature-backlog.md`
VS3/VS4/VS5/VS6). Nessun refactoring cosmetico oltre a quanto richiesto per
completare queste vertical slice.

## 1. Funzionalità implementate

| Funzionalità                    | Stato       | Dettaglio                                                                                                                                                             |
| ------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S01 — Ricerca impianti          | ✅ Completa | `useStationsSearch` + `StationsSearchScreen` (Task 13): filtri, paginazione a offset, retry dell'ultima richiesta, stati loading/success/empty/error, naviga a S03    |
| S03 — Dettaglio impianto        | ✅ Completa | `useStationDetail` + `StationDetailScreen` (Task 18): dati reali, prezzi, fallback coordinate mancanti, stato `not-found` distinto da errore generico, retry          |
| S02 — Ricerca prezzi carburante | ✅ Completa | `usePricesSearch` + `PricesSearchScreen` (Task 18): tre filtri indipendenti, nessuna chiamata finché un filtro non è impostato, naviga a S03                          |
| S04 — Impianti vicini           | ✅ Completa | `useNearbyStations` + `NearbyStationsScreen` (Task 18): permesso posizione, servizi di localizzazione, `stations.nearby`, naviga a S03                                |
| Shell di navigazione (VS6)      | ✅ Completa | Home (`src/app/index.tsx`) con 3 punti di ingresso reali, tutti raggiungono S03 (Task 18)                                                                             |
| Client API generico             | ✅ Completo | `src/services/motus/client.ts`: `fetch`, timeout, `AbortSignal`, normalizzazione errori in `ApiError` (Task 7)                                                        |
| Kit UI condiviso stati lista    | ✅ Completo | `FunctionalList`/`LoadingPanel`/`EmptyState`/`ErrorState`/`ListScreenTemplate` (Task 11–12)                                                                           |
| Sistema di platform capability  | ✅ Completo | `src/platform`: rilevamento `ios`/`android` a runtime, capability tipizzate anche per `android-auto`/`carplay` mai risolte a runtime (Task 8)                         |
| Design token                    | ✅ Completo | `src/theme/tokens.ts`, unica fonte per TypeScript/Tailwind/adapter (Task 10)                                                                                          |
| Modello condiviso automotive    | ✅ Completo | `src/automotive`: tipi, mapping `Station`→view model, comandi, adapter tipizzati, nessun SDK nativo (Task 14)                                                         |
| Scaffolding nativo Android Auto | ⚠️ Parziale | `native/android-auto/` + config plugin isolato, non compilato, non registrato in `app.json` (Task 15) — vedi §3. Non toccato in Task 18 (priorità esplicita a mobile) |
| Identità visiva / brand         | ✅ Completo | Asset e guida di brand (Task 9), token colore derivati                                                                                                                |

## 2. Funzionalità parziali

- **Android Auto**: scaffolding tecnicamente corretto (7 file Kotlin + config
  plugin), ma non compilato in nessuna sessione di sviluppo (nessun
  toolchain Java/Android SDK disponibile), non testato su Desktop Head
  Unit/Emulator, `MotusDataSource` è un'interfaccia vuota non implementata.
  Fuori perimetro del Task 18 per vincolo esplicito ("Android Auto e CarPlay
  non devono rallentare o bloccare il completamento dell'app mobile").
  Dettagli: `docs/motus/android-auto-integration.md`.

Nessuna schermata mobile (S01–S04) resta parziale a fine Task 18.

## 3. Funzionalità non implementate (bloccate da requisito, non da tecnica)

- **Apple CarPlay**: bloccato allo stato `requires-product-clarification`,
  nessun codice nativo, nessun entitlement richiesto. Vedi
  `docs/motus/carplay-integration.md`.
- **Autenticazione, dark mode definitivo, offline/cache persistente**: fuori
  perimetro per assenza di requisito di prodotto (`open-questions.md`,
  `feature-backlog.md` "Fuori da questo backlog").

Nessuna schermata o flusso mobile documentato in `screen-inventory.md`/
`user-flows.md` risulta `missing`, `placeholder` o `implemented-but-not-wired`
a fine Task 18 — vedi `docs/motus/mobile-completion-matrix.md`.

## 4. Endpoint verificati

Verificati dal vivo contro il backend reale, sia in Task 3 (`api-contract.md`)
sia direttamente in questa sessione (`EXPO_PUBLIC_API_URL` si è rivelato
raggiungibile dall'ambiente di esecuzione — §11, `mobile-completion-matrix.md`
"Verifica dal vivo eseguita in questa sessione"):

| Endpoint                   | Verificato dal vivo | Consumato da un modulo client                                              |
| -------------------------- | ------------------- | -------------------------------------------------------------------------- |
| `GET /health`              | ✅                  | No (nessuna schermata lo usa, per scelta di prodotto tracciata dal Task 2) |
| `GET /api/stations`        | ✅                  | ✅ `stations.search` (S01)                                                 |
| `GET /api/stations/{id}`   | ✅                  | ✅ `stations.getById` (S03, Task 18)                                       |
| `GET /api/prices`          | ✅                  | ✅ `prices.search` (S02, Task 18)                                          |
| `GET /api/stations/nearby` | ✅                  | ✅ `stations.nearby` (S04, Task 18)                                        |

Tutti e 4 gli endpoint applicativi sono ora consumati da un modulo client
reale e collegato a una schermata raggiungibile dall'utente. Incongruenze
note e isolate lato client (non propagate alla UI): `total` vs
`total_available` (ADR-0001, normalizzato anche per `stations.nearby` in
questo task); `Station` e `PriceRow` restano tipi distinti per scelta
esplicita, non forzati a una forma comune.

## 5. Asset creati

21 file in `assets/` (icone adattive Android, favicon web, icona/splash app,
simboli e loghi di brand in PNG + SVG — versioni chiara/scura/monocromatica),
prodotti nel Task 9. Nessun font incluso (`assets/fonts/` resta vuota, nessun
typeface approvato dal brand). Nessun asset aggiunto in Task 18 (nessuna
nuova icona/immagine richiesta dalle schermate completate).

## 6. Schermate realizzate

| ID  | Schermata          | Stato UI                                                                          |
| --- | ------------------ | --------------------------------------------------------------------------------- |
| S01 | Ricerca impianti   | Completa (route `src/app/stations/index.tsx`)                                     |
| S03 | Dettaglio impianto | Completa (route `src/app/stations/[id].tsx`) — hook dati reale aggiunto Task 18   |
| S02 | Ricerca prezzi     | Completa (route `src/app/prices/index.tsx`, nuova Task 18)                        |
| S04 | Impianti vicini    | Completa (route `src/app/nearby/index.tsx`, nuova Task 18)                        |
| —   | Home (`HomeRoute`) | Completa (`src/app/index.tsx`) — sostituisce il bootstrap `SetupScreen` (Task 18) |

## 7. Componenti Atomic Design

| Livello   | Componenti                                                                        | Conteggio |
| --------- | --------------------------------------------------------------------------------- | --------- |
| atoms     | `AppText`, `Button`, `TextInput`, `Spinner`                                       | 4         |
| molecules | `ListItem`, `SearchControl`, `EmptyState`, `ErrorState`, `CompactCard`, `InfoRow` | 6         |
| organisms | `FunctionalList`, `LoadingPanel`, `InfoPanel`, `AppHeader`                        | 4         |
| templates | `ListScreenTemplate`, `ScrollScreenTemplate`, `ScreenTemplate`                    | 3         |

Nessun nuovo componente condiviso introdotto in Task 18: S02/S04 riusano
interamente il kit esistente (`FunctionalList`, `ListItem`, atoms), coerente
con la regola "un componente si promuove solo quando serve a ≥ 2 feature"
(già soddisfatta prima di questo task). Ogni componente ha un test dedicato
in `__tests__/components/<livello>/`.

## 8. Architettura adottata

Architettura a livelli per vertical slice: `app` (route Expo Router, solo
composizione) → `features` (screen + hook dati locali, isolate tra loro) →
(`components` Atomic Design + `services/motus` + `stores` Zustand) →
`theme` (token semantici, unica fonte di verità). Automotive (`src/automotive`,
`src/platform`) è un layer parallelo, deliberatamente non accoppiato al
mobile (ADR-0003): nessun componente mobile importa da `src/automotive` e
viceversa nessun modulo automotive importa componenti React Native — solo
`src/services/motus` (tipi/funzioni pure) è condiviso da entrambi.

Task 18 aggiunge tre nuove feature (`station-detail` completata,
`prices-search`, `nearby-stations`) seguendo lo stesso pattern di S01: ogni
schermata possiede il proprio hook dati (`useStationDetail`,
`usePricesSearch`, `useNearbyStations`) con stato locale via `useState`, mai
promosso a Zustand (ADR-0004 — nessuna seconda schermata consuma questo
stato). Due funzioni condivise sono state estratte da `StationsSearchScreen`
verso `src/services/motus/stationDisplay.ts` (`cheapestPrice`, oltre a
`stationTitle` già estratto nel Task 17) perché riusate da S04; una nuova
utility di normalizzazione data (`src/services/motus/priceFormat.ts`,
`parseDataComunicazione`/`formatDataComunicazione`) è condivisa da S02/S03
per il formato non-ISO `GG/MM/AAAA HH:MM:SS`. Decisioni tracciate come ADR:
normalizzazione contratto API (0001), nessuna libreria di data-fetching
(0002), automotive non accoppiato (0003), Zustand solo per stato condiviso
reale (0004), navigazione costruita incrementalmente (0005, applicata in
questo task per VS6). Dettaglio completo: `docs/motus/architecture.md`.

## 9. Dipendenze aggiunte

**Una**: `expo-location@~19.0.8` (Task 18, VS5 — unica dipendenza pianificata
dal backlog, `feature-backlog.md`), installata con `npx expo install
expo-location` per garantire la versione compatibile con Expo SDK 54. Config
plugin registrato in `app.json` (`locationWhenInUsePermission` per iOS);
Android non richiede configurazione aggiuntiva (`ACCESS_COARSE_LOCATION`/
`ACCESS_FINE_LOCATION` aggiunti automaticamente dal modulo). Nessun'altra
dipendenza aggiunta in nessun task da 1 a 18.

## 10. Test eseguiti

`pnpm test -- --runInBand`: **46 suite, 249 test, tutti superati**, 0
falliti, 0 skippati.

| Area                                                                                          | Suite di test |
| --------------------------------------------------------------------------------------------- | ------------- |
| Componenti (atoms/molecules/organisms/templates)                                              | 16            |
| Automotive (modelli, comandi, capability, adapter, contratto nativo, gate CarPlay)            | 6             |
| Servizi (`client`, `config`, `errors`, `stations`, `prices`, `priceFormat`, `stationDisplay`) | 7             |
| Feature (screen + hook S01/S02/S03/S04)                                                       | 8             |
| Piattaforma (capability, device context)                                                      | 2             |
| Theme (token, shadow)                                                                         | 2             |
| Plugin (manifest Android Auto)                                                                | 1             |
| App (Home, shell di navigazione S01/S02/S03/S04)                                              | 2             |
| Root (`AppText`, `useAppStore`)                                                               | 2             |

Nessun test esegue chiamate di rete reali (mock a `fetch`, al modulo servizio
o a `expo-location`, `testing-strategy.md` §2) — la verifica dal vivo contro
il backend reale (§4, `mobile-completion-matrix.md`) è stata eseguita
separatamente con chiamate dirette, non come parte della suite Jest. Nessuna
soglia di copertura numerica imposta (`pnpm test:coverage` disponibile ma non
gated in CI, motivazione già tracciata in `repository-audit.md`).

## 11. Risultato dei controlli

Eseguiti in questa sessione, sull'albero di lavoro corrente:

| Controllo                            | Comando                                          | Esito                                                                                                                                                    |
| ------------------------------------ | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lint                                 | `pnpm lint`                                      | ✅ Nessun errore                                                                                                                                         |
| Formattazione                        | `pnpm format:check`                              | ✅ Tutti i file conformi a Prettier                                                                                                                      |
| Type checking                        | `pnpm typecheck`                                 | ✅ Nessun errore (`tsc --noEmit`)                                                                                                                        |
| Test                                 | `pnpm test -- --runInBand`                       | ✅ 46/46 suite, 249/249 test                                                                                                                             |
| Diagnostica Expo                     | `npx expo-doctor`                                | ✅ 17/17 controlli superati                                                                                                                              |
| Verifica dal vivo backend reale      | chiamate `GET` dirette (§4)                      | ✅ 4/4 endpoint applicativi verificati, schema di risposta conforme ai tipi client                                                                       |
| Verifica Git (segreti/file generati) | `git status`, `git ls-files`, `git check-ignore` | ✅ Nessun segreto tracciato, nessuna cartella `ios/`/`android/`/`node_modules` committata, `.env` correttamente ignorato (solo `.env.example` tracciato) |

Build di sviluppo/simulatori/emulatori **non eseguibili in questo ambiente**
(nessun Xcode, nessun Android Studio/SDK, nessun simulatore/emulatore
disponibile nella sessione): non dichiarati "verificati" per non violare il
vincolo "non dichiarare completato ciò che non è stato verificato". Diversa è
la situazione del backend: `EXPO_PUBLIC_API_URL` (`http://192.168.1.148:8080`)
si è rivelato raggiungibile in questa sessione, e i 4 endpoint applicativi
sono stati verificati dal vivo con chiamate dirette (§4). Verifica manuale
dell'app su simulatore iOS/emulatore Android reale resta un'attività separata
prima del rilascio.

## 12. Stato iOS

App mobile (tutte e 4 le schermate + shell di navigazione): nessun blocco
tecnico noto. `expo-location` introduce un requisito di permesso
(`NSLocationWhenInUseUsageDescription`, configurato via plugin in `app.json`)
ma nessuna API nativa custom oltre ai moduli Expo standard. **Non verificato
su iOS Simulator in questa sessione** (nessun Xcode/macOS con simulatore
disponibile nell'ambiente di esecuzione) — verifica manuale richiesta prima
del rilascio. CarPlay: bloccato, vedi §3/§15.

## 13. Stato Android

App mobile: stesso stato di iOS, nessun blocco tecnico noto (`expo-location`
aggiunge `ACCESS_COARSE_LOCATION`/`ACCESS_FINE_LOCATION` automaticamente).
**Non verificato su Android Emulator in questa sessione** (nessun Android
SDK/emulatore disponibile). Android Auto: vedi §14 — scaffolding presente,
non compilato, isolato dalla build mobile di default (nessun impatto
sull'app Android standard).

## 14. Stato Android Auto

`feasible-with-native-work` (`automotive-architecture-decision.md`).
Scaffolding tecnicamente corretto (`native/android-auto/`, config plugin in
`plugins/`), collegato ai view model condivisi del Task 14 e verificato
strutturalmente da `__tests__/automotive/nativeContract.test.ts`. Non
compilato, non registrato in `app.json`, non testato su Desktop Head
Unit/Emulator Automotive OS. Non toccato in Task 18 (vincolo esplicito del
task: automotive non deve rallentare il completamento mobile). Elenco
completo delle verifiche manuali mancanti:
`docs/motus/android-auto-integration.md` §9.

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
  end-to-end delle 4 schermate e della shell di navigazione.
- `react-native-css-interop` non traduce `elevation` per le ombre Android
  (verificato leggendo il sorgente della libreria, `design-tokens.md` §4):
  `getShadowStyle()` va usato esplicitamente dove l'ombra deve essere
  visibile anche su Android, la sola className `shadow-*` non basta.
- Nessuna copertura di test per CarPlay: non ha codice da testare, non
  un'omissione.
- `expo-location` richiede una development build (`expo-dev-client`) per
  essere testato con permessi reali su un dispositivo fisico — Expo Go non
  supporta configurazioni di permesso custom. Non verificato in questa
  sessione (nessun dispositivo/simulatore disponibile).

## 17. Assunzioni

- Le 4 schermate (S01–S04) sono un'assunzione derivata dagli endpoint
  disponibili, non da una specifica di prodotto formale (`screen-inventory.md`).
- Porta `8080` per il backend assunta come convenzione di sviluppo (coerente
  con la sessione che ha prodotto `api-contract.md`); in questa sessione il
  backend era raggiungibile su una rete locale (`192.168.1.148:8080`), non
  `localhost` — nessun indirizzo hardcodato nel codice applicativo, solo in
  `.env` (ignorato da Git) e nei suggerimenti testuali di `config.ts`.
- La shell di navigazione (Home con 3 pulsanti, Stack semplice, nessuna tab
  bar) è la scelta più semplice che soddisfa il criterio di completamento di
  VS6, non un'architettura dell'informazione definitiva (ADR-0005).
- `danger`/`warning`/`success` usano gli swatch standard Tailwind in assenza
  di un colore approvato dal brand (`design-tokens.md` §3).
- Nessuna soglia di design "compact" per i telefoni: `ComponentDensity`
  risolve solo `comfortable`/`automotive` (`platform-capabilities.md` §4).

## 18. Attività successive

1. Verifica manuale su iOS Simulator e Android Emulator/dispositivo fisico
   (nessuno disponibile in nessuna sessione finora), incluso il flusso di
   permesso posizione reale per S04 (richiede development build per
   `expo-location` con messaggio di permesso custom).
2. Per Android Auto: ambiente con Java/Android SDK per compilare e testare
   lo scaffolding su Desktop Head Unit/Emulator Automotive OS, poi
   implementare `MotusDataSource` contro il backend reale
   (`android-auto-integration.md` §9).
3. Per CarPlay: risposta di prodotto alle domande aperte in
   `carplay-integration.md`, lettura integrale della CarPlay Developer
   Guide, eventuale richiesta esplorativa di entitlement ad Apple.
4. Decisione di prodotto, se necessaria, su un'evoluzione della shell di
   navigazione (tab bar dedicata) qualora si aggiungessero ulteriori punti
   di ingresso oltre ai 3 attuali.
