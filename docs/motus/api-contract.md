# Motus — Contratto API

## Metodologia di verifica

- **Server verificato**: istanza locale del backend `Motus` (`docker compose up`, `app/api.py`), raggiunta in questa sessione sulla porta **8080** dell'host locale. L'indirizzo usato è puramente di sessione/verifica: **non va hardcodato** in alcun file del repository. Il client applicativo dovrà leggere la base URL da configurazione (`EXPO_PUBLIC_API_URL`, già dichiarata vuota in `.env.example` — vedi `docs/motus/repository-audit.md`).
- **Data verifica**: 2026-08-05.
- **Snapshot dati al momento della verifica** (da `GET /health`): 23.962 impianti, 93.396 prezzi, ultimo import `2026-08-04T06:30:00.377849+00:00`.
- **Metodo**: richieste HTTP dirette (`GET`, `OPTIONS`, `HEAD`, `POST`, `PUT`, `DELETE`, `PATCH` "di sonda" per verificare i metodi supportati) eseguite dal sandbox del task contro il server già in esecuzione. **Nessuna operazione distruttiva**: l'API non espone alcun handler per metodi diversi da `GET`/`OPTIONS` (verificato: vedi §Metodi non supportati), quindi non esiste alcuna azione distruttiva possibile su questo server.
- Ogni affermazione di questo documento marcata ✅ è stata osservata realmente in questa sessione. Nessuna affermazione marcata ✅ proviene solo dalla lettura del codice sorgente.

### Legenda stato di verifica

| Simbolo                    | Significato                                                                                              |
| -------------------------- | -------------------------------------------------------------------------------------------------------- |
| ✅ VERIFICATO              | Testato realmente contro il server vivo in questa sessione, risposta osservata                           |
| 📄 SOLO SPECIFICA          | Descritto in `README.md`/codice sorgente, non riscontrato (o non riscontrabile) con una chiamata diretta |
| 🚫 NON RAGGIUNGIBILE       | Percorso tentato: il server ha risposto confermando l'assenza (404)                                      |
| ❓ AMBIGUO                 | Comportamento osservato diverge da quanto dichiarato nel README, o non è determinato in modo univoco     |
| ⛔ DISTRUTTIVO NON TESTATO | Non applicabile in questo contratto — vedi §Endpoint potenzialmente distruttivi                          |

---

## Metadati e documentazione del server

| Verifica                                                        | Esito       | Dettaglio                                              |
| --------------------------------------------------------------- | ----------- | ------------------------------------------------------ |
| OpenAPI (`/openapi.json`, `/openapi.yaml`, `/api/openapi.json`) | 🚫 Assente  | 404 `{"error": "endpoint non trovato"}` su tutti e tre |
| Swagger (`/swagger`, `/swagger.json`)                           | 🚫 Assente  | 404 su entrambi                                        |
| Documentazione navigabile (`/docs`, `/redoc`, `/api-docs`)      | 🚫 Assente  | 404 su tutti                                           |
| Schema JSON (`/schema`, `/.well-known/openapi.json`)            | 🚫 Assente  | 404 su entrambi                                        |
| Endpoint di health check                                        | ✅ Presente | `GET /health` → 200, vedi dettaglio sotto              |
| Metriche/versione (`/metrics`, `/version`, `/status`)           | 🚫 Assente  | 404 su tutti                                           |
| GraphQL (`/graphql`)                                            | 🚫 Assente  | 404                                                    |
| Root (`/`)                                                      | 🚫 Assente  | 404, nessuna landing page o indice endpoint            |

**Conclusione ✅ verificata**: il server non espone alcuna forma di documentazione auto-descrittiva, schema machine-readable o discovery. L'unica fonte di verità sul contratto è il codice sorgente (`app/api.py`) incrociato con l'osservazione diretta, cioè questo documento.

### Header e implementazione osservati (✅ verificato)

