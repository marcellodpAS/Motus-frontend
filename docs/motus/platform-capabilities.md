# Motus — Sistema di platform capability (Task 8)

Deliverable del Task 8 (`src/platform`). Centralizza il rilevamento della piattaforma e delle capacità disponibili, così che i componenti leggano `useDeviceContext()`/`resolveCapabilities()` invece di disseminare controlli `Platform.OS` propri (vincolo esplicito del task).

## 1. Cosa è realmente rilevato a runtime

Solo **iOS e Android**. `resolvePlatform()` (`src/platform/deviceContext.ts`) legge `Platform.OS` e restituisce `"ios"` o `"android"`; qualunque altro valore (es. `"web"` durante `pnpm web`, ambiente di solo sviluppo documentato in `local-setup.md` §Web, mai un target di prodotto in `architecture.md`) ricade su `UNSUPPORTED_OS_FALLBACK` (`"android"`) — un valore fisso e documentato, non un'euristica.

`"android-auto"` e `"carplay"` esistono nel tipo `MotusPlatform` ma **non vengono mai prodotti da `resolvePlatform()`**: nessun `CarAppService` o `CPTemplateApplicationSceneDelegate` esiste in questo repository e nessuno dei due va aggiunto qui (ADR-0003, vincolo esplicito del Task 8 "non implementare SDK automotive"). Le loro capability restano comunque tipizzate e testabili tramite `buildDeviceContext(platform)`, che è una funzione pura utilizzabile con qualunque `MotusPlatform` — utile per test e per una futura implementazione nativa, senza introdurne oggi il codice.

## 2. Legenda di confidenza

Riusa la stessa legenda di `automotive-feasibility.md`:

- 🟢 confermato da fonte ufficiale consultata direttamente (`automotive-feasibility.md`/`automotive-architecture-decision.md`, Task 5)
- 🟡 fondato su documentazione ufficiale ma non verificato testualmente in quella sessione, o inferito per analogia
- valore "non applicabile" (senza emoji): non deriva da un limite di piattaforma ma da uno stato del progetto (es. nessuna libreria audio installata) — non va confuso con un limite tecnico del dispositivo

## 3. Tabella delle capability

