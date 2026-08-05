# Motus — Decisione architetturale: Android Auto e CarPlay

Basato su `automotive-feasibility.md` (analisi dettagliata, fonti ufficiali citate). Questo documento assegna uno stato per piattaforma e la motivazione tecnica, senza alcuna implementazione di codice automotive, senza installazione di librerie, senza simulazione di supporto tramite schermate React Native ordinarie.

## Stato riassuntivo

| Piattaforma                              | Stato                                 | Confidenza della fonte                                                                                                                                                                                |
| ---------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Android Auto / Android Automotive OS** | 🟦 **feasible-with-native-work**      | Alta — tutti i requisiti chiave verificati su fonte ufficiale primaria in questa sessione                                                                                                             |
| **Apple CarPlay**                        | 🟨 **requires-product-clarification** | Media — categoria e categorie ufficiali confermate, ma requisiti puntuali della categoria "Fueling" non estraibili testualmente in questa sessione, e l'approvazione dell'entitlement è discrezionale |

---

## Android Auto / Android Automotive OS — `feasible-with-native-work`

### Motivazione

**A favore della fattibilità:**

1. La funzionalità già esistente e meglio definita di Motus — "impianti più vicini" (S04, `GET /api/stations/nearby`) — corrisponde **letteralmente** alla descrizione ufficiale della categoria `androidx.car.app.category.POI`, che cita esplicitamente "gas stations" come caso d'uso supportato.
2. Il percorso tecnico è interamente pubblico e documentato passo-passo (dichiarazione categoria, `CarAppService`, `PlaceListMapTemplate`, permesso `MAP_TEMPLATES`).
3. Esistono strumenti di test ufficiali senza hardware dedicato: Desktop Head Unit (Android Auto) ed Emulator con immagine Automotive OS.
4. Il processo di pubblicazione è deterministico (review automatica/manuale di Google Play secondo il canale), non richiede una valutazione discrezionale di idoneità del business come su Apple.

**Perché non è "feasible" senza qualifiche:**

1. Richiede obbligatoriamente un `CarAppService` nativo Kotlin/Java: nessuna UI React Native è renderizzabile in Android Auto. Questo comporta: `npx expo prebuild`, Development Build, e un config plugin dedicato per rendere ripetibile la modifica ad `AndroidManifest.xml`.
2. Le schermate di ricerca a testo libero (S01, ricerca impianti per comune/provincia/testo; S02, ricerca prezzi per carburante) **non sono compatibili così come progettate** con le regole di driver-distraction (tastiera sconsigliata/da evitare durante la guida): richiedono una riprogettazione UX specifica per l'automotive (uso "solo da fermo", oppure integrazione voce tramite App Actions/Gemini) prima di poter essere incluse in un'app car-ready.
3. Nessuna libreria ufficiale Expo esiste per questo dominio; l'unica opzione di terze parti (`react-native-carplay`, supporto Android Auto) è community-maintained, non garantita, e non elimina comunque la necessità di codice nativo e review Play.

### Cosa NON è stato fatto (rispetto dei vincoli)

- Nessun `CarAppService`, config plugin, o dipendenza `androidx.car.app` è stato aggiunto al progetto.
- Nessuna libreria (né ufficiale né community) è stata installata.
- Il fatto che le schermate mobile di Motus siano (o saranno) responsive **non è stato usato come prova di compatibilità automotive** — la compatibilità qui dichiarata deriva unicamente dal confronto tra le capacità dei template nativi POI e i casi d'uso già documentati in `product-requirements.md`.

### Prerequisiti prima di un'eventuale implementazione futura