- `Server: BaseHTTP/0.6 Python/3.13.14` su ogni risposta — conferma implementazione con `http.server.BaseHTTPRequestHandler` nudo (nessun framework come Flask/FastAPI), coerente con `app/api.py`.
- `Access-Control-Allow-Origin: *` presente su **ogni** risposta, comprese quelle di errore (400/404/500).
- `Content-Type: application/json; charset=utf-8` su tutte le risposte applicative.
- `OPTIONS` su **qualunque path**, incluso uno inesistente (es. `/totally/random/path`), risponde **204** con `Access-Control-Allow-Methods: GET, OPTIONS` e `Access-Control-Allow-Headers: Content-Type` — il preflight CORS non riflette l'esistenza reale della rotta (❓ ambiguo, vedi `api-discrepancies.md`).

---

## Autenticazione e autorizzazione (✅ verificato)

**Nessuna.** Tutte le chiamate sono state eseguite senza alcun header di autenticazione e hanno restituito dati completi. Nessun endpoint ha risposto 401/403 in nessuna condizione testata. Coerente con l'assenza di logica di auth in `app/api.py`.

---

## Endpoint verificati realmente

### `GET /health` — ✅ VERIFICATO

| Aspetto                   | Valore                            |
| ------------------------- | --------------------------------- |
| Autenticazione            | Nessuna                           |
| Parametri query           | Nessuno                           |
| Body richiesta            | Nessuno                           |
| Codici di stato osservati | `200` (sempre, se il DB risponde) |

Risposta osservata (200):

```json
{
  "status": "ok",
  "stations": 23962,
  "prices": 93396,
  "last_import": "2026-08-04T06:30:00.377849+00:00"
}
```

Schema:

| Campo         | Tipo                             | Note                                                                                                                                                  |
| ------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `status`      | `string`                         | Osservato solo `"ok"`; nessuno stato di errore alternativo è mai stato prodotto (un DB non raggiungibile causa 500, non un body con `status` diverso) |
| `stations`    | `integer`                        | `COUNT(*)` su `stations`                                                                                                                              |
| `prices`      | `integer`                        | `COUNT(*)` su `prices`                                                                                                                                |
| `last_import` | `string` (ISO 8601 UTC) o `null` | `MAX(imported_at)` da `imports`                                                                                                                       |

📄 Errore 500 `{"error": "database non disponibile"}` in caso di `sqlite3.Error`: **solo da codice**, non riproducibile senza spegnere il database (operazione distruttiva evitata, non testata).

---

### `GET /api/stations` — ✅ VERIFICATO

| Aspetto        | Valore  |
| -------------- | ------- |
| Autenticazione | Nessuna |
| Body richiesta | Nessuno |

**Parametri query (tutti opzionali):**

| Nome        | Tipo    | Default                                            | Validazione osservata                                                                                                                                     | Note                                                                                              |
| ----------- | ------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `comune`    | string  | —                                                  | `LIKE %valore%`, case-insensitive (✅ verificato: `comune=Roma` trova righe con `comune: "ROMA"`)                                                         |                                                                                                   |
| `city`      | string  | —                                                  | Alias di `comune` (✅ verificato: risultati identici a `comune=Roma`)                                                                                     | Se entrambi presenti, vince `comune` (da codice: `query.get("comune", query.get("city", [""])) `) |
| `provincia` | string  | —                                                  | `LIKE %valore%`, case-insensitive                                                                                                                         |                                                                                                   |
| `q`         | string  | —                                                  | `LIKE %valore%` su `comune` OR `provincia` OR `nome_impianto` OR `indirizzo` OR `via_geocoded` (✅ verificato: `q=Eni` trova impianti con "Eni" nel nome) | 📄 **Non documentato in `README.md`**, solo nel codice                                            |
| `limit`     | integer | **50** (✅ verificato con richiesta senza `limit`) | Clampato silenziosamente in [1, 1000]. ✅ verificato: `limit=0`→1, `limit=99999`→1000, `limit=-5`→200 con `data` non vuoto (nessun errore)                | `limit=abc` o `limit=1.5` → 400                                                                   |
| `offset`    | integer | **0**                                              | Clampato silenziosamente a minimo 0. ✅ verificato: `offset=-5` → trattato come 0                                                                         | `offset=abc` → 400 (stesso errore di `limit`)                                                     |

