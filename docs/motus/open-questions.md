# Motus — Domande aperte e requisiti ambigui/contraddittori

Ogni voce indica: documento/i coinvolti, natura del problema, impatto se non chiarito.

## Contraddizioni confermate

### 1. Default di `limit` su `/api/stations/nearby`

- **Documenti**: `README.md:49` vs `app/api.py:21-27,146-156`.
- **Problema**: il README dichiara "_con limite predefinito di 20_" per l'endpoint nearby. Il codice usa la stessa funzione `pagination()` di tutti gli altri endpoint, il cui default è **50** se `limit` non è passato. Non esiste nel codice alcun default speciale a 20 per `nearby`.
- **Impatto**: un client che si affida alla documentazione per omettere `limit` riceverà 50 risultati, non 20. Da verificare con chi mantiene il backend se il codice o il README è la fonte corretta.

### 2. Nome del campo "totale" incoerente tra endpoint

- **Documenti**: `app/api.py:124,244` (`stations`, `prices` → campo `pagination.total`) vs `app/api.py:189-192` (`nearby` → campo `pagination.total_available`).
- **Problema**: stesso concetto (numero di elementi disponibili), nome del campo diverso a seconda dell'endpoint, e semantica leggermente diversa (`total` = righe che soddisfano il filtro; `total_available` = righe con coordinate valide, non filtrate per `limit` ma comunque non è il "totale impianti" assoluto).
- **Impatto**: un client che consuma la risposta con un unico modello di paginazione dovrà gestire due nomi di campo diversi, oppure il backend dovrebbe uniformare il contratto prima che un frontend venga costruito su di esso.

## Requisiti non documentati ma presenti solo nel codice

### 3. Parametro di ricerca libera `q` su `/api/stations`

- **Documenti**: `app/api.py:104-109` (presente), `README.md` (assente).
- **Problema**: il README non menziona il parametro `q`, che invece cerca su 5 colonne diverse (`comune`, `provincia`, `nome_impianto`, `indirizzo`, `via_geocoded`). Comportamento non descritto per l'utente finale (è una ricerca "OR" su più campi, con `LIKE` — quindi anche substring match, case-sensitivity dipendente da SQLite).
- **Impatto**: una UI di ricerca "libera" può essere costruita, ma senza garanzie documentate sul comportamento (es. se cambierà in futuro), e senza sapere se è il pattern di ricerca principale o secondario voluto dal prodotto.

### 4. Comportamento di `limit`/`offset` fuori range

- **Documenti**: `app/api.py:21-27`.
- **Problema**: valori fuori range vengono corretti silenziosamente (`min`/`max`) invece di generare un errore 400, a differenza di `lat`/`lon` che invece falliscono esplicitamente se fuori range. Incoerenza di trattamento tra tipi di parametri.
- **Impatto**: da chiarire se è il comportamento voluto (tollerante) o se andrebbe uniformato con una risposta di errore esplicita, specialmente per l'esperienza di un client applicativo che potrebbe voler sapere se il proprio input è stato "corretto" silenziosamente.

## Assenze rilevanti per una specifica applicativa completa

### 5. Nessun requisito di autenticazione/autorizzazione

- **Documenti**: tutti (assenza trasversale).
- **Domanda aperta**: l'app è concepita come permanentemente pubblica e anonima, o l'assenza di auth riflette solo lo stato attuale (MVP) del backend? Nessun documento lo dichiara in un senso o nell'altro.
- **Impatto**: alto se in futuro si prevedono funzionalità utente-specifiche (preferiti, notifiche prezzo) che richiederebbero un'identità.

### 6. Nessun collegamento esplicito tra backend Motus e Motus-frontend

- **Documenti**: `Motus/README.md` non nomina alcun client; `Motus-frontend/.env.example` dichiara `EXPO_PUBLIC_API_URL=` vuota e non letta dal codice (da `docs/motus/repository-audit.md`).
- **Domanda aperta**: `Motus-frontend` è realmente il client previsto per questa API? Non esiste un contratto API versionato o condiviso tra i due repository (es. OpenAPI spec, tipi condivisi).
- **Impatto**: alto — l'intero screen-inventory.md di questo task è un'assunzione costruita a ritroso dagli endpoint, non un requisito di prodotto confermato.

### 7. Funzionalità mobile-specifiche non definite

- **Documenti**: assenza trasversale.
- **Domanda aperta**: è prevista modalità offline, cache locale, notifiche push di variazione prezzo, autorizzazione a geolocalizzazione in background? Nessun documento tratta questi temi.
- **Impatto**: medio-alto per la progettazione tecnica del client mobile (Flusso 4 richiede coordinate, ma la modalità di acquisizione — GPS, ricerca manuale indirizzo — non è specificata).

