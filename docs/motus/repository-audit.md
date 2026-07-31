# Audit tecnico del repository Motus

- Data dell'audit: 31 luglio 2026
- Aggiornamento: adeguamento SDK 54/Node 22.13.x
- Branch analizzato: `develop`
- Commit di partenza: `d5a8841` (`fix(tsconfig): update paths and remove deprecated options`)

## Sintesi esecutiva

Il repository contiene una base applicativa piccola ma funzionante: Expo Router usa correttamente `src/app`, TypeScript è in modalità strict, NativeWind compila per iOS, Android e web, lo scheletro Atomic Design è presente, Zustand ha uno store dimostrativo e i test esistenti passano.

Il progetto è basato su **Expo SDK 54**, coerente con `package.json`, lockfile e configurazione Expo. Il runtime di progetto è stato fissato a Node 22.13.0, anche se il processo usato per questo controllo continua a eseguire Node 20.19.0 perché l'ambiente non dispone di un version manager. Expo SDK 54 supporta React Native 0.81, React 19.1.0 e Node 20.19.x; Node 22.13.x è una scelta di runtime più restrittiva e riproducibile.

Sono state applicate le correzioni di setup rilevate nell'audit precedente: dipendenza Metro non usata rimossa, peer di test riallineato, System UI e splash configurati per CNG, status bar coerente con il tema, claim tablet rimosso, CI aggiunta e documentazione allineata a SDK 54. Gli override transitive versionati per PostCSS, UUID e brace-expansion sono stati verificati con installazione, test, export e audit.

## Metodo e perimetro

Sono stati ispezionati i file tracciati, la struttura delle directory, la configurazione risolta da Expo, il grafo delle dipendenze installate, i file generati di Expo Router e lo stato Git. Sono stati eseguiti controlli statici, prebuild CNG ed export JavaScript. Non sono state avviate build native Xcode/Gradle né prove su simulatore o dispositivo.

Riferimenti usati per il confronto:

