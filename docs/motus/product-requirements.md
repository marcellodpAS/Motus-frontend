# Motus — Specifica dei requisiti di prodotto

## Fonti analizzate

Cartella analizzata: `/Users/marcellodepaola/Desktop/Projects/Motus` (repository separato, backend Python — **non** una sottocartella di `Motus-frontend`).

| File | Ruolo |
| --- | --- |
| `README.md` | Documentazione funzionale e operativa del servizio |
| `app/api.py` | Server HTTP (endpoint, parametri, codici di errore) |
| `app/importer.py` | Job di importazione CSV MIMIT e geocodifica |
| `app/entrypoint.sh` | Avvio container: import iniziale, API, cron |
| `app/crontab` | Pianificazione import giornaliero |
| `Dockerfile`, `compose.yaml` | Ambiente di esecuzione |
| `bruno/motus-api/*.bru` | Collezione di richieste HTTP di esempio (5 endpoint) |

Nessun altro file (mockup, wireframe, user story, backlog, specifica UI) è presente nella cartella `Motus`. Tutto ciò che segue è ricavato esclusivamente da questi 9 file.

Per riferimento incrociato è stato inoltre consultato `docs/motus/repository-audit.md` (deliverable del Task 1, in questo stesso repository), che conferma lo stato di `Motus-frontend`: applicazione Expo (SDK 54, iOS/Android/web) allo stadio di bootstrap, senza schermate applicative, senza client HTTP (`src/services` vuota) e con `EXPO_PUBLIC_API_URL` dichiarata ma non letta dal codice.

**Legenda usata in tutto il documento:** 🟢 Confermato (presente esplicitamente nei documenti) — 🟡 Assunzione (dedotto per coerenza, non dichiarato esplicitamente) — 🔴 Assente (non trattato in alcun documento).

---

## 1. Finalità dell'app

🟢 Motus è un servizio che raccoglie quotidianamente i dati pubblici del MIMIT (Ministero delle Imprese e del Made in Italy) su impianti di distribuzione carburanti e relativi prezzi in Italia, li normalizza in un database SQLite e li espone tramite una API HTTP di sola consultazione, per permettere di:
- cercare impianti di distribuzione per comune/provincia/testo libero;
- consultare il dettaglio di un impianto e i suoi prezzi correnti;
- cercare prezzi per tipo di carburante e area geografica;
- trovare gli impianti più vicini a una posizione geografica data.

🟢 Gli impianti privi di indirizzo o coordinate nel dataset MIMIT vengono arricchiti una tantum tramite geocodifica (Nominatim/OpenStreetMap), cachata in modo permanente per non ripetere le richieste ai successivi import (`README.md:51`, `app/importer.py`).

🟡 Motus-frontend (repository corrente) è presumibilmente il client applicativo (mobile/web) di questa API, ma nessun documento della cartella `Motus` lo dichiara esplicitamente, né esiste un contratto API condiviso tra i due repository. Vedi `open-questions.md`.

## 2. Categorie di utenti

🟢 **Utente consultante (end user)**: chiunque interroghi gli endpoint pubblici `GET /health`, `GET /api/stations`, `GET /api/stations/{id}`, `GET /api/prices`, `GET /api/stations/nearby`. Nessuna registrazione, login o profilo è richiesto o previsto.

🟢 **Operatore/sviluppatore**: chi gestisce il servizio via `docker compose`, esegue import manuali (`docker compose exec importer python /app/importer.py`), interroga il database SQLite direttamente, o riprova le geocodifiche fallite (`GEOCODING_RETRY_NO_RESULTS=1`). Interagisce da riga di comando, non da un'interfaccia applicativa.

🔴 Nessuna distinzione di ruoli, piani, permessi o account è presente nei documenti. Non esistono categorie come "utente premium", "amministratore applicativo" o "gestore di impianto".

## 3. Casi d'uso

Ricavati uno a uno dagli endpoint esposti da `app/api.py` e documentati in `README.md`:

