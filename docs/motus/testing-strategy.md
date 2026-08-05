# Motus — Strategia di testing

Adatta la piramide di test alla toolchain già presente nel repository (`repository-audit.md`: Jest, `jest-expo`, React Native Testing Library, ESLint flat config, Prettier, `tsc --noEmit`, tutti già cablati in `pnpm validate`). Nessuno strumento nuovo viene introdotto in questo task.

## 1. Livelli di test

| Livello                | Strumento (già presente)                                 | Cosa copre                                                                                                                                                                                                            |
| ---------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Statico                | `tsc --noEmit`, ESLint, Prettier                         | Tipi, regole di stile, formattazione — già in `pnpm validate`                                                                                                                                                         |
| Unit                   | Jest                                                     | Funzioni pure: normalizzazione contratto API, formule (nessuna calcolata lato client oggi — `distance_km` arriva già calcolato dal server), mapping tipi                                                              |
| Componenti             | Jest + React Native Testing Library (`jest-expo` preset) | atoms/molecules/organisms: rendering, props, stati visivi (caricamento/vuoto/errore/popolato)                                                                                                                         |
| Hook di dati           | Jest + RNTL (`renderHook` o equivalente)                 | Hook per risorsa (es. `useStationsSearch`): chiamata al servizio con i parametri attesi, gestione stato di richiesta                                                                                                  |
| Store                  | Jest                                                     | Store Zustand, stesso pattern già presente in `__tests__/useAppStore.test.ts`                                                                                                                                         |
| Integrazione schermata | Jest + RNTL, servizio mockato                            | Feature screen intera: verifica che gli stati previsti da `user-flows.md`/`api-screen-mapping.md` siano tutti raggiungibili e renderizzati correttamente                                                              |
| E2E                    | — (non presente)                                         | Non introdotto in questo task: richiederebbe una nuova dipendenza (Detox/Maestro), vietata dai vincoli del Task 6. Se necessario in futuro, va deciso con un ADR dedicato, non aggiunto implicitamente in una feature |

Nessuna soglia di copertura numerica arbitraria viene imposta: `repository-audit.md` segnala già che una copertura 100% su codice placeholder è "corretta matematicamente ma non indica maturità funzionale". Il criterio di adeguatezza è invece **per slice**: ogni vertical slice in `feature-backlog.md` elenca esplicitamente gli stati/casi limite che i suoi test devono coprire, derivati da evidenza reale (`api-contract.md`, verificato dal vivo) o da specifica (comportamenti solo documentati, es. 500).

## 2. Come mockare senza nuove dipendenze

- **Livello servizio**: `jest.spyOn(global, "fetch")` (o `global.fetch = jest.fn()`), nessuna libreria di mock HTTP aggiuntiva. I test dei moduli in `src/services/motus` restano gli unici a mockare `fetch` direttamente.
- **Livello hook/schermata**: mock del modulo di servizio stesso (`jest.mock("@/services/motus/stations")`), non di `fetch` — un test di integrazione schermata non deve conoscere il formato HTTP, solo il contratto TypeScript del servizio.
- **Nessuna chiamata di rete reale in nessun test automatico.** Il backend Motus è un repository separato, non garantito raggiungibile in CI (`api-contract.md` usa un'istanza locale di sessione, non un ambiente di test dedicato).

## 3. Fixture: derivate da evidenza reale, non inventate

Ogni fixture usata nei test deve poter essere ricondotta a un'osservazione già documentata, per evitare di testare comportamenti mai verificati:

| Caso                                                                    | Fonte                                                                                             | Slice che lo richiede                                                            |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `nome_impianto: ""`                                                     | `api-contract.md` (impianto 57660, osservato dal vivo)                                            | VS2, VS3                                                                         |
| `prices: []`                                                            | `api-contract.md` (impianto 3498 "NURE SUD", osservato dal vivo)                                  | VS2, VS3                                                                         |
| `geocoding_status: "source_only"`, coordinate `null`                    | `api-contract.md` (impianto 60502, osservato dal vivo)                                            | VS3, VS5                                                                         |
| `data_comunicazione` formato `GG/MM/AAAA HH:MM:SS` (non ISO)            | `api-contract.md`, osservato dal vivo                                                             | VS4                                                                              |
| 404 `"impianto non trovato"` (id numerico inesistente)                  | `api-contract.md`, verificato con `999999999`                                                     | VS3                                                                              |
| 404 `"endpoint non trovato"` (id non numerico)                          | `api-contract.md`, verificato con `abc`/`12.5`/`-1`                                               | VS3                                                                              |
| 400 `lat`/`lon` mancanti, non numerici, fuori range (messaggi distinti) | `api-contract.md`, verificato dal vivo                                                            | VS5                                                                              |
| 400 `limit`/`offset` non interi                                         | `api-contract.md`, verificato dal vivo                                                            | VS0, VS2, VS4                                                                    |
| `total` vs `total_available` (nomi di campo diversi)                    | `api-discrepancies.md`                                                                            | VS0 (normalizzazione)                                                            |
| `offset` accettato ma ignorato su `nearby`                              | `api-contract.md`                                                                                 | VS5                                                                              |
| 500 `"database non disponibile"`                                        | 📄 solo da specifica, non riproducibile dal vivo senza operazione distruttiva (`api-contract.md`) | tutte le slice con chiamata di rete — testato come mock, non come caso osservato |

## 4. Responsabilità di test per livello architetturale

- **`src/services/motus`**: proprietario dei test sul contratto HTTP grezzo (status code, forma del body, normalizzazione). Nessun altro livello deve ri-testare questi dettagli.
- **`src/components` (atoms/molecules/organisms/templates)**: proprietario dei test di rendering puro — dato uno stato/prop esplicito, cosa viene mostrato. Non conoscono `services`, quindi non li mockano mai.
- **`src/features/<feature>`**: proprietario dei test di integrazione schermata — dato un servizio mockato, la schermata reagisce correttamente (chiamata giusta, stato giusto, componente giusto per stato).
- **`src/stores`**: proprietario dei test di transizione di stato dello store (pattern già stabilito da `useAppStore.test.ts`), solo per gli store che sopravvivono al principio "solo stato condiviso" (`architecture.md` §6, ADR-0004).

## 5. Cosa non si testa in questo perimetro

Coerente con `implementation-plan.md`, "Fasi non pianificate": automotive, dark mode definitivo, offline/cache, autenticazione non hanno test pianificati perché non hanno una vertical slice. Aggiungere test per queste aree prima che esista una decisione di prodotto sarebbe testare un comportamento non specificato.

## 6. Integrazione in CI

- Riusa `.github/workflows/validate.yml` esistente (`pnpm validate`: lint, format:check, typecheck, test) su Node 22.13.x — nessuna modifica al workflow richiesta da questo task.
- `pnpm test:coverage` resta uno script disponibile ma non class-gated in CI finché non esiste una prima feature reale su cui misurare una soglia sensata (evita di ripetere il problema già segnalato in `repository-audit.md`: copertura 100% su placeholder che non significa maturità).
- Nessun test in CI dipende da un backend Motus raggiungibile: tutti i test di rete sono mockati a livello di `fetch` o di modulo servizio (§2). Una verifica manuale contro un'istanza reale del backend (come fatto per produrre `api-contract.md`) resta un'attività di sviluppo/QA manuale, non parte della suite automatica.
