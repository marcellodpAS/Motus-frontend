# Motus — Modello del dominio

Ricavato esclusivamente dallo schema SQLite creato in `app/importer.py:82-139` (funzione `create_schema`) e dalle query di `app/api.py`. Nessuna entità è stata aggiunta oltre a quelle effettivamente persistite o derivate a runtime.

## Entità

### `stations` (Impianto) — 🟢 confermato

Tabella sorgente, popolata da `anagrafica_impianti_attivi.csv` (MIMIT). Sostituita per intero a ogni import.

| Campo | Tipo | Vincoli | Note |
| --- | --- | --- | --- |
| `id_impianto` | INTEGER | PRIMARY KEY | Identificativo MIMIT dell'impianto |
| `gestore` | TEXT | NOT NULL | Gestore commerciale |
| `bandiera` | TEXT | NOT NULL | Marchio/insegna del punto vendita |
| `tipo_impianto` | TEXT | NOT NULL | Valori osservati nel parsing: `Stradale`, `Autostradale` (`app/importer.py:59`) |
| `nome_impianto` | TEXT | NOT NULL | Denominazione impianto |
| `indirizzo` | TEXT | NOT NULL | Indirizzo dichiarato da MIMIT (può essere vuoto) |
| `comune` | TEXT | NOT NULL | Comune |
| `provincia` | TEXT | NOT NULL | Sigla provincia |
| `latitudine` | REAL | nullable | Coordinata originale MIMIT, spesso assente |
| `longitudine` | REAL | nullable | Coordinata originale MIMIT, spesso assente |
| `updated_at` | TEXT | NOT NULL | Timestamp UTC ISO 8601 dell'import che ha scritto la riga |

### `prices` (Prezzo) — 🟢 confermato

Popolata da `prezzo_alle_8.csv` (MIMIT). Sostituita per intero a ogni import.

| Campo | Tipo | Vincoli | Note |
| --- | --- | --- | --- |
| `id_impianto` | INTEGER | PK composita, FK logica verso `stations.id_impianto` | Nessun vincolo `FOREIGN KEY` dichiarato nello schema (nessun `REFERENCES`), la relazione è solo applicativa |
| `carburante` | TEXT | PK composita, NOT NULL | Es. `Benzina` (unico valore osservato nei documenti) |
| `prezzo` | REAL | NOT NULL | Prezzo in euro |
| `self_service` | INTEGER | PK composita, NOT NULL | 0/1, modalità self-service vs servito |
| `data_comunicazione` | TEXT | nullable | Data di comunicazione del prezzo (dal CSV, può essere vuota → `None`) |
| `updated_at` | TEXT | NOT NULL | Timestamp UTC ISO 8601 dell'import |

Chiave primaria composita `(id_impianto, carburante, self_service)`: un impianto può avere **al massimo un prezzo per ciascuna combinazione carburante × modalità servizio**.

### `imports` (Log di importazione) — 🟢 confermato

Log operativo, non collegato a `stations`/`prices` da chiave esterna.

