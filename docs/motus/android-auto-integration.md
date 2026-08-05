# Motus — Integrazione Android Auto (Task 15)

## Condizione di avvio

`docs/motus/automotive-architecture-decision.md` classifica Android Auto come **`feasible-with-native-work`** (riga 9, riga 14). La condizione di avvio del Task 15 è soddisfatta: questo documento e il codice associato procedono.

## Deliverable dichiarato

**Scaffolding tecnicamente corretto**, non un'integrazione funzionante e non un prototipo nativo verificato da un build reale. Il motivo è esplicito, non una scorciatoia: nell'ambiente in cui questo task è stato eseguito non è disponibile un runtime Java (`java -version` → "Unable to locate a Java Runtime"), non è impostata alcuna Android SDK (`ANDROID_HOME`/`ANDROID_SDK_ROOT` assenti, nessun `adb`), e questo repository non ha mai eseguito `expo prebuild` (nessuna cartella `android/`). Dichiarare "funzionante" o "prototipo verificato" un'integrazione che non può essere compilata in questo ambiente violerebbe direttamente il vincolo del task ("non dichiarare completata un'integrazione non provata"). Quanto segue è invece **verificabile meccanicamente senza un compiler nativo** (test automatici, elencati sotto) più un codice nativo scritto seguendo la documentazione ufficiale letta in questa sessione, con una checklist esplicita di ciò che resta da verificare con un toolchain Android reale.

## 1. Rilettura della decisione architetturale e verifica delle API

Rivalidato in questa sessione (2026-08-05) contro le fonti ufficiali live, non solo contro `automotive-feasibility.md` (che restava la fonte già citata in precedenza):

