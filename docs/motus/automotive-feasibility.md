# Motus — Verifica di fattibilità Android Auto e CarPlay

## Metodologia

Verifica eseguita in questa sessione (2026-08-05) consultando esclusivamente documentazione ufficiale e fonti primarie:

- **Android Auto / Android Automotive OS**: `developer.android.com` (Android for Cars App Library, Car app quality guidelines, Distribute to cars) e `developers.google.com/cars` (Design for Driving).
- **Apple CarPlay**: `developer.apple.com/carplay/`, `developer.apple.com/documentation/CarPlay`, `developer.apple.com/download/files/CarPlay-Developer-Guide.pdf` (guida ufficiale in PDF).
- **Expo SDK 54**: `docs.expo.dev` (Development builds, Continuous Native Generation/Prebuild, Config plugins), come richiesto da `AGENTS.md` di questo repository.
- Confronto con le funzionalità reali di Motus documentate in `product-requirements.md`, `screen-inventory.md`, `user-flows.md` e `domain-model.md` (Task precedenti).

Legenda: 🟢 Confermato da fonte ufficiale consultata direttamente in questa sessione (URL citato) — 🟡 Fondato su documentazione ufficiale ma non verificato testualmente in questa sessione (limite tecnico di estrazione, vedi §4) — 🔴 Non verificabile o assente nelle fonti consultate.

**Vincolo rispettato**: nessun codice automotive è stato scritto, nessuna libreria è stata installata, nessuna schermata React Native esistente è stata presentata come "supporto automotive". Il solo fatto che le schermate Motus siano responsive non implica alcuna compatibilità con Android Auto o CarPlay: entrambe le piattaforme non eseguono viste React Native, ma renderizzano esclusivamente **template nativi dichiarativi** forniti dal sistema operativo host.

## Riepilogo funzionalità Motus da valutare

Da `screen-inventory.md`: S01 Ricerca impianti (testo libero + filtri), S02 Ricerca prezzi per carburante (filtri), S03 Dettaglio impianto, S04 Impianti vicini (geolocalizzazione). Nessuna scrittura, nessuna autenticazione, nessuna navigazione turn-by-turn nativa nel dominio applicativo attuale.

---

## 1. Android Auto / Android Automotive OS

### 1.1 Categoria dell'app