1. Decisione di prodotto su quali schermate portare in auto: solo S04 (nearby, via voce/geolocalizzazione) è "pronta" concettualmente; S01/S02 richiedono redesign.
2. Consultazione integrale di [Templates overview](https://developer.android.com/design/ui/cars/guides/templates/overview) e del codelab ufficiale "Car App Library fundamentals" prima di stimare l'effort.
3. Verifica se il client HTTP Motus-frontend (attualmente assente, vedi `repository-audit.md`) va condiviso tra target mobile e target Android Auto, dato che entrambi girerebbero nello stesso processo/APK Android.

---

## Apple CarPlay — `requires-product-clarification`

### Motivazione

**Perché non è "not-currently-feasible"**: le categorie ufficiali CarPlay includono esplicitamente "Fueling", "EV Charging" e "Parking" — tutte concettualmente vicine al dominio di Motus — e CarPlay dispone di simulatore ufficiale, quindi la piattaforma non è tecnicamente chiusa a questo tipo di app.

**Perché non è "feasible" o "feasible-with-native-work" senza qualifiche**: a differenza di Android, qui ci sono **due categorie distinte di incertezza** che non sono risolvibili con altro lavoro tecnico, ma richiedono decisioni/informazioni che solo il prodotto/business può fornire o che vanno verificate leggendo per intero una fonte che in questa sessione non è stata estraibile in chiaro (vedi `automotive-feasibility.md` §3):

1. **Incertezza di categoria**: non è confermato se "Fueling" — la categoria semanticamente corretta — richieda funzionalità che Motus non ha (es. avviare o pagare un rifornimento alla colonnina, come fanno le app dei gestori/brand), oppure se un uso puramente informativo (trovare/confrontare prezzi) sia sufficiente per l'idoneità alla categoria. La categoria "Parking", più generica, è un fallback più debole e meno preciso semanticamente.
2. **Incertezza di approvazione**: Apple richiede una richiesta esplicita di entitlement (un solo entitlement/categoria per app) valutata **discrezionalmente** caso per caso (_"let us know if your app has the potential to be supported by CarPlay"_), senza un percorso di autocertificazione automatico come su Google Play. Storicamente le categorie affini (EV Charging, Parking) sono state assegnate a un numero limitato di operatori di settore riconosciuti; non c'è, nella documentazione consultata, alcuna garanzia che un'app indipendente di solo confronto prezzi ottenga l'approvazione.

Nessuna quantità di lavoro di ingegneria elimina queste due incertezze: la prima richiede la lettura integrale della CarPlay Developer Guide (o un chiarimento diretto ad Apple) per sapere se Motus, così com'è, rientra nei requisiti funzionali della categoria; la seconda richiede una richiesta formale ad Apple e l'attesa di una risposta discrezionale, prima ancora di scrivere una riga di codice nativo.

### Cosa è comunque confermato (indipendentemente dalle incertezze sopra)

Se e quando la categoria/entitlement fosse chiarita e approvata, il percorso tecnico è dello stesso ordine di complessità di Android:

- Scene Delegate nativo Swift (`CPTemplateApplicationSceneDelegate`), nessuna UI React Native diretta.
- Configurazione multi-scena in `Info.plist`, entitlement in `.entitlements`.
- Development Build + `npx expo prebuild` + config plugin obbligatori; nessuna compatibilità con Managed Workflow.
- Simulatore ufficiale disponibile (CarPlay Simulator, incluso in "Additional Tools for Xcode").
- Stesso limite di prodotto di Android sulle schermate di ricerca testuale (S01/S02) rispetto all'uso durante la guida.

### Cosa NON è stato fatto (rispetto dei vincoli)

- Nessuna richiesta di entitlement è stata inviata ad Apple (azione esterna, di business, non tecnica — da valutare con il prodotto).
- Nessun codice Swift, Scene Delegate, o config plugin CarPlay è stato creato.
- Nessuna libreria community (`react-native-carplay` o simili) è stata installata.

### Domande aperte da portare al prodotto/business prima di sbloccare lo stato

1. Motus vuole restare puramente informativo in auto, o è disposta a valutare partnership/funzionalità aggiuntive che la avvicinino ai requisiti tipici della categoria Fueling (se la lettura integrale della guida li richiedesse)?
2. C'è disponibilità a presentare una richiesta di entitlement ad Apple in via esplorativa (nessun costo di sviluppo necessario per la sola richiesta), accettando tempi e esito incerti?
3. In assenza di approvazione Fueling, la categoria "Parking" è considerata un fallback accettabile dal punto di vista del posizionamento prodotto, pur essendo semanticamente meno precisa?

---

## Criterio di completamento

Per entrambe le piattaforme è stata presa una decisione tecnica verificabile, tracciata a fonti ufficiali primarie (`automotive-feasibility.md`), senza dichiarare supporto automotive sulla base della sola responsività dell'interfaccia mobile e senza alcuna implementazione di codice o dipendenza automotive nel repository. Lo stato CarPlay resta esplicitamente **aperto su base prodotto/informativa** (non su base tecnica) fino a che le due incertezze in §"Apple CarPlay" non saranno risolte.
