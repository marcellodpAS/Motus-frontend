# Motus — Backlog delle feature (vertical slice)

Ogni voce è una vertical slice piccola e verificabile, ordinata per implementazione (vedi `implementation-plan.md` per il raggruppamento in fasi e i gate tra fasi). Ogni slice è sviluppabile autonomamente: non richiede che un'altra slice dello stesso livello sia già completa, solo le fondamenta (VS0, VS1).

Legenda dipendenze: 🧱 fondamenta richieste · 🔗 destinazione di navigazione (non blocca lo sviluppo, blocca solo il collegamento finale).

---

## VS0 — Fondamenta: client e servizi API

**Scopo**: fornire un unico punto di accesso tipizzato alle 4 chiamate applicative realmente necessarie, isolando le incoerenze note del contratto (`api-discrepancies.md`, `open-questions.md`) dal resto del codice.

**Schermate**: nessuna. Slice puramente infrastrutturale.

**Endpoint**: `GET /api/stations`, `GET /api/stations/{id}`, `GET /api/prices`, `GET /api/stations/nearby`. `GET /health` escluso (nessuna schermata lo consuma, `screen-inventory.md`).

**Componenti**: nessuno (nessuna UI).

**Stato**: nessuno stato applicativo; eventuale configurazione letta una volta (`EXPO_PUBLIC_API_URL`) senza store dedicato.

**Test**:

- Client HTTP: mapping corretto delle 3 forme di risposta (successo 200, errore applicativo `{"error"}`, lista vuota `data: []`) su fixture derivate da `api-contract.md`.
- Ogni funzione di risorsa: parametri inviati correttamente (inclusi alias `comune`/`city`, parametro non documentato `q`), normalizzazione di `total`/`total_available` in un unico campo `Pagination.total`.
- Caso limite: `EXPO_PUBLIC_API_URL` assente/vuota deve fallire in modo esplicito e testabile, non silenziosamente (oggi la variabile è dichiarata ma non letta — `repository-audit.md`).

**Dipendenze**: nessuna (prima slice del backlog).

**Criterio di completamento**: ogni funzione di `src/services/motus` ha un test che copre almeno un caso di successo e un caso di errore applicativo, usando solo fixture (nessuna chiamata di rete reale nei test). Nessuna route o componente UI creata in questa slice.

---

## VS1 — Kit UI condiviso per stati lista

**Scopo**: fornire gli organism riusabili da tutte le schermate "lista con filtri" (caricamento, vuoto, errore, popolato) senza duplicare questa logica in ciascuna feature.

**Schermate**: nessuna dedicata — componenti condivisi consumati da VS2, VS3, VS4, VS5.

**Endpoint**: nessuno diretto (i componenti ricevono dati/stato via prop).

**Componenti**:

- atom: indicatore di caricamento (wrapper su `ActivityIndicator` con token di tema).
- molecule: riga di errore applicativo (messaggio + eventuale azione "riprova").
- organism: contenitore lista che decide quale stato mostrare (caricamento / vuoto / errore / popolato) dato uno stato esplicito passato dalla feature — non deduce lo stato da solo.

**Stato**: nessuno interno oltre eventuali animazioni; lo stato di richiesta è sempre posseduto dalla feature chiamante.

**Test**: rendering per ciascuno dei 4 stati (caricamento, vuoto, errore, popolato con contenuto arbitrario), verifica che il messaggio di errore non assuma un formato specifico di `{"error"}` (deve accettare una stringa generica, dato che il body 500 non è mai stato osservato dal vivo — solo da specifica, `api-contract.md`).

**Dipendenze**: 🧱 nessuna da VS0 (può procedere in parallelo).

**Criterio di completamento**: gli organism sono importabili da qualunque feature futura senza modifiche, con storia di test che copre i 4 stati indipendentemente da un backend reale.

---

## VS2 — Ricerca impianti (S01) — ✅ Completata (Task 13, 2026-08-05)

**Scopo**: permettere all'utente di cercare impianti per comune, provincia o testo libero, e vederne l'elenco con i relativi prezzi (UC2).

