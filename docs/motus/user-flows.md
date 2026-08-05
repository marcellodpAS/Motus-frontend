# Motus — Flussi utente

Tutti i flussi sono dedotti dal comportamento effettivo di `app/api.py` (uniche interazioni possibili: chiamate `GET` agli endpoint elencati in `product-requirements.md`). Non esistendo alcuna interfaccia nella cartella `Motus`, i passaggi "utente" descrivono l'interazione con l'API, non con una UI specifica; l'associazione a schermate è in `screen-inventory.md` ed è marcata come assunzione.

Legenda: 🟢 Confermato dal codice/README — 🟡 Assunzione ragionevole per rendere il flusso comprensibile end-to-end.

---

## Flusso 1 — Ricerca impianti per zona

**Attore:** utente consultante · **Endpoint:** `GET /api/stations`

1. 🟡 L'utente indica un comune (e opzionalmente provincia e/o testo libero `q`).
2. 🟢 Il client chiama `GET /api/stations?comune=...&provincia=...&limit=...&offset=...`.
3. 🟢 Il server filtra `stations_enriched` con `LIKE` su `comune`/`provincia`/`q` (quest'ultimo su `comune`, `provincia`, `nome_impianto`, `indirizzo`, `via_geocoded`), pagina con `limit`/`offset` e ordina per `id_impianto` (`app/api.py:92-128`).
4. 🟢 Per ogni impianto trovato, il server allega l'array `prices` (`with_prices`, `app/api.py:130-144`).
5. 🟢 Risposta 200 con `{"data": [...], "pagination": {"limit", "offset", "total"}}`.
6. 🟡 L'utente seleziona un impianto dalla lista → **Flusso 2**.

### Alternative / errori

- 🟢 `limit`/`offset` non numerici → 400 `"limit e offset devono essere numeri interi"`.
- 🟡 Nessun impianto corrisponde ai filtri → 200 con `data: []` (nessun messaggio di "nessun risultato" definito da alcun documento: da progettare lato client).
- 🟢 `limit` > 1000 o < 1 viene silenziosamente riportato nel range [1, 1000], non genera errore.
- 🟢 Errore database → 500 `"database non disponibile"`.

---

## Flusso 2 — Dettaglio impianto

**Attore:** utente consultante · **Endpoint:** `GET /api/stations/{id}`

1. 🟡 L'utente apre il dettaglio di un impianto (da Flusso 1, Flusso 3 o Flusso 4).
2. 🟢 Il client chiama `GET /api/stations/{id_impianto}`.
3. 🟢 Il server cerca l'impianto in `stations_enriched`; se trovato, recupera tutti i prezzi ordinati per `carburante`, `self_service` (`app/api.py:198-217`).
4. 🟢 Risposta 200 con `{"station": {...}, "prices": [...]}`.

### Alternative / errori

- 🟢 `id_impianto` inesistente → 404 `"impianto non trovato"`.
- 🟢 `id` non numerico nel path → nessuna route corrisponde alla regex `/api/stations/(\d+)` → 404 generico `"endpoint non trovato"`.
- 🟢 Errore database → 500 `"database non disponibile"`.

---

## Flusso 3 — Ricerca prezzi per carburante

**Attore:** utente consultante · **Endpoint:** `GET /api/prices`

1. 🟡 L'utente sceglie un tipo di carburante e, opzionalmente, provincia o comune.
2. 🟢 Il client chiama `GET /api/prices?carburante=...&provincia=...&comune=...&limit=...&offset=...`.
3. 🟢 Il server esegue `prices JOIN stations_enriched` filtrando con `LIKE` sui parametri forniti, pagina e ordina per `id_impianto` (`app/api.py:219-248`).
4. 🟢 Risposta 200 con righe di prezzo arricchite dei dati identificativi dell'impianto (`nome_impianto`, `comune`, `provincia`, coordinate) e `pagination`.
5. 🟡 L'utente può passare al dettaglio dell'impianto associato a una riga → **Flusso 2**.

### Alternative / errori

- 🟢 `limit`/`offset` non numerici → 400.
- 🟡 Nessun prezzo corrisponde ai filtri → 200 con `data: []`.
- 🟢 Errore database → 500.

---

## Flusso 4 — Impianti più vicini ("vicino a me")

**Attore:** utente consultante · **Endpoint:** `GET /api/stations/nearby`

1. 🟡 L'utente richiede gli impianti più vicini alla propria posizione (es. tramite geolocalizzazione del device — non descritta in alcun documento, solo assunta come origine di `lat`/`lon`).
2. 🟢 Il client chiama `GET /api/stations/nearby?lat=...&lon=...&limit=...`.
3. 🟢 Il server valida `lat` (∈[-90,90]) e `lon` (∈[-180,180]) come numeri obbligatori (`app/api.py:146-155`).
4. 🟢 Il server seleziona solo gli impianti con coordinate complete non nulle (`latitudine_completa`/`longitudine_completa`), calcola la distanza haversine da ciascuno, ordina per distanza crescente e tronca a `limit` (default 50 da codice, 1–1000; il README dichiara invece un default di 20 — contraddizione, vedi `open-questions.md`).
5. 🟢 Per ogni impianto restituito allega `prices` e `distance_km` arrotondata a 3 decimali.
6. 🟢 Risposta 200 con `{"origin": {"lat","lon"}, "data": [...], "pagination": {"limit","total_available"}}`.
7. 🟡 L'utente seleziona un impianto → **Flusso 2**.

### Alternative / errori

- 🟢 `lat`/`lon` mancanti o non numerici → 400 `"lat e lon sono obbligatorie e devono essere numeriche"`.
- 🟢 `lat` fuori range → 400 `"lat deve essere compresa tra -90 e 90"`.
- 🟢 `lon` fuori range → 400 `"lon deve essere compresa tra -180 e 180"`.
- 🟢 Nessun impianto con coordinate disponibili nel database → 200 con `data: []`, `total_available: 0`.
- 🟡 Impianti con `geocoding_status` = `source_only` (via nota ma nessuna coordinata) **non possono comparire** in questo flusso, pur potendo comparire nei Flussi 1–3: incoerenza di visibilità tra flussi, da chiarire (vedi `open-questions.md`).
- 🟢 Errore database → 500.

---

## Flusso 5 — Verifica stato del servizio (operativo, non end-user)

**Attore:** operatore/sistema di monitoraggio · **Endpoint:** `GET /health`

1. 🟢 Chiamata `GET /health`.
2. 🟢 Risposta 200 con `status: "ok"`, conteggio `stations`, conteggio `prices`, `last_import` (MAX di `imports.imported_at`).
3. 🟡 Non è definito alcun comportamento per un servizio "non ok": il codice restituisce sempre `"status": "ok"` se il database risponde; un errore di connessione al DB produce invece 500 `"database non disponibile"`, non un corpo con `status` diverso da `ok`.

### Alternative / errori

- 🟢 Database non raggiungibile → 500 `"database non disponibile"`.

---

## Flusso 6 — Import giornaliero dati MIMIT (flusso di sistema, non utente)

**Attore:** sistema (cron) · **Trigger:** avvio container + ogni giorno alle 08:30 `Europe/Rome`

1. 🟢 Download CSV prezzi (`PRICES_URL`) e anagrafica impianti (`STATIONS_URL`) da MIMIT (`app/importer.py:281-284`).
2. 🟢 `DELETE` totale di `prices` e `stations`, poi `INSERT` di tutte le righe scaricate, in un'unica transazione (`app/importer.py:289-336`).
3. 🟢 Scrittura di due righe in `imports` (una per dataset `prices`, una per `stations`).
4. 🟢 Esecuzione di `geocode_missing`: per ogni impianto con indirizzo vuoto o coordinate mancanti e non ancora tentato (o con esito `no_result` se `GEOCODING_RETRY_NO_RESULTS=1`), interroga Nominatim con throttling di 15 secondi tra richieste, salva l'esito in `station_geocoding` (`app/importer.py:177-278`).
5. 🟢 In caso di riga anagrafica non riconoscibile dal parser (`type_index is None`), l'intero import fallisce con eccezione (nessun import parziale silenzioso, ma nemmeno un log strutturato di errore oltre allo stack trace).

### Alternative / errori

- 🟢 Riga CSV prezzi con formato inatteso → eccezione Python non gestita, import interrotto (nessun retry automatico oltre al prossimo giorno).
- 🟢 Chiamata Nominatim fallita → `status: "error"`, cachata; l'impianto non verrà ritentato ai prossimi import salvo `GEOCODING_RETRY_NO_RESULTS=1` (solo per `no_result`, non per `error`).
- 🟡 Non è chiaro se un import fallito lasci il database nello stato del giorno precedente o in uno stato parziale: la transazione `with connection:` copre `DELETE`+`INSERT`+log `imports`, ma non è documentato alcun meccanismo di notifica in caso di fallimento.