- [Expo SDK 54 reference](https://docs.expo.dev/versions/v54.0.0/)
- [Expo SDK 54 app config](https://docs.expo.dev/versions/v54.0.0/config/app/)
- [Expo SDK 54 Babel config](https://docs.expo.dev/versions/v54.0.0/config/babel/)
- [Expo SDK 54 Metro config](https://docs.expo.dev/versions/v54.0.0/config/metro/)
- [Expo SplashScreen SDK 54](https://docs.expo.dev/versions/v54.0.0/sdk/splash-screen/)
- [Expo SystemUI SDK 54](https://docs.expo.dev/versions/v54.0.0/sdk/system-ui/)
- [NativeWind v4: installazione con Expo](https://www.nativewind.dev/docs/getting-started/installation)

## Stack e versioni rilevate

| Area                         | Versione/configurazione rilevata              | Valutazione                                                                     |
| ---------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------- |
| Expo                         | `54.0.36`, SDK risolto `54.0.0`               | Coerente con il target SDK 54                                                   |
| React Native                 | `0.81.5`                                      | Versione attesa da SDK 54                                                       |
| React                        | `19.1.0`                                      | Versione attesa da SDK 54                                                       |
| React DOM                    | `19.1.0`                                      | Allineato al React installato                                                   |
| React Native Web             | `0.21.2`                                      | Compatibile con il setup corrente e usato dall'export web                       |
| Expo Router                  | `6.0.24`                                      | Configurato e funzionante per SDK 54                                            |
| Expo SplashScreen            | `31.0.13`                                     | Config plugin CNG configurato                                                   |
| Expo SystemUI                | `6.0.9`                                       | Config plugin CNG configurato                                                   |
| NativeWind                   | `4.2.6`                                       | Configurazione Babel/Metro conforme alla documentazione v4; export CSS riuscito |
| Tailwind CSS                 | dichiarato `^3.4.17`, installato `3.4.19`     | Compatibile con NativeWind v4                                                   |
| React Native CSS Interop     | `0.2.6`                                       | Dipendenza top-level necessaria al JSX runtime generato da NativeWind           |
| Reanimated                   | `4.1.7`                                       | Coerente con SDK 54 e NativeWind                                                |
| Worklets                     | `0.5.1`                                       | Peer richiesto da Reanimated 4.1.7                                              |
| Zustand                      | `5.0.14`                                      | Installato; usato solo dallo store dimostrativo e dal relativo test             |
| TypeScript                   | `5.9.3`, `strict: true`                       | Typecheck verde                                                                 |
| Jest / Jest Expo             | Jest `29.7.0` transitivo, `jest-expo 54.0.17` | Coerente con SDK 54; test verdi                                                 |
| React Native Testing Library | `14.0.1`                                      | Operativa                                                                       |
| test-renderer                | `1.0.0`                                       | Peer compatibile con React 19.1                                                 |
| ESLint                       | `9.39.5`, `eslint-config-expo 10.0.0`         | Flat config operativa                                                           |
| Prettier                     | `3.9.6`                                       | Installato senza configurazione dedicata; check verde                           |
| pnpm                         | runtime e `packageManager`: `9.7.1`           | Correttamente fissato; unico lockfile presente                                  |
| Node.js                      | `.nvmrc` `22.13.0`; processo audit `20.19.0`  | Configurazione target fissata; shell corrente non ancora commutata              |

## Struttura attuale

```text
.
├── __tests__/                 # 3 suite Jest, 4 test
├── assets/                    # icone Expo/Android/web; font, icons e images vuote
├── src/
│   ├── app/                   # root layout e route `/`
│   ├── components/
│   │   ├── atoms/             # AppText
│   │   ├── molecules/         # solo .gitkeep
│   │   ├── organisms/         # solo .gitkeep
│   │   └── templates/         # solo .gitkeep
│   ├── constants/             # solo .gitkeep
│   ├── features/              # solo .gitkeep
│   ├── hooks/                 # solo .gitkeep
│   ├── services/              # solo .gitkeep
│   ├── stores/                # useAppStore dimostrativo
│   ├── styles/                # entry CSS globale
│   ├── theme/                 # token colore, spaziatura e tipografia
│   ├── types/                 # dichiarazione moduli CSS
│   └── utils/                 # solo .gitkeep
├── app.json
├── babel.config.js
├── eslint.config.js
├── jest.config.js
├── metro.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── pnpm-lock.yaml
```

La separazione dichiarata nel `README.md` è sensata: routing in `src/app`, UI condivisa in `src/components`, stato globale in `src/stores`, integrazioni esterne in `src/services` e funzionalità verticali in `src/features`. Non esiste ancora abbastanza codice applicativo per verificare che tali confini siano rispettati sotto carico reale.

## Funzionalità già predisposte correttamente

### Expo ed Expo Router

- `main` punta a `expo-router/entry`.
- Il plugin `expo-router` è registrato in `app.json`.
- Expo rileva automaticamente `src/app` come route root.
- Sono presenti un root layout con `Stack` e la route `/`.
- `experiments.typedRoutes` è attivo; `.expo/types/router.d.ts` viene generato e contiene le route `/` e `/_sitemap`.
- `.expo` ed `expo-env.d.ts` sono correttamente ignorati perché generati.
- `scheme: "motus"`, icone e favicon sono risolti dalla configurazione pubblica Expo.
- `expo-system-ui` è registrato per rendere effettivo `userInterfaceStyle: "automatic"` in CNG.
- `expo-splash-screen` è registrato con l'immagine splash esistente e un background semantico.
- L'export Metro è riuscito separatamente per iOS, Android e web.

### TypeScript

- `strict: true` è esplicito.
- Il progetto estende `expo/tsconfig.base`.
- L'alias `@/* -> ./src/*` è condiviso con Jest.
- Sorgenti, test, dichiarazioni NativeWind, tipi Expo e typed routes sono inclusi.
- `tsc --noEmit` non rileva errori.

### NativeWind, Tailwind, Metro e Babel

- Babel usa `babel-preset-expo` con `jsxImportSource: "nativewind"` e il preset `nativewind/babel`, come richiesto da NativeWind v4.
- Metro deriva da `expo/metro-config` ed è decorato con `withNativeWind`.
- L'input CSS `src/styles/global.css` è importato una sola volta nel root layout.
- Il preset NativeWind è attivo in Tailwind.
- I content path coprono `src/app`, `src/components` e `src/features`.
- I token semantici alimentano Tailwind da una fonte CommonJS condivisa.
- L'export web produce il CSS compilato, quindi la catena Tailwind/NativeWind/Metro è operativa nel setup corrente.

### Stato, componenti e test

- `AppText` costituisce un atom riutilizzabile e inoltra le proprietà native di `Text`.
- `useAppStore` dimostra creazione, aggiornamento e reset di uno store Zustand tipizzato.
- Sono presenti test per atom, schermata iniziale e store.
- Le 3 suite e i 4 test passano.
- La coverage misurata sul solo codice attualmente importato dai test è 100%; non esiste una soglia configurata e il root layout non rientra nel report.

### Qualità e repository

- ESLint usa la flat config ufficiale Expo.
- Prettier ha script separati di scrittura e verifica.
- `validate` concatena lint, format, typecheck e test.
- `.github/workflows/validate.yml` esegue installazione frozen e `pnpm validate` su Node 22.13.x.
- `pnpm-lock.yaml` è l'unico lockfile.
- I file locali `.env*`, tranne `.env.example`, sono ignorati.
- `ios/` e `android/` sono assenti e ignorati: il repository segue attualmente un workflow Expo managed/CNG.
- Lo stato Git precedente alla creazione di questo audit era pulito e `develop` coincideva con `origin/develop`.

## Problemi bloccanti

Non sono presenti blocchi applicativi nel perimetro SDK 54. Il processo locale dell'audit usa ancora Node 20.19.0, ma `.nvmrc` e CI richiedono Node 22.13.0/22.13.x; prima di considerare verde una CI o una release è necessario eseguire i controlli con il runtime configurato.

## Problemi non bloccanti

| Priorità | Problema                                                                           | Impatto                                                                                                             |
| -------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Bassa    | Gli override transitive dipendono dalla compatibilità della toolchain Expo 54      | Rieseguire l'audit dopo ogni aggiornamento Expo e rimuovere gli override quando non saranno più necessari           |
| Media    | Non sono stati validati prebuild, Xcode, Gradle, simulatori o dispositivi          | Gli export confermano il bundle JavaScript, non la compilazione o il comportamento nativo                           |
| Bassa    | Mancano `ios.bundleIdentifier`, `android.package`, configurazione EAS e project ID | Non impedisce lo sviluppo locale, ma il setup non è pronto per build/distribuzione identificabile                   |
| Bassa    | I tipi Jest sono globali nello stesso `tsconfig` delle sorgenti                    | Le API di test sono visibili anche al codice applicativo; una configurazione separata potrà migliorare l'isolamento |

## Variabili d'ambiente e servizi

- `.env.example` dichiara soltanto `EXPO_PUBLIC_API_URL=` e avverte correttamente che i valori pubblici finiscono nel bundle client.
- Non esistono `.env` locali nel workspace analizzato.
- La variabile non è letta, validata o tipizzata dal codice.
- `src/services` è vuota e non esistono client HTTP, endpoint o contratti API.
- Non sono presenti segreti o endpoint inventati nel repository tracciato.

Questa è una predisposizione, non un'integrazione API. La validazione dell'URL, la gestione degli errori e il client vanno introdotti solo quando esisterà un contratto backend reale.

## Configurazioni native

- Non sono presenti directory `ios/` o `android/`; entrambe sono ignorate intenzionalmente.
- Non sono presenti moduli nativi custom, config plugin proprietari o file EAS.
- I config plugin sono `expo-router`, `expo-system-ui` e `expo-splash-screen`.
- Gli asset referenziati esistono e sono PNG validi: icona principale 1024×1024, foreground/background Android 512×512, monochrome 432×432 e favicon 48×48.
- `android.predictiveBackGestureEnabled` è esplicitamente `false`; va preservato durante l'upgrade finché una verifica di navigazione non ne giustifica la modifica.

## Dipendenze inutilizzate o ridondanti

Non è sicuro classificare come inutilizzate le dipendenze non importate direttamente dall'app: `expo-constants`, `expo-linking`, `@expo/metro-runtime`, gesture handler, screens, Reanimated, worklets e safe-area-context sono peer o runtime del Router/NativeWind e devono restare allineate tramite Expo.

`@react-native/metro-config` è stata rimossa e verificata con installazione pnpm: non è usata dalla configurazione che importa `expo/metro-config`. `react-native-css-interop` resta invece una dipendenza diretta necessaria: NativeWind trasforma JSX in un import di `react-native-css-interop/jsx-runtime`, che pnpm non espone come dipendenza transitiva.

Zustand è usato solo da uno store dimostrativo non consumato dalla UI. Poiché Zustand fa parte dello stack deliberatamente scelto, non è considerato una dipendenza da rimuovere in questa fase.

## Problemi architetturali e debito tecnico

### Token duplicati tra JavaScript e dichiarazioni TypeScript

`tokens.js` è la fonte runtime per Tailwind, mentre `tokens.d.ts` ne replica manualmente struttura e valori letterali. Ogni modifica ai token richiede sincronizzazione manuale; TypeScript non verifica che la dichiarazione descriva davvero l'oggetto CommonJS. Questo diventerà fragile quando il design system crescerà.

### Layer runtime del tema non ancora consumato

`colors.ts`, `spacing.ts`, `typography.ts` e `index.ts` espongono wrapper tipizzati che nessun componente importa. Sono una predisposizione ragionevole, ma oggi aumentano i punti da mantenere senza un caso d'uso runtime.

### Stato globale dimostrativo

`isAppReady` non partecipa al flusso dell'app e viene esercitato soltanto dal test dello store. È utile come prova del setup, ma non rappresenta stato di business. Va sostituito, non esteso, quando emergerà il primo stato realmente condiviso.

### Atomic Design ancora nominale

Soltanto `atoms` contiene codice. Molecules, organisms e templates sono placeholder; features, hooks, services, constants e utils sono vuote. La struttura è pronta, ma l'architettura non è ancora validata da una feature verticale completa.

### Test ancora orientati al setup

I test verificano rendering minimo, forwarding di una prop e mutazione dello store. Non verificano root layout, routing, tema, accessibilità completa, safe area, dark mode o integrazioni native. La coverage al 100% è quindi corretta matematicamente ma non indica maturità funzionale.

## Audit di complessità `ponytail-audit`

I seguenti tag registrano le semplificazioni applicate e quelle lasciate intenzionalmente al task della prima feature:

delete: eliminare lo store dimostrativo `isAppReady` e il test dedicato quando inizia lo stato reale; sostituzione: introdurre soltanto lo stato condiviso richiesto dalla prima feature. [`src/stores/useAppStore.ts`, `__tests__/useAppStore.test.ts`]

yagni: rimuovere i quattro adapter runtime del tema e la dichiarazione manuale finché nessun consumer TypeScript li usa; sostituzione: mantenere `tokens.js` per Tailwind e reintrodurre un'API runtime quando serve. [`src/theme/colors.ts`, `src/theme/spacing.ts`, `src/theme/typography.ts`, `src/theme/index.ts`, `src/theme/tokens.d.ts`]

native: mantenere `react-native-css-interop` come dipendenza top-level; sostituzione: nessuna, perché NativeWind genera `react-native-css-interop/jsx-runtime` e pnpm usa un grafo isolato. [`package.json`, `babel.config.js`]

yagni: rimuovere la dichiarazione diretta di `@react-native/metro-config`; sostituzione: mantenere `expo/metro-config` come unica API di configurazione Metro. [`package.json`, `metro.config.js`]

net: -0 lines, -1 dep possible.

## Configurazioni da preservare

- `pnpm@9.7.1`, `pnpm-lock.yaml` e assenza di lockfile npm/yarn.
- TypeScript strict e alias `@/*`.
- `expo-router/entry`, plugin Router, route root `src/app` e typed routes.
- Esclusione Git dei file generati `.expo`, `expo-env.d.ts`, `ios` e `android` nel workflow managed.
- Metro basato su `expo/metro-config`, decorato da NativeWind.
- Singolo import del CSS globale nel root layout.
- Content path Tailwind per route, componenti e feature.
- Token semantici `background`, `surface`, `primary`, `foreground`, `muted`, `border`; i valori sono dichiarati provvisori e non vanno trattati come design definitivo.
- Config Jest Expo, alias Jest e `watchman: false`, finché non cambia la toolchain.
- Flat config ESLint Expo e separazione tra lint, format, typecheck e test.
- Confini architetturali descritti nel README: route come composizione, UI condivisa indipendente dai servizi, stato globale separato e feature verticali isolate.
- Asset applicativi esistenti e `predictiveBackGestureEnabled: false` durante la migrazione, salvo requisito esplicito.

## Interventi raccomandati

### Priorità 0 — completate

1. Allineare repository e documentazione a Expo SDK 54.
2. Fissare Node 22.13.0 in `.nvmrc` e Node 22.13.x nella CI.
3. Rimuovere dipendenze dirette ridondanti e aggiungere soltanto i moduli Expo richiesti dalla configurazione CNG.
4. Rigenerare il lockfile esclusivamente con pnpm.

### Priorità 1 — stabilizzazione del setup

1. Eseguire i controlli con Node 22.13.x attivo anche nell'ambiente locale.
2. Validare iOS e Android su simulatore/dispositivo, inclusi safe area, dark mode, splash e back gesture.
3. Eseguire una build release per verificare i config plugin CNG.

### Priorità 2 — quando richiesto dalle feature o dalla distribuzione

1. Definire identificatori iOS/Android, EAS e versionamento build quando esisterà un target di distribuzione.
2. Introdurre client API e validazione di `EXPO_PUBLIC_API_URL` solo dopo la disponibilità di un contratto backend.
3. Sostituire lo store dimostrativo con stato di business reale e mantenere locale lo stato non condiviso.
4. Eliminare la duplicazione dei token tra JS e `.d.ts` quando viene definito il design system.
5. Ampliare test e soglie di coverage in base ai comportamenti reali, non ai placeholder.

## Rischi

| Rischio                                                              | Probabilità | Impatto         | Mitigazione                                                          |
| -------------------------------------------------------------------- | ----------- | --------------- | -------------------------------------------------------------------- |
| Eseguire i controlli locali con Node diverso da 22.13.x              | Alta        | Medio           | Attivare `.nvmrc` e replicare la CI                                  |
| Aggiornare pacchetti Expo singolarmente e uscire dal baseline SDK 54 | Media       | Alto            | Usare il resolver Expo e mantenere le versioni SDK allineate         |
| Regressioni NativeWind/Reanimated dopo aggiornamenti futuri          | Media       | Alto            | Verificare bundle e device sulle tre piattaforme prima di proseguire |
| Vulnerabilità transitive della toolchain SDK 54                      | Media       | Medio/alto      | Non processare CSS non fidato e rivalutare al prossimo upgrade SDK   |
| Falso senso di sicurezza da coverage 100%                            | Alta        | Medio           | Misurare comportamenti e ampliare la suite con le feature            |
| Divergenza silenziosa tra `tokens.js` e `tokens.d.ts`                | Media       | Medio           | Adottare una singola fonte tipizzata quando il tema cresce           |
| Configurazioni native non validate perché generate                   | Media       | Alto in release | Eseguire prebuild/build e test dispositivo in un task dedicato       |
| Esposizione accidentale di segreti tramite `EXPO_PUBLIC_*`           | Media       | Alto            | Conservare solo valori pubblici e validare il processo env           |

## Stato dei controlli disponibili

| Controllo                                    | Risultato    | Dettaglio                                                                   |
| -------------------------------------------- | ------------ | --------------------------------------------------------------------------- |
| `git status --short --branch`                | PASS         | Prima dell'audit: `develop...origin/develop`, nessuna modifica locale       |
| `pnpm exec expo config --type public --json` | PASS         | Config risolta; conferma `sdkVersion: 54.0.0` e piattaforme iOS/Android/web |
| `pnpm exec expo install --check`             | PASS         | Dipendenze allineate a SDK 54                                               |
| `pnpm lint`                                  | PASS         | Nessun errore ESLint                                                        |
| `pnpm format:check`                          | PASS         | Tutti i file formattati                                                     |
| `pnpm typecheck`                             | PASS         | Nessun errore TypeScript                                                    |
| `pnpm test -- --runInBand`                   | PASS         | 3 suite, 4 test, 0 snapshot                                                 |
| `pnpm run test:coverage --runInBand`         | PASS         | 100% sul codice importato; nessuna soglia configurata                       |
| `pnpm exec expo export --platform ios`       | PASS         | Bundle Hermes generato, 1311 moduli                                         |
| `pnpm exec expo export --platform android`   | PASS         | Bundle Hermes generato, 1307 moduli                                         |
| `pnpm exec expo export --platform web`       | PASS         | Bundle JS e CSS NativeWind generati, 668 moduli                             |
| `pnpm audit --prod`                          | PASS         | Nessuna vulnerabilità nota dopo gli override versionati                     |
| `pnpm exec expo prebuild --no-install`       | PASS         | Config plugin SystemUI/splash validati; directory native non tracciate      |
| Build Xcode/Gradle                           | NON ESEGUITO | Mancano `pod` e `adb` nell'ambiente                                         |
| Test simulatore/dispositivo                  | NON ESEGUITO | Fuori dal perimetro dell'audit statico                                      |
| `pnpm validate`                              | PASS         | Lint, format, typecheck e test verdi; eseguito nella shell Node 20.19.0     |

## Assunzioni

- Expo SDK 54 è il target vincolante del progetto e `AGENTS.md` richiede la relativa documentazione versionata.
- Node 22.13.0 è il runtime locale/CI scelto dal progetto, anche se SDK 54 supporta già Node 20.19.x.
- L'assenza di `ios/` e `android/` è intenzionale e indica Expo managed/CNG, non file mancanti.
- I placeholder Atomic Design e lo store dimostrativo sono parte del bootstrap e non vengono rimossi in questa fase.
- Le dipendenze peer del Router e di NativeWind vengono considerate necessarie anche senza import applicativi diretti.
- Gli override transitive sono considerati parte della toolchain e vanno riesaminati dopo ogni aggiornamento Expo.

## Blocchi e attività rinviate ai task successivi

1. Eseguire controlli locali e CI con Node 22.13.x attivo.
2. Verifica nativa iOS/Android, splash, dark mode e back gesture su build release.
3. Rivalutazione delle vulnerabilità con il prossimo aggiornamento Expo.
4. Definizione di design system, API, stato reale, routing funzionale e configurazione di distribuzione nei rispettivi task.