**Schermate**: S01 (`screen-inventory.md`).

**Endpoint**: `GET /api/stations?comune=&provincia=&q=&limit=&offset=` (`api-screen-mapping.md`, §S01).

**Componenti**:

- Riusa il kit di VS1 per gli stati caricamento/vuoto/errore.
- Nuovo (locale alla feature finché non serve altrove): campo/i filtro, riga risultato che mostra `nome_impianto` (gestendo stringa vuota, osservata dal vivo), `bandiera`, `comune`/`provincia`, ed eventuale prezzo di sintesi da `prices[]` (gestendo array vuoto, osservato dal vivo su impianto 3498).

**Stato**: locale alla feature — filtri correnti, stato di richiesta (idle/loading/success/error), pagina corrente (`offset`). Nessuno stato promosso a Zustand (nessun altro schermo consuma questi filtri).

**Test**:

- Hook dati: chiama `stations.search` con i parametri attesi per ciascuna combinazione di filtro.
- Paginazione: stop corretto quando `offset + data.length >= pagination.total`.
- Integrazione schermata (servizio mockato): copre popolato, nessun risultato, errore parametri (400 solo se un client bacato invia `limit`/`offset` non interi — caso limite da testare comunque), errore server.

**Dipendenze**: 🧱 VS0, VS1. 🔗 naviga a S03 (VS3) — il collegamento reale si completa quando VS3 esiste, ma VS2 è sviluppabile e verificabile prima (con un placeholder di navigazione).

**Criterio di completamento**: dall'avvio dell'app (anche senza shell di navigazione, via singola route) è possibile cercare impianti e vedere risultati reali o gli stati alternativi coperti dai test; `pnpm validate` verde.