**Ordinamento**: sempre `ORDER BY id_impianto ASC` (✅ verificato, nessun parametro di ordinamento personalizzabile).

**Risposta 200** — schema:

```json
{
  "data": [{/* oggetto impianto arricchito, vedi sotto */}],
  "pagination": { "limit": 50, "offset": 0, "total": 23962 }
}
```

Oggetto impianto in `data[]` (campi osservati realmente, esempio reale troncato):

| Campo                  | Tipo                                                                   | Note                                                                                                                                                                                                      |
| ---------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id_impianto`          | integer                                                                |                                                                                                                                                                                                           |
| `gestore`              | string                                                                 | Può contenere spazi/interruzioni anomale per artefatti di parsing CSV (✅ osservato)                                                                                                                      |
| `bandiera`             | string                                                                 | Es. `"Agip Eni"`, `"Api-Ip"`                                                                                                                                                                              |
| `tipo_impianto`        | string                                                                 | Solo `"Stradale"` o `"Autostradale"` osservati (campione ~2000 righe)                                                                                                                                     |
| `nome_impianto`        | string                                                                 | ✅ **Può essere stringa vuota `""`** (osservato su impianto 57660)                                                                                                                                        |
| `indirizzo`            | string                                                                 | ✅ Può contenere formattazioni anomale, es. `"VIA BRUNETTO FERRARI 21/23, 42049 - -"`                                                                                                                     |
| `comune`               | string                                                                 |                                                                                                                                                                                                           |
| `provincia`            | string                                                                 | Sigla 2 lettere                                                                                                                                                                                           |
| `latitudine`           | number \| `null`                                                       | Dato grezzo MIMIT                                                                                                                                                                                         |
| `longitudine`          | number \| `null`                                                       | Dato grezzo MIMIT                                                                                                                                                                                         |
| `updated_at`           | string (ISO 8601 UTC)                                                  |                                                                                                                                                                                                           |
| `via_geocoded`         | string \| `null`                                                       | Popolato solo se geocodificato                                                                                                                                                                            |
| `latitudine_completa`  | number \| `null`                                                       | `COALESCE(latitudine, geocodifica)`                                                                                                                                                                       |
| `longitudine_completa` | number \| `null`                                                       | `COALESCE(longitudine, geocodifica)`                                                                                                                                                                      |
| `geocoding_status`     | `"success"` \| `"source_only"` \| `"no_result"` \| `"error"` \| `null` | ✅ Verificati live solo `null` (nessun tentativo), `"success"`, `"source_only"`. `"no_result"` e `"error"` sono 📄 solo da specifica (valori possibili da codice, non osservati nel campione scansionato) |
| `prices`               | array                                                                  | ✅ **Può essere `[]`** (osservato su impianto 3498, "NURE SUD")                                                                                                                                           |

Oggetto in `prices[]` (identico in tutti gli endpoint che lo espongono):

| Campo                | Tipo                  | Note                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| -------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id_impianto`        | integer               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `carburante`         | string                | ✅ **31 valori distinti osservati** in un campione di 5.000 righe (non solo `"Benzina"`): `Benzina`, `Benzina Energy 98 ottani`, `Benzina Plus 98`, `Benzina Shell V Power`, `Benzina WR 100`, `Benzina speciale`, `Blue Diesel`, `Blue Super`, `Diesel Shell V Power`, `Excellium Diesel`, `F101`, `GNL`, `GPL`, `Gasolio`, `Gasolio Alpino`, `Gasolio Artico`, `Gasolio Artico Igloo`, `Gasolio Energy D`, `Gasolio Gelo`, `Gasolio Oro Diesel`, `Gasolio Premium`, `Gasolio artico`, `Gasolio speciale`, `HVO`, `HVO eco diesel`, `HVO100`, `HVOlution`, `Hi-Q Diesel`, `HiQ Perform+`, `L-GNC`, `Metano`, `Supreme Diesel`. Lista **non esaustiva** (campione parziale, non tutte le 93.396 righe) |
| `prezzo`             | number                | Euro, 3 decimali osservati                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `self_service`       | integer               | ✅ Solo `0` o `1` osservati                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `data_comunicazione` | string \| `null`      | ❓ **Formato `GG/MM/AAAA HH:MM:SS`** (es. `"31/07/2026 10:28:04"`), **non ISO 8601**, diverso dal formato di `updated_at`. Non documentato nel README                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `updated_at`         | string (ISO 8601 UTC) |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