| Capability          | ios / android                                                                                                                               | android-auto                                                       | carplay                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `touchInput`        | `true` — input primario reale                                                                                                               | `true` 🟢 §1.6                                                     | `true` 🟢 §2.6                                                                  |
| `rotaryInput`       | `false` — nessuna periferica rotativa su telefono                                                                                           | `true` 🟢 §1.6 (solo alcuni veicoli)                               | `true` 🟡 §2.6 ("su alcuni veicoli", non confermato in modo indipendente)       |
| `voiceInput`        | `false` — non applicabile: nessuna libreria vocale integrata (`product-requirements.md` §13, `repository-audit.md`), non un limite hardware | `true` 🟢 §1.7 (via App Actions/Gemini, non implementato nell'app) | `true` 🟢 §2.7 (Siri)                                                           |
| `compactDisplay`    | `false` — schermo telefono, nessuna soglia di design definita per "compatto"                                                                | `true` 🟢 §1.4                                                     | `true` 🟡 inferito da UI a template (§2.4), non confermato testualmente         |
| `automotive`        | `false`                                                                                                                                     | `true`                                                             | `true`                                                                          |
| `textEntry`         | `true` — S01/S02 usano ricerca testuale libera                                                                                              | `false` 🟢 §1.6 (tastiera sconsigliata alla guida)                 | `false` 🟡 per analogia — §2.5 non estratto dal PDF sorgente in quella sessione |
| `complexNavigation` | `true` — routing/gesture completi                                                                                                           | `false` 🟢 §1.5 (max 5 passaggi)                                   | `false` 🟡 stessa limitazione di `textEntry`                                    |
| `backgroundAudio`   | `false` — non applicabile: Motus non ha alcuna feature audio                                                                                | `false` — non applicabile                                          | `false` — non applicabile                                                       |

Sorgenti dettagliate per ogni riga 🟢/🟡: `docs/motus/automotive-feasibility.md` (§1 Android Auto, §2 CarPlay).

## 4. `InteractionMode` e `ComponentDensity` risolti

| Platform      | `interactionModes`             | `density`       |
| ------------- | ------------------------------ | --------------- |
| ios / android | `["touch"]`                    | `"comfortable"` |
| android-auto  | `["touch", "rotary", "voice"]` | `"automotive"`  |
| carplay       | `["touch", "rotary", "voice"]` | `"automotive"`  |

`"compact"` (valore di `ComponentDensity`) **non viene mai prodotto**: nessun requisito di design definisce una soglia compatto/comfortable per i telefoni (`design-inputs.md` — nessun design system finalizzato). Introdurre una soglia arbitraria (es. una larghezza in pixel) sarebbe esattamente l'euristica non documentata che il Task 8 esclude. Riservato a una decisione futura basata su un requisito reale.

## 5. Capability esplicitamente non rilevabili oggi

| Capability/valore                                                         | Perché non è rilevato                                                                                                      | Dove è tracciato                                     |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Qualunque valore per `android-auto`/`carplay`                             | Nessun SDK nativo nel progetto; nessuna implementazione automotive pianificata in questo task                              | ADR-0003, `automotive-architecture-decision.md`      |
| `voiceInput` su ios/android                                               | Nessuna libreria vocale installata — non un limite del dispositivo                                                         | `product-requirements.md` §13, `repository-audit.md` |
| `backgroundAudio` su qualunque piattaforma                                | Motus non ha alcuna feature audio                                                                                          | `product-requirements.md` §13                        |
| `compact` (density)                                                       | Nessun breakpoint di design definito                                                                                       | `design-inputs.md`                                   |
| `rotaryInput`/`compactDisplay`/`textEntry`/`complexNavigation` su CarPlay | Guida ufficiale CarPlay non estraibile testualmente in quella sessione; valori inferiti per analogia con Android Auto (🟡) | `automotive-feasibility.md` §3                       |

## 6. Perché un hook e non un Provider

`useDeviceContext()` (`src/platform/deviceContext.ts`) è un hook che calcola il `DeviceContext` con `useMemo`, non un `Context`/`Provider`: `Platform.OS` non cambia durante la vita di un processo app, quindi non esiste stato da distribuire o invalidare nell'albero dei componenti. Un `Provider` sarebbe complessità non richiesta da alcun requisito (coerente con la posizione YAGNI di `architecture.md` §6 sull'introduzione di stato condiviso). Se in futuro emergesse un requisito reale di override runtime (es. un tema "auto" forzato manualmente per test o demo), la promozione a `Context` resta un cambio isolato a questo modulo.

## 7. Struttura dei file

```text
src/platform/
├── types.ts              # MotusPlatform, InteractionMode, ComponentDensity, PlatformCapabilities, DeviceContext
├── capabilities.ts        # CAPABILITIES_BY_PLATFORM, resolveCapabilities()
├── deviceContext.ts        # resolvePlatform(), buildDeviceContext(), getDeviceContext(), useDeviceContext()
├── index.ts                # barrel pubblico
├── mobile/capabilities.ts       # MOBILE_CAPABILITIES (ios + android, condivise)
├── android-auto/capabilities.ts # ANDROID_AUTO_CAPABILITIES (documentata, mai risolta a runtime)
└── carplay/capabilities.ts      # CARPLAY_CAPABILITIES (documentata, mai risolta a runtime)
```

Nessun componente esistente importa ancora da `src/platform` (nessuna feature applicativa lo richiede oggi, `repository-audit.md`): il modulo è pronto per essere consumato quando la prima feature avrà bisogno di adattare la UI a `interactionModes`/`density`/`capabilities`, senza dover ripetere controlli `Platform.OS` per componente.

## 8. Test

`__tests__/platform/capabilities.test.ts` e `__tests__/platform/deviceContext.test.ts` coprono: le 4 combinazioni piattaforma→capability (incluse quelle mai raggiungibili a runtime, verificate tramite `buildDeviceContext` puro), il fallback esplicito per `Platform.OS` non supportati, e la memoizzazione dell'hook.