**Note di implementazione (Task 13)**: implementato `useStationsSearch` (`src/features/stations-search/useStationsSearch.ts`) — hook dati che possiede filtri, stato di richiesta (`loading`/`success`/`error`), paginazione a offset (stop quando `offset + data.length >= pagination.total`, verificato via test) e retry dell'ultima richiesta effettivamente fallita (non un reset a offset 0). `StationsSearchScreen` (già esistente come shell dal Task 12) ora è cablata all'hook: singolo campo di ricerca mappato su `q` (copre comune/provincia/testo libero, dato che il server applica `LIKE` su tutti e tre — vedi `user-flows.md` Flusso 1), riga risultato con fallback `nome_impianto -> bandiera -> id_impianto` e prezzo minimo da `prices[]` (assente se `prices: []`), selezione riga naviga a `/stations/[id]`. Nessun nuovo componente condiviso introdotto: riuso completo di `ListScreenTemplate`/`FunctionalList`/`ListItem`/`AppText` (§ `mcp-design-log.md` §7). Test aggiunti: `__tests__/features/useStationsSearch.test.ts` (chiamata iniziale, combinazioni di filtro, stop di paginazione, esito vuoto, errore + retry), `__tests__/features/StationsSearchScreen.test.tsx` (popolato con `nome_impianto`/`prices` vuoti, vuoto, errore server, errore 400, testo digitato, navigazione a S03); `__tests__/app/stations-navigation.test.tsx` aggiornato per mockare il servizio invece di affidarsi a `EXPO_PUBLIC_API_URL` assente (nessuna chiamata di rete reale in nessun test, `testing-strategy.md` §2). `pnpm validate` (lint, format:check, typecheck, test --runInBand) verde. Verifica manuale su simulatore iOS/Android non eseguita in questa sessione (nessun simulatore/dispositivo disponibile nell'ambiente di esecuzione) — da fare come attività di QA manuale separata prima del rilascio.

---

## VS3 — Dettaglio impianto (S03)

**Scopo**: mostrare i dati di un impianto e tutti i suoi prezzi correnti (UC3).

**Schermate**: S03.

**Endpoint**: `GET /api/stations/{id}` (`api-screen-mapping.md`, §S03).

**Componenti**:

- Riusa il kit di VS1 per caricamento/errore/non-trovato.
- Nuovo: blocco dati impianto (tutti i campi di `station.*`), lista prezzi ordinata per `carburante`, `self_service` (ordine già garantito dal server, il client non deve riordinare).

**Stato**: locale — `id_impianto` da parametro di route, stato di richiesta. Nessuno stato condiviso.

**Test**:

- Hook dati: chiamata con `id` corretto, gestione dei due casi 404 distinti (id numerico inesistente → messaggio specifico; id malformato → messaggio generico indistinguibile da routing — il client non deve inventare una distinzione che il backend non offre).
- Integrazione schermata: popolato con prezzi, popolato senza prezzi (`prices: []`), senza coordinate geocodificate (`latitudine_completa`/`longitudine_completa` entrambe `null`) — se la UI prevede un'azione legata alla posizione (es. apri mappa), questo stato deve avere un fallback esplicito, non un crash o un campo vuoto silenzioso.

**Dipendenze**: 🧱 VS0, VS1. Nessuna dipendenza da VS2/VS4/VS5 per essere costruita e testata (raggiungibile in sviluppo con un `id_impianto` di test passato via route param); il collegamento da più punti di ingresso arriva con VS6.

**Criterio di completamento**: dato un `id_impianto` valido passato alla route, la schermata mostra i dati reali o uno degli stati alternativi coperti dai test; `pnpm validate` verde.

---

## VS4 — Ricerca prezzi per carburante (S02)

**Scopo**: permettere di cercare prezzi filtrando per tipo di carburante, provincia o comune (UC4).

**Schermate**: S02.

**Endpoint**: `GET /api/prices?carburante=&provincia=&comune=&limit=&offset=` (`api-screen-mapping.md`, §S02).

**Componenti**:

- Riusa il kit di VS1.
- Riusa la _forma_ di template "lista con filtri" introdotta in VS2 (stesso pattern, non lo stesso componente dati: la riga risultato è diversa, vedi sotto).
- Nuovo: riga risultato per `PriceRow` — oggetto **strutturalmente diverso** da `Station` (non contiene `indirizzo`, `gestore`, `bandiera`, `tipo_impianto`; ha `carburante`, `prezzo`, `self_service`, `data_comunicazione` in formato non ISO `GG/MM/AAAA HH:MM:SS`) — non riusare il componente riga di VS2 forzandolo su dati incompatibili.

**Stato**: locale alla feature — filtri (incluso `carburante`, testo libero senza validazione enum: il set di valori osservati non è esaustivo, `api-contract.md`), stato di richiesta, `offset`.

**Test**: stessa struttura di VS2 (chiamata con parametri attesi, paginazione, stati popolato/vuoto/errore), più un test specifico sul formato non-ISO di `data_comunicazione` (parsing esplicito, non passato as-is a un costruttore `Date` senza normalizzazione).

**Dipendenze**: 🧱 VS0, VS1. 🔗 naviga a S03 (VS3, già pronta da questa fase in poi).

**Criterio di completamento**: ricerca per carburante funzionante con risultati reali o stati alternativi coperti dai test; selezione riga naviga a un `id_impianto` valido; `pnpm validate` verde.

---

## VS5 — Impianti vicini "vicino a me" (S04)

**Scopo**: trovare gli impianti più vicini a una posizione geografica data, ordinati per distanza (UC5).

**Schermate**: S04.

**Endpoint**: `GET /api/stations/nearby?lat=&lon=&limit=` (`api-screen-mapping.md`, §S04). Nota: `offset` è accettato dal server ma ignorato — questa slice non implementa paginazione per scroll, solo un `limit` esplicito.

**Componenti**:

- Riusa il kit di VS1.
- Riusa la forma "lista con filtri" (qui il filtro è la posizione, non testo).
- Riusa il componente riga risultato di VS2 (stesso schema `Station` + campo aggiuntivo `distance_km`).
- Nuovo: stato di richiesta permesso di posizione (non concesso / negato / non disponibile) con messaggio esplicito, distinto dagli stati di errore di rete.

**Stato**: locale alla feature per lo stato di richiesta dati. La posizione corrente **può** essere promossa a Zustand solo se una seconda schermata arriva a consumarla (oggi non è il caso: nessun'altra schermata confermata la usa — non anticipare lo store, ADR-0004).

**Test**:

- Hook dati: chiamata con `lat`/`lon` correnti, gestione 400 (mancanti/non numerici, fuori range con messaggi distinti per lat/lon).
- Integrazione schermata: popolato ordinato per distanza (l'ordine è garantito dal server, il test verifica solo che non venga alterato), nessun impianto con coordinate disponibili (`total_available: 0`), permesso negato/non disponibile.
- Test esplicito che un impianto `geocoding_status: "source_only"` non compare mai in questa schermata anche se esiste nel dataset — comportamento atteso del backend (`open-questions.md` #10), non un difetto da "correggere" lato client.

**Dipendenze**: 🧱 VS0, VS1. Più una capability di piattaforma non presente oggi: aggiunta di `expo-location` (o libreria Expo equivalente al momento dell'implementazione) — unico punto del backlog in cui è prevista una nuova dipendenza (vedi `implementation-plan.md`, Fase 4). 🔗 naviga a S03.

**Criterio di completamento**: con permesso di posizione concesso, la schermata mostra impianti reali ordinati per distanza o uno degli stati alternativi coperti dai test; con permesso negato, mostra un fallback esplicito invece di una lista vuota indistinguibile da "nessun risultato"; `pnpm validate` verde.

---

## VS6 — Shell di navigazione

**Scopo**: collegare i tre punti di ingresso (S01, S02, S04) e la destinazione comune (S03) in una navigazione coerente.

**Schermate**: nessuna nuova — solo composizione delle route esistenti.

**Endpoint**: nessuno diretto.

**Componenti**: struttura di navigazione Expo Router (route group/tab, deciso in fase di implementazione — non fissato qui per non progettare una IA definitiva in questo task).

**Stato**: nessuno applicativo; eventuale stato di navigazione è gestito da Expo Router stesso.

**Test**: navigazione da ciascun punto di ingresso a S03 e ritorno (back-navigation) verso la schermata di provenienza corretta; nessuna route orfana raggiungibile solo manualmente.

**Dipendenze**: 🧱 VS2, VS3, VS4, VS5 tutte completate (è l'unica slice che dipende da altre feature, per costruzione — è la loro composizione, non una vertical slice indipendente in senso stretto).

**Criterio di completamento**: l'app avviata espone tutti e tre i punti di ingresso, ciascuno raggiunge S03 correttamente; nessuna schermata delle 4 rimane isolata; `pnpm validate` verde.

---

## Ordine di implementazione (riepilogo)

1. **VS0** — Fondamenta: client e servizi API
2. **VS1** — Kit UI condiviso per stati lista _(parallelizzabile con VS0)_
3. **VS2** — Ricerca impianti (S01)
4. **VS3** — Dettaglio impianto (S03)
5. **VS4** — Ricerca prezzi per carburante (S02)
6. **VS5** — Impianti vicini "vicino a me" (S04) _(unica slice che aggiunge una dipendenza: geolocalizzazione)_
7. **VS6** — Shell di navigazione

VS2, VS3, VS4, VS5 non dipendono tecnicamente l'una dall'altra (solo da VS0/VS1): l'ordine 3→4→5→6 riflette priorità di prodotto (schermate meglio definite prima, capability nativa per ultima), non un vincolo architetturale rigido — vedi `architecture.md` §10.

## Fuori da questo backlog

Automotive (integrazione nativa), dark mode definitivo, offline/cache persistente e autenticazione **non hanno una vertical slice**: dipendono da decisioni di prodotto/design non ancora prese (vedi `implementation-plan.md`, "Fasi non pianificate in questo task", e `open-questions.md`). Il modello condiviso automotive (tipi, mapping, comandi, adapter senza SDK) è invece stato costruito fuori da questo backlog di vertical slice, come Task 14 dedicato — vedi `docs/motus/automotive-shared-model.md`. Lo scaffolding nativo Android Auto (config plugin isolato, `CarAppService` Kotlin non compilato in questo ambiente) è Task 15 — vedi `docs/motus/android-auto-integration.md`.
