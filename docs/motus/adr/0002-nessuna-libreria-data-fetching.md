# ADR-0002 — Nessuna libreria di data-fetching/cache in questa fase

## Stato

Accettata.

## Contesto

Il Task 6 vieta esplicitamente l'aggiunta di nuove dipendenze. Indipendentemente dal vincolo, i 4 casi d'uso confermati (`product-requirements.md` §3) non hanno requisiti che giustifichino una libreria di cache/sincronizzazione (React Query, SWR, Apollo, ecc.):

- l'API è interamente di sola lettura, nessuna mutazione client (`api-contract.md`, "Endpoint potenzialmente distruttivi: nessuno esiste");
- il dataset server-side viene sostituito integralmente una volta al giorno (`user-flows.md`, Flusso 6), non ci sono aggiornamenti incrementali da sincronizzare in tempo reale;
- nessun requisito di modalità offline è raccolto (`open-questions.md` #7, esplicitamente aperto e non deciso).

## Decisione

I dati server sono letti tramite hook dedicati per risorsa (es. `useStationsSearch`, `useStationDetail`) che incapsulano chiamata + stato di richiesta (idle/loading/success/error) usando solo `useState`/`useEffect` e i moduli di `src/services/motus`. Nessuna cache condivisa tra schermate, nessun retry automatico, nessuna invalidazione basata su tempo.

## Conseguenze

- Ogni schermata rifà la propria chiamata quando montata; non c'è deduplicazione tra schermate che richiedono lo stesso dato (accettabile: non risulta un caso d'uso in cui due schermate confermate richiedono lo stesso impianto contemporaneamente).
- Se in futuro emergesse un requisito reale di cache/offline, la migrazione a una libreria dedicata resta isolata dentro gli hook di `src/services`/`src/hooks`, senza toccare i componenti (che ricevono solo dati e stato via prop).
- Questa decisione va rivista con un nuovo ADR se un requisito di prodotto (non solo tecnico) la rendesse insufficiente — non va anticipata ora.