| ID | Caso d'uso | Attore | Endpoint |
| --- | --- | --- | --- |
| UC1 | Verificare lo stato del servizio (conteggio impianti/prezzi, ultimo import) | Operatore | `GET /health` |
| UC2 | Cercare impianti per comune, provincia o testo libero, con paginazione | Utente consultante | `GET /api/stations` |
| UC3 | Visualizzare il dettaglio di un impianto e tutti i suoi prezzi | Utente consultante | `GET /api/stations/{id}` |
| UC4 | Cercare prezzi filtrando per carburante, provincia o comune | Utente consultante | `GET /api/prices` |
| UC5 | Trovare gli impianti più vicini a una posizione geografica, ordinati per distanza | Utente consultante | `GET /api/stations/nearby` |
| UC6 | Importare quotidianamente i dataset MIMIT e aggiornare prezzi/impianti | Sistema (job automatico) | n/a (cron, non HTTP) |
| UC7 | Geocodificare gli impianti privi di indirizzo/coordinate complete | Sistema (job automatico) | n/a (chiamata a Nominatim) |

🔴 Nessun caso d'uso di scrittura (creazione/modifica/cancellazione di impianti o prezzi da parte di un utente) è presente: l'API è di sola lettura (`GET`/`OPTIONS`, `app/api.py:40-46`).

## 4. Entità e relazioni tra entità

Vedi `domain-model.md` per il dettaglio completo di attributi, tipi e chiavi. Sintesi:

- **Impianto (Station)** 1 — N **Prezzo (Price)**
- **Impianto (Station)** 1 — 0..1 **Geocodifica (StationGeocoding)**
- **StazioneArricchita (stations_enriched)**: vista derivata da Impianto + Geocodifica, non un'entità persistita a sé
- **Import**: log operativo di ogni esecuzione del job (dataset `prices` o `stations`), non collegato a singoli impianti/prezzi da chiave esterna

## 5. Dati visualizzati

🟢 Per ogni impianto (`stations_enriched`, `app/importer.py:130-138`): `id_impianto`, `gestore`, `bandiera`, `tipo_impianto` (`Stradale`/`Autostradale`), `nome_impianto`, `indirizzo`, `comune`, `provincia`, `latitudine`/`longitudine` (dato MIMIT originale), `via_geocoded`, `latitudine_completa`/`longitudine_completa` (coalescenza dato originale + geocodifica), `geocoding_status`, `updated_at`.

🟢 Per ogni prezzo (`prices`): `id_impianto`, `carburante`, `prezzo`, `self_service` (0/1), `data_comunicazione`, `updated_at`.

🟢 Nella ricerca "vicino a me": in aggiunta, `distance_km` (calcolata con formula haversine) e l'origine della ricerca (`origin.lat`, `origin.lon`).

🟢 Metadati di paginazione: `limit`, `offset`, `total` (endpoint `stations`/`prices`) oppure `total_available` (endpoint `nearby` — nome del campo diverso, vedi `open-questions.md`).