| Elemento                                                                                                             | Fonte verificata in questa sessione                                                                                                          |
| -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Dichiarazione `CarAppService` in manifest + categoria `POI`                                                          | [Set up your project](https://developer.android.com/training/cars/apps/library/set-up-project#declare-carappservice)                         |
| Meta-data `androidx.car.app.minCarApiLevel`                                                                          | [Set up your project — Car App API level](https://developer.android.com/training/cars/apps/library/set-up-project#car-app-api-level)         |
| Permesso `androidx.car.app.MAP_TEMPLATES` per `PlaceListMapTemplate`                                                 | [Build a point of interest app — Access the map templates](https://developer.android.com/training/cars/apps/poi#access-map-templates)        |
| Coordinate Gradle (`androidx.car.app:app`, `app-projected`, `app-automotive`, `app-testing`)                         | [Car App — Jetpack release notes](https://developer.android.com/jetpack/androidx/releases/car-app), versione **1.7.0**                       |
| `CarAppService.onCreateSession`, `Session.onCreateScreen`, `Screen.onGetTemplate`/`invalidate`                       | [Create your CarAppService and Session](https://developer.android.com/training/cars/apps/library/carappservice-session)                      |
| `Row.Builder` (`setTitle`, `addText`, `setOnClickListener`, `setBrowsable`)                                          | [Row.Builder reference](https://developer.android.com/reference/kotlin/androidx/car/app/model/Row.Builder)                                   |
| `ItemList.Builder`, `PlaceListMapTemplate.Builder` (incl. vincolo: righe non-browsable richiedono un `DistanceSpan`) | [PlaceListMapTemplate.Builder reference](https://developer.android.com/reference/kotlin/androidx/car/app/model/PlaceListMapTemplate.Builder) |
| `Pane.Builder`, `PaneTemplate.Builder` (header action solo `APP_ICON`/`BACK`)                                        | [PaneTemplate.Builder reference](https://developer.android.com/reference/kotlin/androidx/car/app/model/PaneTemplate.Builder)                 |
| `MessageTemplate.Builder`                                                                                            | [MessageTemplate.Builder reference](https://developer.android.com/reference/kotlin/androidx/car/app/model/MessageTemplate.Builder)           |
| `HostValidator.ALLOW_ALL_HOSTS_VALIDATOR` (solo sviluppo)                                                            | [HostValidator reference](https://developer.android.com/reference/kotlin/androidx/car/app/validation/HostValidator)                          |
| `Screen.getScreenManager()`/`getCarContext()`                                                                        | [Screen reference](https://developer.android.com/reference/kotlin/androidx/car/app/Screen)                                                   |

Nessuna API è stata inventata o dedotta senza fonte: dove la documentazione non è stata raggiungibile con certezza in questa sessione (es. elenco completo dei metodi di `MessageTemplate.Builder` oltre a quelli citati), il codice usa solo i metodi effettivamente confermati.

## 2. Cosa serve, secondo la documentazione ufficiale

| Requisito                                                                      | Necessario?                            | Fatto in questo task                                                                                             |
| ------------------------------------------------------------------------------ | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `npx expo prebuild`                                                            | Sì (§1.14 `automotive-feasibility.md`) | **No** — non eseguito. Vedi §5                                                                                   |
| Config plugin                                                                  | Sì (§1.15)                             | **Sì**, isolato e non attivo di default — vedi §4                                                                |
| Modulo/servizio nativo (`CarAppService`)                                       | Sì (§1.11)                             | **Sì**, scaffolding Kotlin — vedi §3                                                                             |
| Template specifici (`PlaceListMapTemplate`, `PaneTemplate`, `MessageTemplate`) | Sì (§1.4)                              | **Sì**                                                                                                           |
| Manifest entries (servizio, categoria, meta-data)                              | Sì                                     | **Sì**, generate dal config plugin                                                                               |
| Autorizzazioni (`MAP_TEMPLATES`)                                               | Sì (§1.4)                              | **Sì**, aggiunta dal config plugin                                                                               |
| Development Build (`expo-dev-client`)                                          | Sì (§1.13)                             | **No** — non installato, richiede una decisione di prodotto su un profilo di build automotive dedicato (vedi §6) |

## 3. Scaffolding nativo — `native/android-auto/`

Sette file Kotlin, con package placeholder `__ANDROID_AUTO_PACKAGE__` risolto dal config plugin al momento del prebuild (vedi §4):

- **`MotusCarAppService.kt`** — `CarAppService`, `onCreateSession` → `MotusSession`. `createHostValidator()` usa `HostValidator.ALLOW_ALL_HOSTS_VALIDATOR`, esplicitamente commentato come placeholder di sviluppo da sostituire prima di una release Play Store.
- **`MotusSession.kt`** — `Session`, `onCreateScreen` → `NearbyListScreen` (S04, l'unica schermata "ottimo fit" per `automotive-feasibility.md` §1.3).
- **`MotusViewModel.kt`** — data class Kotlin che rispecchiano `AutomotivePlaceItem`/`AutomotivePlaceListViewModel`/`AutomotiveDetailRow`/`AutomotivePlaceDetailViewModel`/`AutomotiveMessageViewModel` (`src/automotive/types/template.ts`, Task 14), con un parser JSON basato su `org.json` (incluso nell'SDK Android, nessuna dipendenza aggiunta).
- **`MotusDataSource.kt`** — l'interfaccia non implementata verso il backend Motus. Vedi §6.
- **`NearbyListScreen.kt`** — costruisce `PlaceListMapTemplate` da `MotusPlaceListViewModel`; ogni riga è `setBrowsable(true)` (vincolo reale del template: le righe non-browsable richiedono un `DistanceSpan` non ancora implementato) e naviga a `PlaceDetailScreen` al click.
- **`PlaceDetailScreen.kt`** — costruisce `PaneTemplate` da `MotusPlaceDetailViewModel`, stessa forma "indirizzo poi un rigo per prezzo, ordine del server" di `toPlaceDetailViewModel` (`src/automotive/models/placeDetail.ts`).
- **`MessageScreen.kt`** — mirror di `AutomotiveMessageViewModel`, riusato sia come `Screen` autonomo sia come funzione di build condivisa dagli altri due screen per i loro stati di fallback.

## 4. Config plugin — `plugins/`

Diviso in due file per una ragione tecnica concreta, non stilistica:

- **`plugins/androidAutoManifest.js`** — logica pura (`applyCarAppManifest`, `applyCarAppGradleDependencies`), **senza dipendenza da `expo/config-plugins`**. Testata direttamente in `__tests__/plugins/androidAutoManifest.test.ts`.
- **`plugins/withAndroidAutoCarAppService.js`** — il vero `ConfigPlugin` Expo (`withAndroidManifest`, `withAppBuildGradle`, `withDangerousMod`), thin wrapper attorno al file sopra. Copia i 7 file Kotlin in `android/app/src/main/java/<package>/androidauto/` al prebuild, sostituendo il placeholder di package.

`androidAutoManifest.js` è separato perché `expo/config-plugins` importa `xcode` (per il progetto iOS), che a sua volta richiede la build ESM-only di `uuid`: Jest non riesce a fare il parsing di quel file senza un cambio a `transformIgnorePatterns` **condiviso da tutta la suite di test** del repository. Isolare la logica pura evita quel cambio, mantenendo il test del plugin realistico (nessun mock) invece di allargare la configurazione condivisa per un singolo file di test.

### Perché il plugin non è attivo di default

`withAndroidAutoCarAppService` **non è registrato in `app.json`**. Applicarlo è compito di un futuro profilo di build automotive dedicato (es. un profilo EAS con proprio `app.config.js`), mai della build mobile di default: `npx expo prebuild`/`eas build` per l'app Motus normale deve produrre lo stesso output byte-identico con o senza questo file, come richiesto da `architecture.md` §22 ("l'automotive non deve accoppiare l'architettura mobile") e ADR-0003. Attivarlo di default avrebbe aggiunto `androidx.car.app` e il servizio a **ogni** build Android, anche quando nessuno lo richiede.

## 5. Perché non è stato eseguito `expo prebuild`

Tre motivi concreti, non solo prudenza:

1. **`expo.android.package` non è impostato** in `app.json` (verificato: il blocco `android` ha solo `adaptiveIcon`/`predictiveBackGestureEnabled`). `expo prebuild` per Android richiede questo valore; il config plugin stesso fallisce esplicitamente (`throw new Error(...)`) se manca, invece di generare un pacchetto Kotlin fasullo.
2. **Nessun toolchain nativo disponibile** in questo ambiente per validare il risultato (§ Deliverable dichiarato) — eseguire `prebuild` avrebbe prodotto una cartella `android/` che nessuno, in questa sessione, poteva poi compilare o pulire con cognizione di causa.
3. **`expo prebuild` è un'operazione strutturale sull'intero repository** (genera `android/` e, a cascata dei plugin già registrati in `app.json`, anche `ios/`), non isolata al solo scaffolding automotive. Eseguirla avrebbe cambiato la build mobile reale (Android e iOS) per una funzionalità che i vincoli del task richiedono di non toccare ("non compromettere Android mobile o iOS") — un rischio da decidere esplicitamente con il prodotto, non da un singolo task automotive.

## 6. Cosa NON è stato implementato

- **`MotusDataSource`** è un'interfaccia vuota (`UnimplementedMotusDataSource`, lancia `NotImplementedError`). Un `CarAppService` gira nel proprio componente Android, non nel runtime React Native/Hermes dell'app: non può chiamare `src/services/motus/stations.ts` direttamente. Collegarlo al backend reale richiede codice di rete Kotlin scritto e testato con un toolchain reale — scriverlo qui, non potendolo eseguire, avrebbe significato consegnare codice di rete non provato.
- **VS5 (S04, impianti vicini) non è implementata lato mobile** in questo repository (`docs/motus/automotive-shared-model.md` §2): anche una volta collegato `MotusDataSource`, l'endpoint nearby non esiste ancora server-side di questa app.
- **Nessuna gestione del permesso di localizzazione nativo** (`ACCESS_FINE_LOCATION`, `CarContext.requestPermissions`): fuori perimetro per lo stesso motivo di `MotusDataSource` — codice non verificabile in questo ambiente.
- **S01/S02 (ricerca testuale) restano esclusi**, come già deciso in `automotive-shared-model.md` §1: nessun comando di ricerca testuale esiste nel modello condiviso Task 14 da cui questo scaffolding parte.
- **CarPlay non è toccato**: `automotive-architecture-decision.md` lo classifica `requires-product-clarification`, fuori dalla condizione di avvio di questo task.
- **`androidx.car.app:app-automotive`** (target Android Automotive OS, infotainment senza telefono) non è incluso nelle dipendenze Gradle aggiunte: lo scope di `automotive-feasibility.md` è Android Auto proiettato (via telefono), non Automotive OS.
- **`HostValidator.ALLOW_ALL_HOSTS_VALIDATOR`** è un placeholder di sviluppo, non un validator di produzione con allowlist.

## 7. Collegamento ai view model del Task 14

Non un bridge runtime (nessun modulo nativo React Native è stato scritto o simulato — vedi vincolo "non simulare API native"): la connessione è **strutturale e testata**.

- `native/android-auto/MotusViewModel.kt` rispecchia campo per campo `src/automotive/types/template.ts`.
- `__tests__/automotive/nativeContract.test.ts` chiama le **vere** funzioni di mapping del Task 14 (`toPlaceItem`, `toPlaceListViewModel`, `toPlaceDetailViewModel` da `src/automotive/models`) e verifica che le chiavi prodotte combacino esattamente con quelle lette da `MotusViewModelJson.parsePlaceList`/`parsePlaceDetail` in Kotlin. Se un domani `template.ts` cambia un nome di campo, questo test fallisce qui — non come crash nativo irrintracciabile in un ambiente senza toolchain Android.

## 8. Test aggiunti

- `__tests__/plugins/androidAutoManifest.test.ts` — 6 test: permesso `MAP_TEMPLATES`, meta-data `minCarApiLevel`, dichiarazione del servizio con categoria `POI`, idempotenza su prebuild ripetuti (manifest e gradle).
- `__tests__/automotive/nativeContract.test.ts` — 4 test: le chiavi JSON prodotte da Task 14 combaciano con quelle lette dal parser Kotlin; `id` resta un numero JSON (mappato su `Int` Kotlin, non `String`).

Verifica aggiuntiva eseguita manualmente in questa sessione (non un test automatico, documentata per trasparenza): sostituzione del placeholder di package su tutti e 7 i file Kotlin, controllo che nessun `__ANDROID_AUTO_PACKAGE__` residuo rimanga, controllo del bilanciamento delle parentesi graffe per file, controllo incrociato che ogni simbolo referenziato tra file (`MotusMessageViewModel`, `buildMessageTemplate`, `MotusDataSource`, `PlaceDetailScreen`, `NearbyListScreen`) sia definito da qualche parte nello scaffolding.

## 9. Verifiche manuali necessarie

Da eseguire con un toolchain Android reale (Java, Android SDK, Gradle) prima di dichiarare qualunque parte di questa integrazione "funzionante":

1. Impostare `expo.android.package` in `app.json` (decisione di prodotto, non tecnica).
2. Registrare `withAndroidAutoCarAppService` in un profilo di build automotive dedicato (non nel profilo mobile di default — vedi §4).
3. Eseguire `npx expo prebuild --platform android` e ispezionare `android/app/src/main/AndroidManifest.xml` e `android/app/build.gradle` generati.
4. Compilare con Gradle (`./gradlew assembleDebug` o equivalente) e correggere ogni errore di compilazione Kotlin — questo scaffolding non è stato compilato in questa sessione.
5. Testare su **Desktop Head Unit** (Android Auto) o **Android Emulator con immagine Automotive OS** (`automotive-feasibility.md` §1.18).
6. Implementare `MotusDataSource` contro il vero backend (`docs/motus/api-contract.md`) prima di qualunque test end-to-end.
7. Sostituire `HostValidator.ALLOW_ALL_HOSTS_VALIDATOR` con un validator con allowlist prima di qualunque submission Play Store (`automotive-feasibility.md` §1.9).
8. Verificare il vincolo reale di `PlaceListMapTemplate` sulle righe non-browsable (`DistanceSpan`) una volta disponibile un layout reale con distanza (VS5).

## 10. Vincoli rispettati

- **Non compromesso Android mobile o iOS**: nessun file mobile esistente modificato, nessun plugin registrato in `app.json`, nessun `prebuild` eseguito.
- **Nessuna libreria non mantenuta installata**: nessuna dipendenza npm aggiunta. Le uniche librerie Android citate (`androidx.car.app:app`/`app-projected`) sono ufficiali Google, non aggiunte al progetto (solo scritte nel testo del config plugin per un futuro prebuild).
- **Nessuna integrazione non provata dichiarata completata**: vedi "Deliverable dichiarato" in apertura.
- **Nessuna API nativa simulata**: ogni classe/metodo Kotlin usato è citato contro la documentazione ufficiale (§1); nessun modulo React Native fittizio, nessun `NativeModules` stub che finge di chiamare codice nativo inesistente.