**Codici di stato osservati:**

| Codice | Condizione                                                       | Body                                                      |
| ------ | ---------------------------------------------------------------- | --------------------------------------------------------- |
| 200    | Successo, anche con 0 risultati                                  | `{"data": [], "pagination": {...,"total":0}}`             |
| 400    | `limit`/`offset` non interi                                      | `{"error": "limit e offset devono essere numeri interi"}` |
| 500    | 📄 Errore DB (non testato, richiederebbe operazione distruttiva) | `{"error": "database non disponibile"}`                   |

---

### `GET /api/stations/{id}` — ✅ VERIFICATO

| Aspetto        | Valore                                                                             |
| -------------- | ---------------------------------------------------------------------------------- |
| Autenticazione | Nessuna                                                                            |
| Path param     | `{id}` — solo cifre (`\d+`), verificato tramite regex nel codice e confermato live |
| Body richiesta | Nessuno                                                                            |
| Query params   | Nessuno accettato/usato                                                            |

**Risposta 200** (✅ verificato con `id=57660`):

```json
{
  "station": {/* stesso schema di data[] sopra, senza "prices" annidato */},
  "prices": [/* array oggetti prezzo, ordinati per carburante, self_service */]
}
```

**Codici di stato osservati:**

| Codice | Condizione                                                    | Body                                                                                                          |
| ------ | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 200    | Impianto esistente                                            | `{"station": {...}, "prices": [...]}`                                                                         |
| 404    | `id` numerico ma inesistente (✅ verificato con `999999999`)  | `{"error": "impianto non trovato"}`                                                                           |
| 404    | `id` **non numerico** (✅ verificato con `abc`, `12.5`, `-1`) | `{"error": "endpoint non trovato"}` — ❓ messaggio generico, indistinguibile da un path realmente inesistente |
| 500    | 📄 Errore DB (non testato)                                    | `{"error": "database non disponibile"}`                                                                       |

---

### `GET /api/prices` — ✅ VERIFICATO

| Aspetto        | Valore  |
| -------------- | ------- |
| Autenticazione | Nessuna |
| Body richiesta | Nessuno |

**Parametri query (tutti opzionali):**

| Nome         | Tipo    | Default                | Validazione osservata                               |
| ------------ | ------- | ---------------------- | --------------------------------------------------- |
| `carburante` | string  | —                      | `LIKE %valore%` su `p.carburante`, case-insensitive |
| `provincia`  | string  | —                      | `LIKE %valore%` su `s.provincia`                    |
| `comune`     | string  | —                      | `LIKE %valore%` su `s.comune`                       |
| `limit`      | integer | **50** (✅ verificato) | Stesso clamp [1,1000] di `/api/stations`            |
| `offset`     | integer | **0**                  | Stesso comportamento di `/api/stations`             |

**Ordinamento**: `ORDER BY p.id_impianto ASC` (✅ verificato, nessun ordinamento per prezzo/carburante disponibile).

**Risposta 200** — schema:

```json
{
  "data": [{/* riga prezzo arricchita, vedi sotto */}],
  "pagination": { "limit": 50, "offset": 0, "total": 35163 }
}
```

Riga in `data[]` (✅ verificato, esempio reale): unione di tutti i campi di `prices` (vedi sopra) **più**:

