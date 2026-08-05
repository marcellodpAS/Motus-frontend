# Motus — Discrepanze tra specifica e comportamento reale

Ogni voce confronta un'affermazione scritta (README/codice) con un'osservazione diretta ottenuta in questa sessione contro il server vivo (porta 8080 locale, 2026-08-05). Solo discrepanze con evidenza reale su entrambi i lati sono incluse.

## Discrepanze confermate (specifica scritta ≠ comportamento reale)

### D1 — Default di `limit` su `GET /api/stations/nearby`

- **Specifica** (`README.md:49`): _"ordinate per distanza e con limite predefinito di 20"_.
- **Osservato** (`GET /api/stations/nearby?lat=41.9028&lon=12.4964` senza `limit`): `pagination.limit: 50`, `data.length: 50`.
- **Causa**: il codice usa la stessa funzione `pagination()` di tutti gli endpoint, che ha default 50; non esiste un ramo di codice che imposti 20 per `nearby`.
- **Impatto per il client**: un client che ometta `limit` fidandosi del README riceve 50 risultati invece di 20. Se la UI (S04) assume 20, deve passare `limit=20` esplicitamente — **non può contare sul default del server**.
- **Severità**: Alta — impatta direttamente il numero di risultati mostrati "vicino a me" di default.

### D2 — Nome del campo "totale" incoerente tra endpoint di lista

- **Specifica implicita**: `/api/stations` e `/api/prices` espongono lo stesso "shape" di `pagination` (`limit`, `offset`, `total`).
- **Osservato**: `/api/stations/nearby` restituisce `pagination: {"limit": N, "total_available": N}` — **niente `offset`, campo `total` rinominato `total_available`**.
- **Impatto per il client**: un tipo TypeScript unico `Pagination { limit, offset, total }` non può coprire tutti e tre gli endpoint. Serve un tipo dedicato per `nearby`, oppure il backend andrebbe allineato prima di scrivere il client.
- **Severità**: Media — errore di compilazione/runtime se il client assume uno shape unico.

### D3 — `offset` accettato ma silenziosamente ignorato su `/api/stations/nearby`

- **Specifica**: nessuna menzione, né a favore né contro, dell'uso di `offset` su questo endpoint.
- **Osservato**: `GET .../nearby?...&limit=3` e `GET .../nearby?...&limit=3&offset=5` restituiscono **esattamente gli stessi 3 impianti**, e la risposta non riporta nemmeno il valore di `offset` in `pagination`.
- **Impatto per il client**: un pattern di "carica altra pagina" basato su `offset` (usato correttamente su `/api/stations` e `/api/prices`) **non funziona** su `nearby`. Il client deve trattare `nearby` come "un solo blocco di risultati dimensionato da `limit`", non come una lista paginabile.
- **Severità**: Alta — un'implementazione client generica di paginazione romperebbe silenziosamente questo endpoint (nessun errore, solo risultati duplicati).

### D4 — Parametro di ricerca libera `q` esiste ma non è documentato

- **Specifica** (`README.md`): non menziona alcun parametro `q`.
- **Osservato**: `GET /api/stations?q=Eni&limit=2` funziona e restituisce risultati coerenti (ricerca su 5 colonne diverse via `LIKE`).
- **Impatto per il client**: funzionalità utilizzabile ma "non ufficiale" — nessuna garanzia di stabilità documentata. Da usare con consapevolezza che potrebbe cambiare senza preavviso nel README.
- **Severità**: Bassa — funziona come atteso, manca solo la documentazione.

### D5 — Formato data di `data_comunicazione` diverso da `updated_at`

- **Specifica**: nessuna menzione esplicita del formato di `data_comunicazione`.
- **Osservato**: `updated_at` è ISO 8601 UTC (`"2026-08-04T06:30:00.377849+00:00"`), mentre `data_comunicazione` è nel formato italiano `GG/MM/AAAA HH:MM:SS` (es. `"31/07/2026 10:28:04"`), senza fuso orario esplicito.
- **Impatto per il client**: un parser di date generico (es. `Date.parse` in JS) **non interpreta correttamente** il formato `GG/MM/AAAA`; serve un parser dedicato per questo campo specifico, distinto da quello usato per `updated_at`.
- **Severità**: Media — bug silenzioso di parsing date se non gestito esplicitamente nel client tipizzato.

