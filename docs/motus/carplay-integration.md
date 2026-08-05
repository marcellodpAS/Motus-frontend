# Motus — Integrazione Apple CarPlay (Task 16)

## Condizione di avvio

Il Task 16 richiede di procedere **solo se** `docs/motus/automotive-feasibility.md` classifica CarPlay come `feasible`, `feasible-with-native-work`, oppure `partially-feasible`.

La classificazione effettiva, assegnata in `docs/motus/automotive-architecture-decision.md` (righe 10 e 45) sulla base dell'analisi di `automotive-feasibility.md`, è:

> 🟨 **`requires-product-clarification`**

Questo stato **non è nessuno dei tre stati che sblocca il Task 16**. La condizione di avvio **non è soddisfatta**.

Conferma indipendente già presente nel repository: `docs/motus/android-auto-integration.md` §6 (Task 15) registra esplicitamente _"CarPlay non è toccato: `automotive-architecture-decision.md` lo classifica `requires-product-clarification`, fuori dalla condizione di avvio di questo task"_ — lo stesso fatto, verificato in un task precedente e indipendente.

## Deliverable dichiarato

**Report di blocco documentato.** Nessuna delle altre tre opzioni di deliverable del task (integrazione funzionante, prototipo nativo verificabile, scaffolding tecnicamente corretto) è applicabile: scrivere scaffolding CarPlay ora significherebbe produrre codice/config per una categoria e un entitlement che potrebbero risultare sbagliati o inutilizzabili una volta risolte le incertezze sotto — un lavoro che il task stesso vieta di fingere come "verificato" (vincolo: "non dichiarare verificato ciò che richiede approvazioni non disponibili").

## Perché è bloccato (non un limite tecnico)

Da `automotive-architecture-decision.md` §"Apple CarPlay", due incertezze che nessuna quantità di lavoro di ingegneria in questo repository può risolvere:

1. **Incertezza di categoria.** La categoria semanticamente corretta per Motus è "Fueling", ma non è verificato se richieda funzionalità transazionali (avviare/pagare un rifornimento) che Motus — puramente informativo — non ha. Il testo primario che lo confermerebbe (CarPlay Developer Guide PDF) non è stato estraibile nella sessione che ha prodotto `automotive-feasibility.md` (vedi §3 di quel documento).
2. **Incertezza di approvazione.** L'entitlement CarPlay è concesso da Apple in modo discrezionale, caso per caso, tramite richiesta esplicita (`developer.apple.com/contact/carplay/`), non tramite autocertificazione automatica come su Google Play. Non c'è, nella documentazione consultata, alcuna garanzia che un'app indipendente di solo confronto prezzi ottenga l'approvazione.

Entrambe richiedono una decisione di prodotto/business e un'interazione con Apple che è esterna a questo repository, non un compiler o un SDK mancante.

## Cosa NON è stato fatto (rispetto dei vincoli del task)

- **Nessun entitlement falsificato o dichiarato ottenuto**: nessuna richiesta è stata inviata ad Apple da questa sessione, nessun file `.entitlements` con `com.apple.developer.carplay-*` è stato creato.
- **Nessuna approvazione dichiarata verificata**: lo stato resta esplicitamente aperto su base prodotto, non tecnica.
- **Nessuno Scene Delegate nativo** (`CPTemplateApplicationSceneDelegate`, Swift/Objective-C) è stato scritto.
- **Nessun config plugin CarPlay** (`UIApplicationSceneManifest`, `.entitlements`) è stato aggiunto a `plugins/` o registrato in `app.json`.
- **Nessuna libreria installata**, né ufficiale (il framework `CarPlay` non ha equivalente Expo) né community (`react-native-carplay`, `expo-config-carplay-plugin`).
- **Nessuna simulazione di CarPlay tramite Expo Router**: nessuna rotta, layout o schermata di `src/app` finge di rappresentare una scena CarPlay.
- **Nessun target esistente compromesso**: nessuna cartella `ios/` esiste in questo repository (`expo prebuild` non è mai stato eseguito, coerente con `android-auto-integration.md` §5), nessun file mobile modificato.
- **Nessuna proprietà emersa solo dal Task 14** è stata spacciata per compatibilità CarPlay verificata: `src/automotive/adapters/carplayAdapter.ts` (Task 14) è un adapter generico (`createAutomotiveAdapter("carplay")`, identico nella forma a quello Android Auto) che non implica, da solo, alcuna approvazione o compatibilità di categoria — vedi `docs/motus/automotive-shared-model.md`.

## Collegamento ai view model del Task 14 (rimandato, non ignorato)