🟢 Le funzionalità di Motus (ricerca impianti di distribuzione carburanti, prezzi, impianti vicini) corrispondono alla categoria **`androidx.car.app.category.POI`** (Point of Interest). La documentazione ufficiale cita testualmente: _"Provides functionality relevant to finding points of interest such as parking spots, charging stations, and **gas stations**"_ — [Set up your project](https://developer.android.com/training/cars/apps/library/set-up-project#supported-app-categories).

🟢 Fino alla Car App Library 1.3 esistevano anche le categorie dedicate `androidx.car.app.category.PARKING` e `androidx.car.app.category.CHARGING`, ora **deprecate a favore di POI** — [Build a point of interest app](https://developer.android.com/training/cars/apps/poi).

### 1.2 Categorie di app supportate (elenco completo ufficiale)

🟢 `NAVIGATION`, `POI`, `IOT`, `WEATHER`, `MEDIA`, `MESSAGING`/`COMMUNICATION` (categoria rinominata a maggio 2025 in "Communication — messaging notifications", con aggiunta di "Communication — templated messaging" e "Communication — calling"), `CALLING`, più le categorie deprecate `PARKING`/`CHARGING` — [Set up your project](https://developer.android.com/training/cars/apps/library/set-up-project#supported-app-categories), [Car app quality — change notes](https://developer.android.com/docs/quality-guidelines/car-app-quality).

Non esiste una categoria generica "utility" o "informazione libera": un'app deve dichiararsi esplicitamente in una di queste categorie per essere distribuita su Android Auto/Automotive OS.

### 1.3 Compatibilità delle funzionalità Motus

| Schermata Motus                     | Compatibilità                | Motivazione                                                                                                                                                                                                                                        |
| ----------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S04 Impianti vicini                 | 🟢 Ottimo fit                | Corrisponde esattamente all'uso previsto della categoria POI e del template `PlaceListMapTemplate` (elenco di POI + mappa), che la documentazione cita esplicitamente per "gas stations". Nessun input testuale richiesto (usa geolocalizzazione). |
| S03 Dettaglio impianto              | 🟢 Compatibile               | Rappresentabile come riga/`Pane` raggiunta da un elenco POI.                                                                                                                                                                                       |
| S01 Ricerca impianti (testo libero) | 🟡 Compatibile solo in parte | L'elenco risultati è compatibile con i template POI, ma l'inserimento di testo libero da tastiera è un input fortemente disincentivato durante la guida (vedi §1.5); va riprogettato per l'uso in auto (es. solo da fermo, o tramite voce).        |
| S02 Ricerca prezzi per carburante   | 🟡 Compatibile solo in parte | Stesso problema di S01, aggravato dal fatto che il template POI è pensato per "luoghi" (place), non per righe di prezzo scorporate dal luogo — il fit del template va verificato in fase di design, non è automatico.                              |

### 1.4 Template consentiti

🟢 Per la categoria POI sono esplicitamente documentati:

- **`PlaceListMapTemplate`** — elenco di POI accanto a una mappa renderizzata dall'host. Richiede il permesso `androidx.car.app.MAP_TEMPLATES` in `AndroidManifest.xml` ed è utilizzabile solo da app con categoria `POI` (o le deprecate `PARKING`/`CHARGING`) — [Build a point of interest app](https://developer.android.com/training/cars/apps/poi#access-map-templates).
- **`MapWithContentTemplate`** — mappa disegnata dall'app stessa con contenuti sovrapposti.
- Template generici disponibili a tutte le categorie: **List**, **Grid** e altri elencati in [Templates overview](https://developer.android.com/design/ui/cars/guides/templates/overview).

🔴 Non è stato possibile enumerare in questa sessione l'elenco completo di _tutti_ i template generici (la pagina Templates overview è stata troncata nell'estrazione); va consultata integralmente prima della progettazione UI.

### 1.5 Limitazioni durante la guida

🟢 Dai [Templated app requirements](https://developers.google.com/cars/design/create-apps/ux-requirements/templated-apps) di Google:

- **MUST**: task flow di **massimo 5 passaggi**; **SHOULD**: 2-3 passaggi.
- **MUST NOT**: terminare un flow di 5 passaggi con un template a lista, a meno che non sia abilitata la feature "Adaptive task limits" (il 5° passaggio deve essere Navigation, Message o Pane).
- **SHOULD**: mostrare contenuti per almeno 8 secondi prima di una transizione automatica.
- **MUST**: reindirizzare al telefono le azioni non permesse durante la guida, invitando l'utente a guardare lo schermo solo quando è sicuro farlo.
- 🟢 Vincoli sui contenuti visivi (change notes 2022): niente elementi animati; niente immagini salvo eccezioni esplicite (icone, logo statico, e — rilevante per Motus — _"Navigation, parking, and charging apps may display images and photographs to aid in driving decision-making"_).

### 1.6 Input consentiti

🟢 Touch sullo schermo dell'infotainment; controller rotativo ("rotary") su alcuni veicoli, che riusa le stesse API della navigazione a schede da tastiera. La tastiera è tecnicamente supportata da Android Automotive OS ma la documentazione la definisce esplicitamente _"less common input methods in cars"_ — [Car app quality — Associated large screen quality guidelines](https://developer.android.com/docs/quality-guidelines/car-app-quality).

### 1.7 Utilizzo della voce

🟢 La ricerca vocale nativa nel Car App Library non è documentata come funzionalità del template stesso; l'integrazione vocale ufficiale avviene tramite **App Actions for Cars** con Gemini/Google Assistant, con esempio esplicito calzante per Motus: _"Hey Google, find nearby charging stations on ExampleApp"_ — [Build a point of interest app](https://developer.android.com/training/cars/apps/poi#integrate-app-actions).

🟢 Requisito trasversale: è necessario ottenere il permesso dell'utente prima di registrare audio per input vocale — [Templated app requirements](https://developers.google.com/cars/design/create-apps/ux-requirements/templated-apps).

### 1.8 Requisiti di sicurezza

🟢 Google dichiara esplicitamente di trattare la distrazione del guidatore come priorità assoluta: _"Google takes driver distraction very seriously. Your app must belong to one of the supported categories and meet specific design requirements"_ — [Use the Android for Cars App Library](https://developer.android.com/training/cars/apps). I criteri dettagliati (per livelli/tier) sono in [Car app quality](https://developer.android.com/docs/quality-guidelines/car-app-quality).

### 1.9 Necessità di approvazioni

🟢 **Sì**, review manuale aggiuntiva rispetto alla normale review Play Store, con impatto diverso a seconda del canale di rilascio — [Distribute to cars](https://developer.android.com/training/cars/distribute):

| Canale                               | Esito review                                                        |
| ------------------------------------ | ------------------------------------------------------------------- |
| Internal sharing (solo Android Auto) | Nessuna review                                                      |
| Internal testing                     | Nessuna review                                                      |
| Closed testing                       | Non bloccante (notifica di non conformità, ma submission approvata) |
| Open testing                         | Bloccante                                                           |
| Production                           | Bloccante                                                           |

### 1.10 Necessità di entitlement

🟢 Non esiste un processo di "entitlement" separato in stile Apple. È sufficiente dichiarare la categoria (`androidx.car.app.category.POI`) nell'intent-filter del `CarAppService` e superare la review di qualità auto descritta al punto 1.9.

### 1.11 Necessità di codice nativo

🟢 **Sì, obbligatoria.** L'app deve implementare un `CarAppService` nativo (Kotlin/Java), dichiarato in `AndroidManifest.xml`, che l'host Android Auto/Automotive OS scopre e a cui si connette:

```xml
<service android:name=".MyCarAppService" android:exported="true">
  <intent-filter>
    <action android:name="androidx.car.app.CarAppService"/>
    <category android:name="androidx.car.app.category.POI"/>
  </intent-filter>
</service>
```

— [Set up your project](https://developer.android.com/training/cars/apps/library/set-up-project#declare-carappservice). Le schermate (`Screen`) e i template sono costruiti tramite le API native `androidx.car.app.model.*`, non tramite componenti React Native.

### 1.12 Compatibilità con Expo Managed Workflow

🟢 **No.** Il managed workflow puro non consente di aggiungere servizi Android nativi né di modificare `AndroidManifest.xml` con le voci richieste al punto 1.11.

### 1.13 Necessità di Development Build

🟢 **Sì.** Serve un Expo Development Build (con `expo-dev-client`), perché Expo Go non include librerie/moduli nativi custom — [Introduction to development builds](https://docs.expo.dev/develop/development-builds/introduction/).

### 1.14 Necessità di prebuild

🟢 **Sì.** Serve `npx expo prebuild` (Continuous Native Generation) per generare la cartella `android/` in cui inserire il `CarAppService` nativo, oppure l'adozione diretta del bare workflow — [Continuous Native Generation (CNG)](https://docs.expo.dev/workflow/prebuild/).

### 1.15 Necessità di config plugin

🟢 **Sì, fortemente raccomandata.** Senza un config plugin, ogni modifica manuale ad `AndroidManifest.xml` (dichiarazione del `CarAppService`/categoria) verrebbe persa al successivo `npx expo prebuild --clean` — [Introduction to config plugins](https://docs.expo.dev/config-plugins/introduction/).

### 1.16 Necessità di target o extension native

🟡 Non nel senso "target Xcode" di iOS: su Android serve una **classe `Service` nativa dedicata** (`CarAppService`) più eventuali classi `Screen`, non un modulo di build separato.

### 1.17 Librerie ufficiali o API richieste

🟢 **`androidx.car.app`** ("Android for Cars App Library", Jetpack) — [release notes](https://developer.android.com/jetpack/androidx/releases/car-app). Nessun modulo Expo ufficiale equivalente esiste ad oggi.

🟡 Esiste una libreria di terze parti community, **`react-native-carplay`**, che dalla propria documentazione dichiara di supportare _"both Apple CarPlay and Android Auto"_ con un setup nativo Android dedicato — [repository GitHub](https://github.com/birkir/react-native-carplay), file `AndroidAuto.md`. Non è un prodotto Google né Expo, non è garantita nel tempo, e non elimina la necessità di codice nativo/config plugin: sposta solo il bridging JS↔nativo, non la necessità di dichiarare categoria e superare la review Play.

### 1.18 Possibilità di test su simulatori/emulatori

🟢 **Sì.** Android Auto: **Desktop Head Unit (DHU)**. Android Automotive OS: **Android Emulator** con immagine di sistema Automotive — [Car app quality — Test your app](https://developer.android.com/docs/quality-guidelines/car-app-quality#test-your-app).

---

## 2. Apple CarPlay

### 2.1 Categoria dell'app

🟢 Apple elenca esplicitamente tra le categorie di app CarPlay: _"EV charging, fueling, parking, public safety, quick food ordering, voice-based conversational apps, and driving task apps"_ — [CarPlay | Apple Developer](https://developer.apple.com/carplay/).

🟡 La categoria semanticamente più vicina a Motus è **"Fueling"** (ricerca/confronto carburanti). In alternativa più debole, **"Parking"** (POI generico stile parcheggio). **Non è stato possibile verificare in questa sessione la definizione esatta e i requisiti funzionali della categoria Fueling** (vedi limiti in §4): la CarPlay Developer Guide ufficiale in PDF non è stata estraibile come testo leggibile con gli strumenti disponibili in questa sessione. Questo è un **prerequisito da chiudere prima di qualunque impegno di sviluppo**: va verificato se la categoria Fueling richiede funzionalità transazionali (es. avviare/pagare un rifornimento) che Motus — puramente informativo — non possiede.

### 2.2 Categorie di app supportate (elenco ufficiale)

🟢 Audio, Comunicazione (messaggistica/VoIP con SiriKit), Navigazione, Video (solo a veicolo fermo), **EV Charging**, **Fueling**, **Parking**, Quick Food Ordering, Public Safety, app conversazionali vocali, Driving Task — [CarPlay | Apple Developer](https://developer.apple.com/carplay/). Dall'indice della CarPlay Developer Guide risultano inoltre categorie di **entitlement deprecate** ("Audio apps", "Communication apps" nella sezione "Deprecated entitlements") — 🟡 dettaglio rilevato solo dai metadati/indice del PDF, non dal testo, da confermare.

### 2.3 Compatibilità delle funzionalità Motus

Stesso schema di rischio di Android Auto (§1.3): S04 "vicino a me" è il miglior fit concettuale (elenco di POI + distanza, nessun input testuale); S01/S02 richiedono input testuale libero, in conflitto con la restrizione generale di tastiera disabilitata a veicolo in movimento (vedi §2.5) su praticamente tutte le categorie CarPlay.

🔴 Non verificato in questa sessione se il flusso "prezzo per carburante senza geolocalizzazione" (S02) sia rappresentabile nei template assegnati alla categoria Fueling, o se questa richieda intrinsecamente un'origine geografica per ogni risultato (come suggerisce l'analogia con EV Charging/Parking).

### 2.4 Template consentiti

🟡 **Parzialmente verificato.** Fonti generali confermano l'esistenza di template dedicati per categoria (es. `CPListTemplate`, `CPGridTemplate`, `CPPointOfInterestTemplate`, `CPMapTemplate`) nel framework `CarPlay` di Apple — [CarPlay | Apple Developer Documentation](https://developer.apple.com/documentation/CarPlay). L'indice della CarPlay Developer Guide conferma una sezione dedicata "Templates" con 11 sotto-voci e una "Voice control template" — 🟡 rilevato dai metadati del PDF, contenuto testuale non estratto. **Il set esatto di template assegnato alla categoria Fueling non è stato verificato con testo primario in questa sessione.**

### 2.5 Limitazioni durante la guida

🟡 Non estratta in questa sessione una tabella ufficiale equivalente a quella Android (§1.5). È noto per prassi pubblica Apple (Human Interface Guidelines CarPlay) che i template sono "safety-conscious" by design e alcune interazioni sono ridotte o disabilitate a veicolo in movimento, ma il dettaglio va verificato su [Human Interface Guidelines — CarPlay](https://developer.apple.com/design/human-interface-guidelines/carplay) prima di ogni decisione implementativa.

### 2.6 Input consentiti

🟡 Touch sullo schermo infotainment, manopole/rotary su alcuni veicoli, Siri per input vocale. Non verificata in questa sessione una tabella ufficiale dettagliata equivalente a quella Android.

### 2.7 Utilizzo della voce

🟢 Le categorie "voice-based conversational apps" esistono esplicitamente in CarPlay — [CarPlay | Apple Developer](https://developer.apple.com/carplay/). L'indice della Developer Guide conferma sezioni "Voice control template" e "Voice prompts" (con sottosezione "Activate and deactivate the audio session") — 🟡 solo indice verificato, non il contenuto.

### 2.8 Requisiti di sicurezza

🔴 Non verificato testualmente in questa sessione (limite di estrazione del PDF). Da consultare: [Human Interface Guidelines — CarPlay](https://developer.apple.com/design/human-interface-guidelines/carplay) e la sezione "Guidelines" della CarPlay Developer Guide.

### 2.9 Necessità di approvazioni

🟢 **Sì, obbligatoria e discrezionale.** Apple richiede una richiesta esplicita di **CarPlay app entitlement**, specifica per categoria, tramite modulo ufficiale: _"go to http://developer.apple.com/carplay and provide information about your app, including the category of entitlement that you are requesting"_. **CarPlay apps must be single-category** — un solo entitlement/categoria per app. La pagina di richiesta ([developer.apple.com/contact/carplay/](https://developer.apple.com/contact/carplay/)) richiede login sviluppatore Apple e inquadra la richiesta come _"let us know if your app has the potential to be supported by CarPlay"_, formulazione che conferma la **natura discrezionale** dell'approvazione: non è una submission automatica come su Google Play, ma una valutazione caso per caso da parte di Apple, senza garanzia di esito positivo per un'app indipendente non affiliata a un brand carburante/rete di distributori.

### 2.10 Necessità di entitlement

🟢 **Sì, obbligatoria** — vedi §2.9. Senza l'entitlement approvato da Apple, l'app non può registrare una scena CarPlay a runtime indipendentemente dal codice scritto.

### 2.11 Necessità di codice nativo

🟢 **Sì, obbligatoria.** L'app deve implementare uno **Scene Delegate dedicato a CarPlay** (`CPTemplateApplicationSceneDelegate`, in Swift/Objective-C, basato su `UIScene`) che intercetta la connessione dell'app a CarPlay e costruisce l'interfaccia con oggetti `CPTemplate` nativi. Confermato dalla presenza nella Developer Guide della sezione "Create scene delegates" — 🟡 titolo confermato dall'indice del PDF, contenuto non estratto testualmente; la necessità di UIScene/Swift nativo è comunque nota dal framework pubblico `CarPlay` di Apple ([documentation/CarPlay](https://developer.apple.com/documentation/CarPlay)). **Nessuna vista React Native è renderizzabile direttamente su CarPlay**: l'interfaccia è sempre composta da template nativi dichiarativi.

### 2.12 Compatibilità con Expo Managed Workflow

🟢 **No.** Richiede una configurazione multi-scena del target iOS (`UIApplicationSceneManifest` in `Info.plist`), un entitlement dedicato e codice Swift nativo: nessuna di queste modifiche è possibile nel managed workflow puro.

### 2.13 Necessità di Development Build

🟢 **Sì**, per lo stesso motivo del punto 1.13 — [Introduction to development builds](https://docs.expo.dev/develop/development-builds/introduction/).

### 2.14 Necessità di prebuild

🟢 **Sì** — [Continuous Native Generation (CNG)](https://docs.expo.dev/workflow/prebuild/), per generare la cartella `ios/` in cui aggiungere Scene Delegate ed entitlement.

### 2.15 Necessità di config plugin

🟢 **Sì.** Un config plugin sarebbe necessario per: aggiungere l'entitlement CarPlay al file `.entitlements`, registrare la scena CarPlay in `Info.plist` (`UIApplicationSceneManifest`), e generare/collegare i file nativi Swift dello Scene Delegate ad ogni `prebuild` — [Introduction to config plugins](https://docs.expo.dev/config-plugins/introduction/). Esiste un tentativo community non ufficiale (`expo-config-carplay-plugin` su GitHub) che conferma empiricamente questa necessità, ma non è un pacchetto supportato da Expo.

### 2.16 Necessità di target o extension native

🟡 CarPlay non richiede un target Xcode separato in stile Watch/Widget extension, ma richiede una **configurazione multi-scena** nel target principale dell'app (una scena per l'app telefono, una per CarPlay) — confermato in linea generale dal community package `expo-config-carplay-plugin" ("splits the application into two Scenes"), non dalla guida ufficiale Apple in modo testuale in questa sessione.

### 2.17 Librerie ufficiali o API richieste

🟢 Framework nativo **`CarPlay`** di Apple (Swift/Objective-C) — [documentation/CarPlay](https://developer.apple.com/documentation/CarPlay). Nessun modulo Expo ufficiale equivalente.

🟡 Community: **`react-native-carplay`** offre bridging JS→`CPTemplate`, ma richiede comunque l'entitlement Apple approvato (§2.9-2.10) e la configurazione nativa — non è un prodotto Apple né Expo, non elimina nessuno dei requisiti sopra elencati.

### 2.18 Possibilità di test su simulatori

🟢 **Sì.** Apple distribuisce un **CarPlay Simulator** tramite "Additional Tools for Xcode": _"Download additional tools for Xcode to access the CarPlay simulator and easily replicate a CarPlay environment from your Mac"_ — [CarPlay | Apple Developer — Tools and resources](https://developer.apple.com/carplay/). L'indice della Developer Guide conferma una sezione dedicata "CarPlay Simulator".

**Nota**: il CarPlay Simulator richiede comunque un'app con la scena CarPlay già implementata nativamente; non testa un'app senza entitlement/Scene Delegate.

---

## 3. Limiti di questa analisi

- La **CarPlay Developer Guide** ufficiale (`developer.apple.com/download/files/CarPlay-Developer-Guide.pdf`) è stata scaricata ma il testo non è risultato estraibile in chiaro con gli strumenti disponibili in questa sessione (il documento è tornato come flussi PDF compressi non decodificati): è stato possibile leggere solo la struttura/indice (titoli dei capitoli), non il contenuto integrale. Tutti i punti della sezione 2 marcati 🟡/🔴 dipendono da questa limitazione tecnica, **non da assenza di documentazione ufficiale** (la documentazione esiste ed è pubblica).
- **Azione richiesta prima di procedere**: un secondo passaggio con lettura diretta della guida (es. apertura del PDF in un lettore, oppure consultazione delle pagine `developer.apple.com/documentation/CarPlay/*` sezione per sezione) per confermare in modo testuale primario: definizione della categoria Fueling, elenco template assegnati, tabella limitazioni di guida, requisiti di sicurezza puntuali.
- Nessuna fonte consultata in questa sessione, né Android né Apple, menziona Motus, il dominio "prezzi carburante in Italia" o normative italiane/europee specifiche per la distribuzione di carburanti in-car: la verifica è stata condotta esclusivamente sui requisiti _tecnici e di piattaforma_, non su eventuali vincoli normativi settoriali (es. trasparenza prezzi carburanti, che riguardano il backend MIMIT, non l'integrazione automotive).