| Campo | Tipo | Vincoli | Note |
| --- | --- | --- | --- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | |
| `dataset` | TEXT | NOT NULL | `prices` oppure `stations` (due righe per ogni import) |
| `extraction` | TEXT | NOT NULL | Prima riga del CSV sorgente (marca temporale dell'estrazione MIMIT) |
| `imported_at` | TEXT | NOT NULL | Timestamp UTC ISO 8601 dell'import |
| `rows_count` | INTEGER | NOT NULL | Numero di righe importate |

### `station_geocoding` (Geocodifica impianto) — 🟢 confermato

Cache permanente dell'esito di geocodifica per impianto, popolata solo per impianti con indirizzo vuoto o coordinate mancanti (`app/importer.py:177-190`).

| Campo | Tipo | Vincoli | Note |
| --- | --- | --- | --- |
| `id_impianto` | INTEGER | PRIMARY KEY | FK logica verso `stations.id_impianto` |
| `query` | TEXT | NOT NULL | Stringa di ricerca inviata a Nominatim |
| `status` | TEXT | NOT NULL | `success`, `source_only`, `no_result`, `error` (vedi sotto) |
| `via` | TEXT | nullable | Via estratta dal risultato Nominatim o dal testo MIMIT |
| `latitudine` | REAL | nullable | Coordinata da geocodifica |
| `longitudine` | REAL | nullable | Coordinata da geocodifica |
| `display_name` | TEXT | nullable | Nome completo restituito da Nominatim |
| `provider` | TEXT | NOT NULL | `nominatim` oppure `source` (quando la via è estratta dal testo MIMIT senza chiamata esterna) |
| `attempted_at` | TEXT | NOT NULL | Timestamp UTC ISO 8601 del tentativo |
| `error_message` | TEXT | nullable | Messaggio d'errore troncato a 500 caratteri, se `status = error` |

**Valori di `status` (🟢 confermati in `app/importer.py:233-251`):**
- `success` — Nominatim ha restituito un risultato con coordinate
- `source_only` — Nominatim non ha trovato nulla, ma dal testo MIMIT è stata estratta una via riconoscibile (nessuna coordinata)
- `no_result` — Nominatim non ha trovato nulla e nessuna via è stata estratta dal testo
- `error` — la chiamata a Nominatim è fallita (eccezione di rete/parsing)

### `stations_enriched` (vista, non tabella) — 🟢 confermato

`VIEW` SQL (`app/importer.py:130-138`), non un'entità persistita: `stations` LEFT JOIN `station_geocoding` su `id_impianto`.

| Campo esposto | Origine |
| --- | --- |
| tutti i campi di `stations` | `s.*` |
| `via_geocoded` | `station_geocoding.via` |
| `latitudine_completa` | `COALESCE(stations.latitudine, station_geocoding.latitudine)` |
| `longitudine_completa` | `COALESCE(stations.longitudine, station_geocoding.longitudine)` |
| `geocoding_status` | `station_geocoding.status` |

Questa vista è la fonte usata da tutti gli endpoint pubblici che restituiscono impianti (`stations`, `station`, `nearby`, e il join in `prices`) — mai la tabella `stations` grezza.

## Relazioni tra entità

```mermaid
erDiagram
    STATIONS ||--o{ PRICES : "ha prezzi"
    STATIONS ||--o| STATION_GEOCODING : "geocodificato (opzionale)"
    STATIONS ||--|| STATIONS_ENRICHED : "vista derivata (1:1)"
    STATION_GEOCODING ||--|| STATIONS_ENRICHED : "arricchisce (0..1:1)"

    STATIONS {
        int id_impianto PK
        text gestore
        text bandiera
        text tipo_impianto
        text nome_impianto
        text indirizzo
        text comune
        text provincia
        real latitudine
        real longitudine
        text updated_at
    }
    PRICES {
        int id_impianto PK_FK
        text carburante PK
        int self_service PK
        real prezzo
        text data_comunicazione
        text updated_at
    }
    STATION_GEOCODING {
        int id_impianto PK_FK
        text query
        text status
        text via
        real latitudine
        real longitudine
        text display_name
        text provider
        text attempted_at
        text error_message
    }
    IMPORTS {
        int id PK
        text dataset
        text extraction
        text imported_at
        int rows_count
    }
```

🟡 `IMPORTS` non è collegata da nessuna chiave alle altre entità: è un log a livello di intero dataset (`prices` o `stations`), non per singolo impianto/prezzo. Rappresentata separatamente, senza relazione, nel diagramma sopra per chiarezza (omessa perché priva di riferimenti — vedi tabella dedicata più sopra).

## Cardinalità osservate

- 1 `stations` → N `prices` (0 o più prezzi per impianto, al massimo uno per combinazione carburante × self-service)
- 1 `stations` → 0..1 `station_geocoding` (solo se l'impianto aveva indirizzo/coordinate mancanti al momento dell'import)
- 1 `stations` → esattamente 1 riga in `stations_enriched` (vista 1:1, con campi geocodifica eventualmente `NULL`)

## Note di qualità del dato (🟡 osservazioni, non requisiti)

- Nessun vincolo `FOREIGN KEY` è dichiarato nello schema: l'integrità referenziale tra `prices`/`station_geocoding` e `stations` è solo applicativa (garantita dal fatto che l'import scrive entrambe le tabelle dallo stesso dataset).
- Il campo `gestore` viene ricostruito unendo con `|` i campi CSV compresi tra due ancore di parsing (`app/importer.py:68`, `join(fields[1:type_index-1])`): un gestore il cui nome contiene involontariamente il testo `Stradale`/`Autostradale` romperebbe il parsing. Non è un requisito, ma un rischio di qualità dato osservato nel codice.
- Il campo `carburante` è testo libero non enumerato in alcun documento: l'unico valore mai citato è `Benzina`.
