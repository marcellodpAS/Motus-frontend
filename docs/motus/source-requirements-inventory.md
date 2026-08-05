# Motus — Inventario funzionale dalle specifiche originali (Task 19, Fase 2)

## Nota metodologica

Fonte riletta direttamente in questa sessione: repository `/Users/marcellodepaola/Desktop/Projects/Motus`
(non i riassunti di `docs/motus/product-requirements.md` prodotti nei task
precedenti in `Motus-frontend`). File letti per intero: `README.md`,
`app/api.py`, `app/importer.py`, `app/crontab`, `compose.yaml`, tutti i
`.bru` in `bruno/motus-api/` (incluso l'ambiente `local.bru`).

**Osservazione fondamentale**: questa cartella **non contiene alcuna
specifica di prodotto o UX** (nessun PRD, nessuna user story, nessun
wireframe, nessun documento di requisiti). Contiene esclusivamente il
**codice sorgente del backend**: una pipeline di importazione dati
(`importer.py`) + un server HTTP minimale di sola lettura (`api.py`),
containerizzati con Docker, più una collezione Bruno di esempi di
chiamata. Le "specifiche originali" per questo prodotto **coincidono con
il comportamento effettivo del codice backend** — non esiste un documento
terzo che descriva intenzioni diverse dal codice. Questo fa collassare
parzialmente le fonti di verità #2 ("specifiche originali") e #3
("comportamento reale del backend") richieste dal task in un'unica fonte:
qui il codice _è_ la specifica. Confermato anche dal vivo: il backend su
`192.168.1.148:8080` risponde `200` a `GET /health` e **`501`
("Unsupported method")** a `POST /api/prices` — nessuna capacità di
scrittura esiste, né dichiarata né nascosta.

Legenda conformità alla richiesta del task:

- 🟢 **requisito confermato** — presente nel codice/README con comportamento osservabile
- 🟡 **assunzione** — dedotto per coerenza ma non dichiarato esplicitamente
- 🔴 **requisito ambiguo** — comportamento non specificato, nessuna fonte lo chiarisce
- — **design presente solo su Stitch** / **funzionalità presente solo nelle specifiche**: marcati esplicitamente dove rilevante, per confronto diretto con `stitch-screen-inventory.md`

---

## 1. Cos'è Motus secondo il codice sorgente originale

🟢 Dal README (riga 3): _"Import giornaliero dei CSV MIMIT in SQLite, con
geocodifica una tantum degli impianti privi di indirizzo o coordinate."_
Motus, alla radice, è un **sistema di consultazione prezzi carburante
italiani** basato sui dati aperti del MIMIT (Ministero delle Imprese e del
Made in Italy), arricchiti con geocodifica quando l'anagrafica ufficiale
non fornisce coordinate. Non è descritto da nessuna parte come prodotto
"mobility/navigation brand premium" (quella caratterizzazione esiste solo
nel `DESIGN.md` di Stitch — vedi `stitch-screen-inventory.md` §0 — è quindi
un'aggiunta di posizionamento fatta in fase di design, non nella specifica
originale).

## 2. Fonti dati e pipeline (per capire cosa può _davvero_ esistere in UI)

🟢 Due CSV ufficiali scaricati quotidianamente (`app/importer.py:14-21`):

- `prezzo_alle_8.csv` (prezzi) — MIMIT
- `anagrafica_impianti_attivi.csv` (anagrafica impianti) — MIMIT

🟢 Geocodifica **una tantum** (non ricorrente) via Nominatim/OpenStreetMap
per impianti privi di indirizzo/coordinate, con throttling di 15s tra
richieste, risultato cache in `station_geocoding` (stato `success` /
`source_only` / `no_result` / `error`) e mai richiesta di nuovo dopo il
primo tentativo (`README.md` righe 51-52, `importer.py:177-190`).

🟢 **`prices` viene svuotata e riscritta ad ogni import** (`importer.py:290`:
`DELETE FROM prices` prima di reinserire) — **nessuna tabella di storico
prezzi esiste**. Ogni import sovrascrive i prezzi precedenti senza
conservarne una copia storica. Import quotidiano alle 08:30 Europe/Rome
(`app/crontab`).

## 3. Schema dati reale (unica fonte di verità sui campi disponibili)

🟢 Tabella `stations` (`importer.py:85-97`):
`id_impianto, gestore, bandiera, tipo_impianto, nome_impianto, indirizzo, comune, provincia, latitudine, longitudine, updated_at`

🟢 Tabella `prices` (`importer.py:99-107`), chiave composta:
`id_impianto, carburante, prezzo, self_service, data_comunicazione, updated_at`

🟢 Vista `stations_enriched` (`importer.py:130-138`): tutti i campi di
`stations` + `via_geocoded`, `latitudine_completa`, `longitudine_completa`
(fallback su geocodifica se mancanti), `geocoding_status`.

🟢 Tabella `station_geocoding`: `id_impianto, query, status, via, latitudine, longitudine, display_name, provider, attempted_at, error_message`.

🟢 Tabella `imports`: `id, dataset, extraction, imported_at, rows_count` (per `last_import` in `/health`).

**Campi che NON esistono in nessuna tabella** (confermato leggendo l'intero
schema): orari di apertura, badge "Open 24/7", servizi/amenity (bar,
autolavaggio, bagni, negozio, colonnina elettrica), logo/immagine del
brand della stazione, immagine/foto della stazione, valutazioni/recensioni,
identità utente, preferiti, cronologia prezzi, previsioni. Questo è il
riscontro diretto — nel codice originale, non dedotto — del gap già
segnalato in `stitch-screen-inventory.md` per Dettaglio Stazione e
Previsioni Pro.

## 4. Endpoint reali e comportamento esatto (unica "specifica" API esistente)

🟢 Tutti gli endpoint sono **`GET` (+ `OPTIONS` per CORS)**. Il server
(`http.server.BaseHTTPRequestHandler`) non implementa `do_POST`, `do_PUT`,
`do_DELETE` — qualunque richiesta di scrittura riceve **`501 Unsupported
method`** dal comportamento di default della libreria standard Python,
verificato anche dal vivo in questa sessione (`POST /api/prices` → `501`).
**Nessuna funzionalità di scrittura esiste a nessun livello**: né
segnalazione prezzo, né preferiti, né autenticazione, né profilo utente.

| Endpoint                   | Parametri                                                                                                                                        | Comportamento                                                                                                                                      | Righe            |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `GET /health`              | nessuno                                                                                                                                          | `{status, stations: count, prices: count, last_import}`                                                                                            | `api.py:71-90`   |
| `GET /api/stations`        | `comune`/`city` (alias), `provincia`, `q` (ricerca full su comune/provincia/nome/indirizzo/via_geocoded), `limit` (1-1000, default 50), `offset` | Lista impianti con `prices` annidato per ciascuno, paginazione                                                                                     | `api.py:92-128`  |
| `GET /api/stations/{id}`   | id numerico in path                                                                                                                              | Dettaglio impianto (`stations_enriched`) + array `prices` separato (non annidato come in lista); `404 {"error":"impianto non trovato"}` se assente | `api.py:198-217` |
| `GET /api/prices`          | `carburante`, `provincia`, `comune`, `limit`, `offset`                                                                                           | Righe prezzo con colonne stazione denormalizzate (`nome_impianto, comune, provincia, via_geocoded, coordinate`)                                    | `api.py:219-248` |
| `GET /api/stations/nearby` | `lat`, `lon` (obbligatori, validati per range), `limit` (1-1000)                                                                                 | Stazioni con coordinate note, ordinate per distanza Haversine, `distance_km` per riga, `pagination.total_available` (non `total`, non `offset`)    | `api.py:146-196` |

🟢 Errori: `400` con messaggio testuale per parametri non validi (es. `lat`
non numerica), `404` per id inesistente o path sconosciuto (`{"error":
"endpoint non trovato"}`), `500` per errori SQLite generici. Nessun altro
codice di stato documentato o osservato.

## 5. Funzionalità implicite deducibili dall'API (uniche azioni utente supportabili con dati reali)

Poiché non esiste una specifica UX, le uniche "azioni utente" che il
prodotto può _davvero_ supportare sono quelle che l'API rende possibili:

1. 🟢 **Cercare impianti** per comune/provincia/testo libero, con paginazione → richiede `GET /api/stations`.
2. 🟢 **Vedere il dettaglio di un impianto** con i suoi prezzi correnti (per carburante e modalità self/servito) → richiede `GET /api/stations/{id}`.
3. 🟢 **Cercare prezzi** filtrati per carburante/provincia/comune, con dati stazione denormalizzati → richiede `GET /api/prices`.
4. 🟢 **Trovare impianti vicini a una posizione** (coordinate esplicite, non "posizione utente" per sé — il backend non fa nulla con la posizione del device, riceve solo `lat`/`lon` come parametri) → richiede `GET /api/stations/nearby`.
5. 🟡 **Verificare lo stato del servizio** (numero impianti/prezzi importati, ultimo import) → `GET /health`, presente ma — come già notato in `mobile-completion-matrix.md` Flusso 5 — non è chiaramente una funzionalità _utente finale_, più uno strumento diagnostico/ops. Nessuna fonte lo smentisce o conferma esplicitamente come schermata utente.

**Nessuna fonte originale (README, codice, Bruno) menziona**: segnalazione
prezzo da parte dell'utente, previsioni/analisi predittiva, mappa
interattiva, preferiti, profilo utente, autenticazione, notifiche, servizi
Pro/premium, amenity di stazione, orari di apertura. Tutti questi sono
**presenti solo nell'export Stitch** (vedi tabella di confronto in fondo).

## 6. Vincoli tecnici e operativi rilevanti per il client

🟢 CORS aperto (`Access-Control-Allow-Origin: *`) — nessuna restrizione di
origine, coerente con un client mobile che chiama l'API direttamente.

🟢 Nessuna chiave API, nessun token, nessun header di autenticazione
richiesto da nessun endpoint (verificato: `auth: none` in tutti i file
`.bru`, nessuna verifica di header in `api.py`).

🟢 Porta di default `8080`, path DB `/data/motus.db` — configurabili solo
via variabili d'ambiente lato server, irrilevanti per il client.

🟢 `data_comunicazione` (data comunicazione prezzo) è nel formato grezzo
MIMIT così come arriva dal CSV, non necessariamente ISO — coerente con
quanto già documentato in `api-contract.md`/`api-discrepancies.md` nei
task precedenti (qui riconfermato dalla fonte, non solo dal riassunto:
`importer.py:305` scrive `row["dtComu"].strip() or None` senza alcuna
normalizzazione di formato).

## 7. Requisiti ambigui rilevati nella fonte originale

🔴 **`/health` come schermata utente o solo endpoint diagnostico**: nessuna
menzione nel README di un uso lato utente finale; il campo `last_import`
suggerisce un uso più operativo/debug. Non risolvibile da questa fonte.

🔴 **Significato di `q` in `/api/stations`**: cerca su 5 colonne diverse
contemporaneamente (comune, provincia, nome, indirizzo, via_geocoded) — il
README non lo documenta affatto (menziona solo `comune`/`city`/`provincia`),
è stato scoperto solo leggendo `api.py:104-109`. Comportamento UX previsto
per una ricerca così ampia (es. singola search bar libera vs filtri
separati) non specificato in nessuna fonte originale.

🔴 **Significato di "vicino"**: `nearby` richiede `lat`/`lon` espliciti nella
query — non c'è alcuna indicazione se il client debba usare la posizione
GPS del device, un indirizzo digitato, o altro. L'implementazione attuale
(`useNearbyStations`, da verificare in Fase 3) ha assunto GPS/`expo-location`,
ma questa è un'assunzione dell'app, non un requisito della fonte originale.

---

## 8. Confronto diretto: specifiche originali vs Stitch

| Elemento                                                                    | Specifiche originali (`Motus` backend)                                                                       | Stitch (`stitch-screen-inventory.md`)                                                                       |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Ricerca impianti/prezzi                                                     | 🟢 Confermato (`/api/stations`, `/api/prices`)                                                               | Non ha una schermata Stitch dedicata nell'export (la search bar in Previsioni Pro è solo un placeholder UI) |
| Dettaglio impianto — prezzi                                                 | 🟢 Confermato (`/api/stations/{id}`)                                                                         | 🟢 Presente (sezione "Current Prices") — coerente                                                           |
| Dettaglio impianto — amenity, orari, "Open 24/7", logo brand, immagine hero | 🔴 **Assente dallo schema dati**, nessun campo disponibile                                                   | 🟢 Presente e centrale nel layout                                                                           | → **bloccato dal backend**, non solo "da implementare"                                                                              |
| Impianti vicini (coordinate esplicite)                                      | 🟢 Confermato (`/api/stations/nearby`)                                                                       | 🟢 Presente come lista "Cheapest Nearby" dentro Mappa Motus, non come schermata a parte                     | Coerente nel dato, diversa nella presentazione (lista vs mappa)                                                                     |
| Mappa interattiva con pin                                                   | 🔴 Non menzionata, nessun endpoint di tile/mappa                                                             | 🟢 Schermata "Mappa Motus" completa                                                                         | → **presente solo su Stitch**, richiede libreria mappe lato client (dati coordinate già disponibili via `/api/stations`, `/nearby`) |
| Segnalazione prezzo utente                                                  | 🔴 **Nessun endpoint di scrittura esiste** (`POST` → `501`)                                                  | 🟢 Schermata "Segnala Prezzo" completa con form                                                             | → **presente solo su Stitch, bloccato dal backend** (nessun modo di persistere la segnalazione)                                     |
| Previsioni/analisi predittiva prezzo                                        | 🔴 **Nessuno storico prezzi persistito** (`prices` viene svuotata a ogni import), nessun endpoint predittivo | 🟢 Schermata "Previsioni Pro" completa (trend 7 giorni, raccomandazione)                                    | → **presente solo su Stitch, bloccato dal backend** (dato sorgente per il trend non esiste proprio)                                 |
| Preferiti/Save                                                              | 🔴 Nessuna persistenza utente, nessuna identità utente                                                       | 🟢 Bottone "Save" in Dettaglio Stazione, tab "Favorites" in bottom nav                                      | → **presente solo su Stitch, bloccato dal backend**                                                                                 |
| Profilo utente / autenticazione                                             | 🔴 Nessun endpoint, nessun concetto di utente nel backend                                                    | 🟢 Icona profilo in ogni header, tab "Profile"                                                              | → **presente solo su Stitch, bloccato dal backend**                                                                                 |
| Stato servizio (`/health`)                                                  | 🟢 Confermato, ma uso UX ambiguo (§7)                                                                        | — Nessuna schermata Stitch per questo                                                                       | Nessun conflitto (già escluso per decisione di prodotto in `mobile-completion-matrix.md` Flusso 5)                                  |

Questa tabella è la base diretta per la colonna "bloccato dal backend"
nella matrice di gap della Fase 3 (`stitch-implementation-gap.md`).
