# Motus

Base mobile cross-platform per iOS e Android costruita con Expo, React Native,
TypeScript, Expo Router, NativeWind e Zustand. Consulta
[`docs/motus/release-report.md`](docs/motus/release-report.md) per lo stato
di rilascio corrente (funzionalità implementate/parziali/mancanti, esito dei
controlli, limiti noti).

## Prerequisiti

- Expo SDK `54.0.36` (React Native `0.81.5`, React `19.1.0`)
- Node.js `22.13.x` (runtime fissato in `.nvmrc`; compatibile con Expo SDK 54)
- pnpm `9.7.1` (versione dichiarata in `package.json`)
- Per iOS: macOS con Xcode e iOS Simulator installati
- Per Android: Android Studio con un Android Virtual Device (AVD) configurato
- Un'istanza del backend Motus raggiungibile (separato da questo repository)
  in ascolto sulla porta `8080` — vedi "Configurazione `.env`" sotto

## Installazione

Con Corepack:

```sh
corepack enable
corepack prepare pnpm@9.7.1 --activate
pnpm install
```

## Configurazione `.env`

Il client legge la base URL del backend da `EXPO_PUBLIC_API_URL` (mai
hardcodata nei componenti — `src/services/motus/config.ts`). Copia
`.env.example` in `.env` (non tracciato da Git) e imposta il valore in base a
dove gira l'app, assumendo il backend in ascolto su `localhost:8080`:

| Ambiente                           | Valore                        | Perché                                                                                                                                          |
| ---------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| iOS Simulator                      | `http://localhost:8080`       | Il simulatore condivide la rete/host del Mac                                                                                                    |
| Web (`pnpm web`)                   | `http://localhost:8080`       | Stesso browser/host della macchina di sviluppo                                                                                                  |
| Android Emulator                   | `http://10.0.2.2:8080`        | `localhost` nell'emulatore punta all'emulatore stesso, non all'host — `10.0.2.2` è l'alias che Android riserva per l'host                       |
| Dispositivo fisico (iOS o Android) | `http://<ip-lan-del-pc>:8080` | Il dispositivo è su una rete separata dal processo Metro; serve l'IP LAN reale della macchina di sviluppo (es. `192.168.1.42`), mai `localhost` |

Se `EXPO_PUBLIC_API_URL` non è impostato o non è un URL `http(s)` valido, la
prima chiamata di rete lancia un `ApiConfigError` con un suggerimento
specifico per la piattaforma corrente — non fallisce silenziosamente.
Dettagli completi: [`docs/motus/local-setup.md`](docs/motus/local-setup.md);
contratto API verificato dal vivo:
[`docs/motus/api-contract.md`](docs/motus/api-contract.md).

I test automatici **non richiedono** `EXPO_PUBLIC_API_URL` configurato:
nessun test esegue chiamate di rete reali (mock a livello di `fetch` o di
modulo servizio — vedi "Test" sotto).

## Avvio

```sh
pnpm start      # Metro, scegli la piattaforma dal terminale
pnpm ios        # iOS Simulator
pnpm android    # Android Emulator
pnpm web        # Browser (solo sviluppo, mai un target di prodotto)
```