🟢 In `/health`: `status`, conteggio `stations`, conteggio `prices`, `last_import` (timestamp UTC ISO 8601 dell'ultimo import registrato in `imports`).

🟡 Elenco dei valori possibili di `carburante` non è enumerato in alcun documento: compare solo l'esempio `Benzina` (README, collezione Bruno). Il campo è testo libero proveniente dal CSV MIMIT (`descCarburante`).

## 6. Azioni consentite

🟢 Esclusivamente lettura via `GET`. `OPTIONS` è supportato solo per il preflight CORS (`app/api.py:40-45`), non espone dati.

🔴 Nessuna azione di scrittura, upload, segnalazione prezzo da parte dell'utente, preferiti, notifiche o interazione sociale è presente in alcun documento.

## 7. Requisiti di autenticazione

🔴 **Nessuno.** Nessun endpoint richiede credenziali, token, API key o sessione. `Access-Control-Allow-Origin: *` conferma un'API pubblica accessibile da qualunque origine (`app/api.py:36`).

## 8. Requisiti di autorizzazione

🔴 **Nessuno.** Non esistono ruoli né permessi differenziati: ogni chiamante ottiene la stessa risposta per lo stesso URL.

## 9. Errori previsti

🟢 Ricavati da `app/api.py:47-69` e dai relativi messaggi:

| Condizione | Codice | Corpo risposta |
| --- | --- | --- |
| Percorso non riconosciuto | 404 | `{"error": "endpoint non trovato"}` |
| `id_impianto` inesistente su `/api/stations/{id}` | 404 | `{"error": "impianto non trovato"}` |
| `limit`/`offset` non interi | 400 | `{"error": "limit e offset devono essere numeri interi"}` |
| `lat`/`lon` mancanti o non numerici su `/nearby` | 400 | `{"error": "lat e lon sono obbligatorie e devono essere numeriche"}` |
| `lat` fuori intervallo [-90, 90] | 400 | `{"error": "lat deve essere compresa tra -90 e 90"}` |
| `lon` fuori intervallo [-180, 180] | 400 | `{"error": "lon deve essere compresa tra -180 e 180"}` |
| Errore del database (`sqlite3.Error`) | 500 | `{"error": "database non disponibile"}` |

🟡 `limit` fuori range [1, 1000] e `offset` negativo **non generano errore**: vengono silenziosamente riportati entro i limiti (`min`/`max` in `app/api.py:21-27`). Se questo sia il comportamento voluto per un client applicativo è segnalato in `open-questions.md`.

🟡 Nessun risultato per una ricerca (lista vuota) non è un errore: risposta 200 con `data: []`. Comportamento dedotto dalla query SQL, non descritto esplicitamente nel README.

## 10. Funzionalità mobile

🔴 Nessuna funzionalità mobile-specifica (notifiche push, geolocalizzazione nativa, modalità offline, deep link) è descritta in alcun documento della cartella `Motus`: è un backend puro, senza alcun riferimento a client.

🟡 L'unico indizio di un client mobile è indiretto: `Motus-frontend` (repository corrente) è un'app Expo cross-platform (iOS/Android/web secondo `docs/motus/repository-audit.md`), ma non è nominata né referenziata da alcun file in `Motus`, e non esiste ancora un client HTTP nel frontend che consumi questa API.

## 11. Funzionalità automotive

🔴 **Assente.** Nessun riferimento ad Android Auto, Apple CarPlay, integrazione infotainment o uso in auto è presente in alcun documento analizzato, in nessuno dei due repository.

## 12. Vincoli operativi rilevati

🟢 Import automatico giornaliero alle 08:30 `Europe/Rome` via cron (`app/crontab`), più un import immediato all'avvio del container (`app/entrypoint.sh:5`).

🟢 Ogni import sostituisce integralmente le tabelle `prices` e `stations` (`DELETE` + `INSERT`, `app/importer.py:290-291`): non c'è storicizzazione dei prezzi precedenti, solo l'ultimo stato è consultabile.

🟢 La geocodifica è sequenziale, una richiesta alla volta, con attesa di 15 secondi tra richieste (`GEOCODING_DELAY_SECONDS`), per rispettare i limiti d'uso di Nominatim (`README.md:65`).

🟢 Paginazione: `limit` sempre compreso tra 1 e 1000 (default 50 per `stations`/`prices`; per `nearby` il README dichiara un default di 20, in contraddizione con il codice — vedi `open-questions.md`).

## 13. Requisiti esplicitamente fuori scopo (non presenti in nessun documento)

- Autenticazione/autorizzazione, account utente, profili, preferiti
- Storico prezzi, grafici di andamento, notifiche di variazione prezzo
- Scrittura/segnalazione dati da parte dell'utente
- Internazionalizzazione (tutti i messaggi di errore sono in italiano, hardcoded)
- Rate limiting sui client dell'API pubblica (solo il job interno di geocodifica è rate-limited)
- Qualunque interfaccia utente, mockup o wireframe