## Comportamenti verificati coerenti con la specifica (nessuna discrepanza)

Per completezza — confermano che il codice sorgente letto in Task 2/3 è affidabile su questi punti:

- ✅ `limit` sempre clampato in [1, 1000] — confermato (`limit=0`→1, `limit=99999`→1000).
- ✅ `city` funziona come alias esatto di `comune` — confermato, risultati identici.
- ✅ Coordinate `lat`/`lon` validate nei range dichiarati, con messaggi distinti per ciascun parametro — confermato.
- ✅ Ordinamento `nearby` per distanza crescente — confermato su 10 risultati reali (sequenza monotona).
- ✅ Impianti `source_only` (via nota, coordinate nulle) esclusi da `nearby` ma presenti in `stations`/`prices` — confermato con caso reale (impianto 60502).
- ✅ Nessuna autenticazione richiesta su alcun endpoint — confermato.
- ✅ Nessuna documentazione OpenAPI/Swagger/schema esposta — confermato su 13 path candidati diversi.
- ✅ Nessun endpoint di scrittura esiste (`POST`/`PUT`/`DELETE`/`PATCH` → 501 dal framework, non da `app/api.py`) — confermato.

## Osservazioni aggiuntive non previste da alcun documento (né README né codice commentato)

Non sono "discrepanze" in senso stretto (nessuna specifica le contraddice, perché nessuna specifica le tratta), ma sono comportamenti reali del dataset di produzione rilevanti per un client tipizzato:

- **`nome_impianto` può essere stringa vuota `""`** (impianto 57660) — un client che assuma sempre un nome visualizzabile deve prevedere un fallback (es. su `bandiera` o `indirizzo`).
- **`prices` può essere un array vuoto `[]`** per un impianto esistente (impianto 3498, "NURE SUD") — S03 deve gestire "impianto senza prezzi comunicati" come stato distinto da "impianto non trovato".
- **`indirizzo` può contenere artefatti di formattazione** dal CSV sorgente, es. `"VIA BRUNETTO FERRARI 21/23, 42049 - -"` (doppio trattino finale) — da non usare come stringa "pulita" senza normalizzazione lato client se mostrata direttamente.
- **`carburante` ha almeno 31 valori distinti** nel dataset reale (non solo `"Benzina"` come suggerirebbero gli unici esempi in README/Bruno) — un client con un `enum` chiuso per `carburante` andrebbe verificato contro il dataset reale prima di essere finalizzato, oppure trattato come stringa libera con una lista di valori noti "aperta".
- **`OPTIONS` risponde 204 su qualunque path**, anche uno che in `GET` darebbe 404 — non utilizzabile come probe di esistenza di una rotta.
- **Il 404 per `/api/stations/{id}` con `id` non numerico è identico al 404 di un path realmente inesistente** (`"endpoint non trovato"`, non `"impianto non trovato"`) — un client non può distinguere "id malformato" da "rotta sbagliata" leggendo solo il messaggio.

## Discrepanze non verificabili in questa sessione (richiederebbero operazioni distruttive, quindi non testate)

- Comportamento reale della risposta 500 `"database non disponibile"` — richiederebbe di rendere il database non disponibile durante il test, esplicitamente evitato per rispetto del vincolo "non alterare dati del server".
- Comportamento durante un import in corso (`DELETE`+`INSERT` non atomico rispetto alle letture concorrenti: il codice esegue `DELETE FROM prices` seguito da `INSERT` all'interno della stessa transazione `with connection:`, quindi in teoria una lettura concorrente vede o lo stato pre-import o quello post-import, mai uno stato intermedio — ma questo è dedotto dal codice, **non verificato empiricamente** perché avrebbe richiesto di innescare un import reale durante i test, fuori perimetro).
- Valori di `geocoding_status` pari a `"no_result"` o `"error"` — presenti come possibilità nel codice (`app/importer.py:233-251`) ma **non osservati** nel dataset live durante la scansione campione eseguita in questo task (solo `null`, `"success"`, `"source_only"` riscontrati).