### 8. Funzionalità automotive: totalmente assenti

- **Documenti**: nessuno.
- **Domanda aperta**: Motus è mai stato pensato per un contesto automotive (CarPlay/Android Auto), come suggerirebbe il nome del task ("funzionalità automotive" nell'elenco delle attività richieste) o è fuori perimetro?
- **Impatto**: se richiesto in futuro, comporta vincoli UI specifici (schermi semplificati, interazione vocale, sicurezza alla guida) non contemplati da nessun endpoint o schermata attuale.

### 9. Endpoint `/health`: uso previsto non chiarito

- **Documenti**: `app/api.py:71-90`, `README.md:17-21`.
- **Domanda aperta**: è solo per monitoraggio infrastrutturale (uptime checks) o deve alimentare uno stato visibile all'utente finale (es. banner "dati non aggiornati" se `last_import` è vecchio)? Il campo `status` è sempre `"ok"` se il DB risponde: non riflette la freschezza del dato.
- **Impatto**: basso/medio — rilevante solo se si vuole comunicare all'utente la data di aggiornamento dei prezzi in UI.

### 10. Visibilità incoerente delle stazioni "source_only" tra endpoint

- **Documenti**: `app/api.py:159-165` (nearby) vs `app/api.py:92-128` (stations), `app/importer.py:130-138` (vista).
- **Problema**: un impianto con `geocoding_status = 'source_only'` (via nota, ma nessuna coordinata numerica) compare in `/api/stations` e `/api/prices`, ma è **escluso** da `/api/stations/nearby` (che richiede `latitudine_completa`/`longitudine_completa` non nulle).
- **Domanda aperta**: è un comportamento voluto (nearby richiede necessariamente coordinate numeriche per calcolare la distanza, quindi tecnicamente inevitabile) o andrebbe segnalato esplicitamente in UI ("impianto non mostrabile su mappa/vicino a te")?
- **Impatto**: medio — un utente potrebbe vedere un impianto nella ricerca per comune (S01) ma non trovarlo mai nella ricerca "vicino a me" (S04), senza spiegazione visibile.

### 11. Enumerazione dei carburanti non documentata

- **Documenti**: `README.md`, collezione Bruno — solo l'esempio `Benzina` compare.
- **Domanda aperta**: quali sono tutti i valori possibili di `carburante` (Gasolio, GPL, Metano, altri)? Nessun documento li elenca; il campo è testo libero dal CSV MIMIT.
- **Impatto**: medio per la progettazione di filtri UI (select vs testo libero) e per eventuali icone/etichette per tipo di carburante.

### 12. Gestione di un import fallito a metà

- **Documenti**: `app/importer.py:281-348`.
- **Domanda aperta**: se il CSV prezzi scarica correttamente ma il CSV impianti fallisce (o viceversa), oppure se una riga del CSV impianti non è parsabile (`ValueError` non catturata), l'intero import si interrompe con eccezione non gestita. Non è documentato alcun meccanismo di notifica, retry automatico o rollback esplicito oltre alla transazione SQLite implicita.
- **Impatto**: alto per l'affidabilità operativa, ma fuori dal perimetro diretto della specifica applicativa lato utente; segnalato perché incide sulla freschezza/disponibilità dei dati mostrati in UI.

## Riepilogo per priorità di chiarimento

| #   | Tema                                                                   | Priorità                                           |
| --- | ---------------------------------------------------------------------- | -------------------------------------------------- |
| 6   | Collegamento Motus ↔ Motus-frontend / contratto API condiviso          | Alta                                               |
| 1   | Contraddizione default `limit` su `/nearby`                            | Alta                                               |
| 5   | Assenza auth: intenzionale o provvisoria?                              | Alta                                               |
| 8   | Perimetro automotive: dentro o fuori scopo?                            | Alta                                               |
| 2   | Incoerenza nome campo `total`/`total_available`                        | Media                                              |
| 10  | Visibilità stazioni `source_only` tra endpoint                         | Media                                              |
| 7   | Funzionalità mobile-specifiche (offline, notifiche, geolocalizzazione) | Media                                              |
| 3   | Parametro `q` non documentato                                          | Bassa                                              |
| 4   | Correzione silenziosa di `limit`/`offset` fuori range                  | Bassa                                              |
| 9   | Uso previsto di `/health` in UI                                        | Bassa                                              |
| 11  | Enumerazione carburanti                                                | Bassa                                              |
| 12  | Gestione import fallito                                                | Bassa (per questa specifica; alta per operatività) |