| Campo                  | Tipo             |
| ---------------------- | ---------------- |
| `nome_impianto`        | string           |
| `comune`               | string           |
| `provincia`            | string           |
| `via_geocoded`         | string \| `null` |
| `latitudine_completa`  | number \| `null` |
| `longitudine_completa` | number \| `null` |

❓ Nota: **non** include `id_impianto`-level fields come `indirizzo`, `gestore`, `bandiera`, `tipo_impianto` — a differenza di `/api/stations`, l'oggetto qui è "appiattito" e parziale (solo le colonne selezionate esplicitamente in `app/api.py:230`).

**Codici di stato osservati:**

| Codice | Condizione                      | Body                                                      |
| ------ | ------------------------------- | --------------------------------------------------------- |
| 200    | Successo, anche con 0 risultati | `{"data": [], "pagination": {...,"total":0}}`             |
| 400    | `limit`/`offset` non interi     | `{"error": "limit e offset devono essere numeri interi"}` |
| 500    | 📄 Errore DB (non testato)      | `{"error": "database non disponibile"}`                   |

---

### `GET /api/stations/nearby` — ✅ VERIFICATO

| Aspetto        | Valore  |
| -------------- | ------- |
| Autenticazione | Nessuna |
| Body richiesta | Nessuno |

**Parametri query:**

| Nome     | Tipo    | Obbligatorio | Default                                                                                                         | Validazione osservata                                                                                                                                                             |
| -------- | ------- | ------------ | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lat`    | number  | **Sì**       | —                                                                                                               | Deve essere numerico e ∈ [-90, 90]. ✅ verificato: mancante/non numerico → 400; `200`/`-91` → 400                                                                                 |
| `lon`    | number  | **Sì**       | —                                                                                                               | Deve essere numerico e ∈ [-180, 180]. ✅ verificato: `200`/`-181` → 400                                                                                                           |
| `limit`  | integer | No           | **50** ❓ (✅ verificato live — **il README dichiara 20, discrepanza confermata**, vedi `api-discrepancies.md`) | Stesso clamp [1,1000]                                                                                                                                                             |
| `offset` | integer | No           | —                                                                                                               | ❓ **Accettato senza errore ma completamente ignorato** (✅ verificato: `offset=5` produce identici risultati e identica `pagination`, che non include nemmeno il campo `offset`) |

**Ordinamento**: per `distance_km` crescente (✅ verificato: sequenza monotona non decrescente su 10 risultati reali). Solo impianti con `latitudine_completa` **e** `longitudine_completa` non nulli sono candidati (✅ verificato: impianto 60502, `geocoding_status: "source_only"`, coordinate `null`, non compare mai in questo endpoint).

**Risposta 200** — schema (✅ verificato):

```json
{
  "origin": { "lat": 41.9028, "lon": 12.4964 },
  "data": [{/* oggetto impianto arricchito + distance_km + prices */}],
  "pagination": { "limit": 3, "total_available": 23961 }
}
```

❓ **`pagination` qui usa `total_available`, non `total`** come negli altri due endpoint di lista — nome di campo incoerente (vedi `api-discrepancies.md`). Non contiene `offset`.

Ogni elemento di `data[]` = stesso oggetto impianto di `/api/stations` + campo aggiuntivo:

| Campo         | Tipo   | Note                                                                  |
| ------------- | ------ | --------------------------------------------------------------------- |
| `distance_km` | number | Arrotondato a 3 decimali, formula haversine, raggio terrestre 6371 km |

**Codici di stato osservati:**

| Codice | Condizione                                          | Body                                                                          |
| ------ | --------------------------------------------------- | ----------------------------------------------------------------------------- |
| 200    | Coordinate valide, anche con 0 impianti disponibili | `{"origin":{...}, "data": [], "pagination": {"limit":N,"total_available":0}}` |
| 400    | `lat`/`lon` mancanti o non numerici                 | `{"error": "lat e lon sono obbligatorie e devono essere numeriche"}`          |
| 400    | `lat` fuori [-90,90]                                | `{"error": "lat deve essere compresa tra -90 e 90"}`                          |
| 400    | `lon` fuori [-180,180]                              | `{"error": "lon deve essere compresa tra -180 e 180"}`                        |
| 500    | 📄 Errore DB (non testato)                          | `{"error": "database non disponibile"}`                                       |

---

## Endpoint presenti solo nelle specifiche (non riscontrati come "esiste" dal vivo)

Nessuno. Tutti gli endpoint elencati nel README (`health`, `stations`, `stations/{id}`, `prices`, `stations/nearby`) sono stati riscontrati live e corrispondono al codice. 📄 L'unico comportamento **non verificabile senza operazione distruttiva** è la risposta 500 "database non disponibile" per tutti gli endpoint (richiederebbe di rendere il DB non disponibile, evitato per rispetto del vincolo "non alterare dati del server").

## Endpoint non raggiungibili

Tutti i path relativi a documentazione/discovery elencati in "Metadati e documentazione del server" (`/openapi.json`, `/swagger`, `/docs`, `/redoc`, `/schema`, `/metrics`, `/version`, `/status`, `/graphql`, `/`, ecc.) — tutti confermati 404 🚫, cioè il server ha risposto attivamente confermando la loro assenza (non timeout/mancata connessione).

## Endpoint ambigui

| Endpoint/comportamento                             | Ambiguità                                                                                                                                                         |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/stations/nearby?offset=N`                | Parametro accettato, nessun errore, ma **ignorato**: nessuna documentazione lo segnala                                                                            |
| `GET /api/stations/{id}` con id non numerico       | Risponde con lo stesso messaggio generico usato per path realmente inesistenti (`"endpoint non trovato"`), non distinguibile da un errore di routing              |
| `OPTIONS <qualunque path>`                         | Risponde sempre 204 con `Allow-Methods: GET, OPTIONS`, anche su path che in `GET` risponderebbero 404 — il preflight non riflette l'esistenza reale della risorsa |
| `pagination.total` vs `pagination.total_available` | Stesso concetto, nome di campo diverso tra `/api/stations`+`/api/prices` e `/api/stations/nearby`                                                                 |
| Default `limit` su `/api/stations/nearby`          | Codice e comportamento live concordano su 50; il README dichiara 20 — la specifica scritta è in contraddizione con l'implementazione verificata                   |