Per un dispositivo fisico: avvia `pnpm start`, imposta l'IP LAN in `.env`
(tabella sopra) e scansiona il QR code con l'app Expo Go, oppure usa una
development build (`expo-dev-client`) se sono presenti moduli nativi custom
(vedi "Stato Android Auto" sotto — non richiesta per l'app mobile standard).

## Comandi di validazione

```sh
pnpm lint           # ESLint (eslint-config-expo)
pnpm format:check   # Prettier
pnpm typecheck      # tsc --noEmit
pnpm test           # Jest (jest-expo, React Native Testing Library)
pnpm validate       # tutti e quattro in sequenza
```

`pnpm validate` è lo stesso comando eseguito in CI
([`.github/workflows/validate.yml`](.github/workflows/validate.yml), Node
`22.13.x`).

## Struttura del progetto

```text
src/
├── app/          # route e layout Expo Router — solo composizione, niente logica di business
├── components/   # Atomic Design: atoms, molecules, organisms, templates
├── features/     # funzionalità verticali (screen + hook dati locali)
├── hooks/        # hook condivisi (vuoto: nessuna feature lo ha ancora richiesto)
├── services/     # client API (src/services/motus)
├── stores/       # stato globale condiviso (Zustand), solo se realmente cross-schermata
├── theme/        # token semantici, unica fonte di verità
├── platform/     # rilevamento piattaforma/capability (ios, android, android-auto, carplay)
├── automotive/   # modello condiviso automotive (tipi/mapping/adapter), nessun SDK nativo
├── types/
├── utils/        # vuoto: nessuna feature lo ha ancora richiesto
├── constants/    # vuoto: nessuna feature lo ha ancora richiesto
└── styles/       # entry point CSS globale

native/android-auto/   # scaffolding Kotlin isolato, non compilato, non nel build di default
plugins/                # config plugin Expo (Android Auto), non registrato in app.json
docs/motus/             # documentazione di processo, decisioni architetturali, ADR
```

Le route in `src/app` compongono feature e template: non ospitano componenti
UI riutilizzabili né chiamate di rete dirette. Gli atoms non dipendono dalle
feature né dallo stato globale; le feature possono comporre atoms, molecules
e organisms. I componenti UI condivisi non accedono mai direttamente ai
servizi API.

## Atomic Design

`src/components` segue la gerarchia atoms → molecules → organisms →
templates:

- **atoms** (`AppText`, `Button`, `TextInput`, `Spinner`): elementi senza
  conoscenza del dominio Motus, senza dipendenze da `services`/`stores`.
- **molecules** (`ListItem`, `SearchControl`, `EmptyState`, `ErrorState`,
  `CompactCard`, `InfoRow`): composizioni con una singola responsabilità di
  presentazione dati.
- **organisms** (`FunctionalList`, `LoadingPanel`, `InfoPanel`, `AppHeader`):
  blocchi con stato locale di presentazione; renderizzano esattamente uno
  stato per prop esplicita (`loading`/`empty`/`error`/`success`), mai dedotto
  implicitamente dai dati.
- **templates** (`ListScreenTemplate`, `ScrollScreenTemplate`,
  `ScreenTemplate`): compongono organism per una _forma_ di schermata,
  riusata da più feature (`ListScreenTemplate` da S01, in futuro S02/S04).

Un componente viene promosso da `features` a `components` solo quando serve
a ≥ 2 feature (regola oggettiva, evita di indovinare in anticipo cosa sarà
condiviso).

## Architettura feature-oriented

Regola di dipendenza a senso unico: `app` → `features` → (`components` +
`services` + `stores`) → `theme`. Ogni feature vive in
`src/features/<nome>/` con il proprio screen component e i propri hook dati
(es. `useStationsSearch`); **nessuna feature importa da un'altra feature** —
ciò che deve essere condiviso si sposta in `components`, `services` o
`stores`. Questo mantiene ogni vertical slice sviluppabile e testabile in
isolamento. Dettagli e diagramma completo:
[`docs/motus/architecture.md`](docs/motus/architecture.md); decisioni
puntuali tracciate come ADR in [`docs/motus/adr/`](docs/motus/adr/).

Stato reale delle vertical slice: vedi
[`docs/motus/release-report.md`](docs/motus/release-report.md) e
[`docs/motus/feature-backlog.md`](docs/motus/feature-backlog.md).

## Client API

`src/services/motus` centralizza parsing JSON, timeout, cancellazione via
`AbortSignal` e normalizzazione degli errori in una gerarchia tipizzata
(`ApiError`: `ApiConfigError`, `ApiNetworkError`, `ApiTimeoutError`,
`ApiAbortError`, `ApiHttpError`, `ApiInvalidResponseError`). Solo l'endpoint
`stations.search` (`GET /api/stations`) ha oggi un modulo cliente
implementato; gli altri endpoint verificati nel contratto
(`stations.getById`, `stations.nearby`, `prices.search`) vengono aggiunti
quando la rispettiva vertical slice viene implementata.

## Design system

**Unica fonte di verità**: [`src/theme/tokens.ts`](src/theme/tokens.ts).
Ogni valore (colore, spaziatura, tipografia, radius, ombra, icon size, touch
target, density) esiste in questo file una sola volta; tre consumatori vi
leggono senza mai ridigitarlo: i moduli TypeScript (`src/theme`), Tailwind
(`tailwind.config.js`, via `require("./src/theme/tokens")`) e l'adapter di
piattaforma (`src/theme/shadowStyle.ts`, `Platform.OS`-aware). I componenti
usano `className` con token semantici (`bg-background`, `text-foreground`,
`text-primary`, ...), mai valori hardcoded o hex diretti.

`danger`/`warning`/`success` restano sugli swatch standard Tailwind in
attesa di un colore approvato dal brand; nessun `fontFamily` è definito
(`assets/fonts/` è vuota, nessun typeface scelto); il dark mode è preparato
ma non attivato (nessun requisito di prodotto). Dettagli:
[`docs/motus/design-tokens.md`](docs/motus/design-tokens.md),
[`docs/motus/brand-guidelines.md`](docs/motus/brand-guidelines.md).

`expo-system-ui` abilita `userInterfaceStyle: "automatic"` e
`expo-splash-screen` configura lo splash tramite plugin Expo, entrambi nel
workflow CNG (Continuous Native Generation).

## MCP utilizzato

Nessun server MCP di terze parti è configurato per questo progetto (nessuna
voce in `mcpServers` globale o di progetto, nessun `.mcp.json` nel
repository). L'unica capacità di dominio "design" disponibile in sessione è
`DesignSync`, uno strumento nativo di Claude Code (non un server MCP
registrato) che sincronizza file con un progetto design-system su
claude.ai/design via OAuth — oggi **nessun progetto Motus esiste** su quello
strumento (`list_projects` → array vuoto). Non genera autonomamente
schermate, componenti o token: è un meccanismo di sincronizzazione, non
generativo. Audit completo:
[`docs/motus/mcp-audit.md`](docs/motus/mcp-audit.md).

## Stato del supporto Android Auto

**`feasible-with-native-work`** (`docs/motus/automotive-architecture-decision.md`).
Scaffolding tecnicamente corretto presente in `native/android-auto/`
(`CarAppService`, `Session`, `Screen` Kotlin) e in `plugins/` (config
plugin), **non compilato in questa toolchain** (nessun Java/Android SDK
disponibile nell'ambiente di sviluppo usato finora) e **non registrato in
`app.json`**: non fa parte della build mobile di default, per costruzione
(ADR-0003 — l'automotive non deve accoppiare l'architettura mobile). Il
collegamento ai view model condivisi (`src/automotive/`) è verificato da
`__tests__/automotive/nativeContract.test.ts`, che confronta le chiavi JSON
prodotte lato TypeScript con quelle lette dal parser Kotlin. Verifiche
manuali ancora necessarie (Gradle, Desktop Head Unit/Emulator Automotive OS,
implementazione del data source verso il backend reale): elencate in
[`docs/motus/android-auto-integration.md`](docs/motus/android-auto-integration.md)
§9.

## Stato del supporto CarPlay

**`requires-product-clarification`** — **bloccato**, non per un limite
tecnico ma per due incertezze che nessun lavoro di ingegneria in questo
repository può risolvere: (1) se la categoria CarPlay "Fueling" richieda
funzionalità transazionali che Motus (puramente informativo) non ha, e (2)
l'esito discrezionale della richiesta di entitlement Apple, valutata caso
per caso. Nessun codice nativo, config plugin o entitlement è stato scritto
o falsificato. Report di blocco completo, incluse le domande da portare al
prodotto/business prima di sbloccare lo stato:
[`docs/motus/carplay-integration.md`](docs/motus/carplay-integration.md).

## Limitazioni note

- Solo S01 (ricerca impianti) è una vertical slice completa end-to-end. S03
  (dettaglio impianto) è una shell UI senza hook dati reale (mostra
  l'`id_impianto` ricevuto, non ancora i dati dell'impianto). S02 (ricerca
  prezzi), S04 (impianti vicini) e la shell di navigazione tra i tre punti
  di ingresso **non sono implementate**.
- Nessuna autenticazione, nessuna libreria di data-fetching/cache (ADR-0002),
  nessuno stato Zustand di business (`useAppStore`/`isAppReady` resta uno
  store dimostrativo, ADR-0004), nessun dark mode attivato, nessuna
  geolocalizzazione installata (richiesta solo da S04, non ancora
  implementata).
- Nessun ambiente con toolchain nativa (Java/Android SDK, Xcode) è stato
  disponibile durante lo sviluppo per compilare o testare lo scaffolding
  Android Auto, né per richiedere/verificare l'entitlement CarPlay.
- `pnpm web` è un ambiente di solo sviluppo, mai un target di prodotto.

## Test

Suite Jest (`jest-expo` + React Native Testing Library), nessuna chiamata di
rete reale in nessun test (mock a livello di `fetch` o di modulo servizio):
statico (`tsc`, ESLint, Prettier) → unit (normalizzazione contratto API,
mapping) → componenti (rendering, stati visivi) → hook di dati → store →
integrazione schermata. Le fixture riproducono casi osservati dal vivo
contro il backend reale (`nome_impianto` vuoto, `prices: []`, formati di
data non ISO, 400/404/500 documentati). Nessun E2E introdotto (richiederebbe
una nuova dipendenza, vietata in questa fase). Dettagli:
[`docs/motus/testing-strategy.md`](docs/motus/testing-strategy.md); esito
corrente: [`docs/motus/release-report.md`](docs/motus/release-report.md).

## Nuove feature

Creare ogni feature in `src/features/<feature>`, mantenendo locale lo stato
non condiviso. Esporre UI riutilizzabile da `src/components` al livello
Atomic Design appropriato, registrare le route in `src/app` e aggiungere
test osservabili in `__tests__` o accanto alla feature quando crescerà.

## Documentazione

Tutta la documentazione di processo, le decisioni architetturali e gli ADR
vivono in [`docs/motus/`](docs/motus/). Punti di ingresso utili:
`architecture.md` (visione d'insieme), `feature-backlog.md` (vertical
slice), `api-contract.md` (contratto backend verificato dal vivo),
`release-report.md` (stato di rilascio corrente).