Il Task 14 ha già prodotto un modello condiviso platform-agnostic (`src/automotive/types/template.ts`, `src/automotive/models/*`, `src/automotive/adapters/carplayAdapter.ts`) pensato per essere riusato da **entrambe** le piattaforme automotive senza modifiche quando saranno sbloccate. Nessun lavoro aggiuntivo lato Task 14 è necessario per CarPlay: la stessa forma che il Task 15 ha già collegato a `MotusViewModel.kt` (`native/android-auto/`, verificata da `__tests__/automotive/nativeContract.test.ts`) sarebbe il punto di partenza per un futuro `MotusViewModel.swift`, una volta chiarite le due incertezze sopra. Scrivere quel codice Swift ora, senza entitlement né categoria confermata, produrrebbe uno scaffolding che nessuno può verificare nemmeno strutturalmente (a differenza di Android, qui manca anche la certezza su **quale** set di template la categoria approvata renderebbe disponibili — §2.4 `automotive-feasibility.md`).

## Cosa richiede account/entitlement/dispositivo/simulatore/approvazione esterna

| Elemento                                               | Richiesto per                                                                           | Stato                                                                                                      |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Account Apple Developer                                | Inviare la richiesta di entitlement (`developer.apple.com/contact/carplay/`)            | Non avviato in questa sessione — azione di prodotto/business                                               |
| CarPlay app entitlement                                | Registrare qualunque scena CarPlay a runtime (§2.10 `automotive-feasibility.md`)        | Non richiesto, esito comunque discrezionale                                                                |
| Lettura integrale CarPlay Developer Guide (PDF)        | Confermare requisiti funzionali della categoria "Fueling" e l'elenco template assegnato | Non estratta con gli strumenti disponibili nella sessione che ha prodotto `automotive-feasibility.md` (§3) |
| Mac con Xcode + "Additional Tools for Xcode"           | CarPlay Simulator (§2.18 `automotive-feasibility.md`)                                   | Non verificato disponibile in questo ambiente; comunque inutilizzabile senza Scene Delegate implementato   |
| Dispositivo iOS fisico o simulatore con app installata | Qualunque test end-to-end della scena CarPlay                                           | N/A finché non esiste codice nativo da eseguire                                                            |

## Domande aperte da sbloccare (invariate rispetto a `automotive-architecture-decision.md`)

Riprese qui per tracciabilità, non duplicate come logica:

1. Motus resta puramente informativo in auto, o valuta funzionalità/partnership che l'avvicinino ai requisiti tipici di "Fueling"?
2. C'è disponibilità a presentare una richiesta di entitlement esplorativa ad Apple, accettando tempi ed esito incerti?
3. In assenza di approvazione "Fueling", la categoria "Parking" è un fallback accettabile dal punto di vista prodotto?

## Criterio di sblocco futuro

Quando `automotive-architecture-decision.md` assegnerà a CarPlay uno stato `feasible`, `feasible-with-native-work` o `partially-feasible` (dopo che le domande sopra saranno risposte e/o la Developer Guide sarà letta integralmente), il Task 16 va rieseguito da capo su questo documento: rilettura della decisione aggiornata, scaffolding nativo isolato (`native/carplay/`, per analogia con `native/android-auto/`), config plugin non registrato di default in `app.json` (per lo stesso motivo architetturale di `android-auto-integration.md` §4 e ADR-0003), e collegamento ai view model del Task 14 già pronti.

## Test aggiunti

`__tests__/automotive/carplayGate.test.ts` — guardrail, non una verifica del comportamento CarPlay (che non esiste):

1. Verifica che `automotive-architecture-decision.md` classifichi ancora CarPlay come `requires-product-clarification` — se un futuro commit cambia questo stato senza aggiornare questo report, il test fallisce qui invece di lasciare il report silenziosamente disallineato.
2. Verifica che nessuno scaffolding CarPlay sia stato introdotto di nascosto: nessuna cartella `ios/`, nessun file `*.entitlements`, nessun plugin `plugins/*carplay*`, nessuna chiave CarPlay (`UIApplicationSceneManifest`, `com.apple.developer.carplay`) in `app.json`.

## Vincoli rispettati

- **Non falsificato alcun entitlement.**
- **Non dichiarato verificato** nulla che richieda approvazioni non disponibili (categoria Fueling, entitlement Apple).
- **Nessun altro target compromesso**: nessuna modifica a file Android/mobile esistenti, nessuna cartella `ios/` creata.
- **Nessuna simulazione di CarPlay tramite Expo Router.**