## Endpoint potenzialmente distruttivi non testati

**Nessuno esiste.** Verificato attivamente (✅): `POST`, `PUT`, `DELETE`, `PATCH` su path applicativi (`/api/stations`, `/api/stations/1`) restituiscono tutti **501 Unsupported method**, con corpo HTML (non JSON) generato dal framework `http.server` stesso — non da `app/api.py`, che non definisce alcun `do_POST`/`do_PUT`/`do_DELETE`/`do_PATCH`. `HEAD` restituisce anch'esso 501. Non esiste quindi, allo stato attuale, alcuna operazione lato server in grado di modificare dati: l'intera API è strutturalmente di sola lettura.

---

## Riepilogo per un client fortemente tipizzato

Tutti gli endpoint restituiscono JSON con `Content-Type: application/json; charset=utf-8`. Nessuna autenticazione da gestire. Tre "forme" di errore da modellare:

1. **Errore applicativo JSON**: `{"error": string}` con codice 400/404/500 — copre tutti i casi degli endpoint `/health`, `/api/*`.
2. **Errore di metodo HTTP**: risposta 501 con corpo **HTML**, non JSON — da gestire solo se il client tentasse per errore un metodo diverso da `GET`/`OPTIONS` (non dovrebbe mai accadere in un client conforme a questo contratto).
3. **Successo**: sempre 200, mai altri codici 2xx osservati (nessun 201/204 tranne la risposta OPTIONS che non porta dati).

Tipi numerici da modellare con attenzione: `prezzo`/coordinate sono float; `self_service` è un intero 0/1 (non booleano JSON nativo); `id_impianto` è intero; campi coordinate/`via_geocoded`/`geocoding_status`/`data_comunicazione` sono **nullable** e vanno tipizzati come opzionali.
