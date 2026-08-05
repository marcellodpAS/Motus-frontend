# Motus — Inventario diretto da Stitch (Task 19, Fase 1)

## Nota metodologica sulla fonte

Il server MCP Stitch **non è configurato in questo ambiente** (verificato di
nuovo in questa sessione: `~/.claude.json` → `mcpServers: {}` a ogni livello,
nessun `.mcp.json` di progetto, nessun tool `mcp__*stitch*` in `ToolSearch`
— stessa conclusione già raggiunta e documentata in `mcp-audit.md` §5 nel
task precedente). Non è quindi stato possibile "individuare il progetto
Motus tramite MCP" come richiesto testualmente dal task.

L'utente ha fornito in alternativa l'**export reale del progetto Stitch**
(`stitch.withgoogle.com`, progetto "Motus", ID `15435010535585792787`),
come archivio `assets/stitch_motus.zip`, contenente per ogni schermata lo
screenshot (`screen.png`) e il codice HTML/Tailwind generato da Stitch
(`code.html`), più un file di design system (`utility_horizon/DESIGN.md`).
Questo è materiale Stitch autentico (non ricostruito, non reinterpretato) —
soddisfa la fonte di verità #1 richiesta dal task, per il sottoinsieme di
schermate incluse nell'export. Gli ID Stitch riportati sotto per ogni
schermata sono quelli comunicati direttamente dall'utente insieme al link
del progetto; non sono stati verificati via chiamata MCP (impossibile,
server assente) ma provengono dalla stessa fonte (l'utente, con accesso
diretto al progetto Stitch) e sono coerenti 1:1 con gli slug delle cartelle
nello zip.

**Limite esplicito**: l'export contiene **5 schermate + 1 asset di design
system**, non l'intero progetto Stitch. Il task chiede di "individuare
tutte le pagine/schermate/varianti/flussi/stati" — solo questo sottoinsieme
è stato osservabile. Non è stato possibile confermare se esistono altre
schermate Stitch per Motus oltre a queste 6 voci (es. Favorites, Profile,
onboarding, autenticazione — tutte referenziate come tab/void link nelle
schermate osservate, ma senza una schermata Stitch dedicata nell'export).
Questo limite viene riportato esplicitamente nella matrice di gap (Fase 3),
non nascosto.

Ogni schermata Stitch è un **mockup statico single-state**: HTML con dati di
esempio fissi, nessun binding a stato applicativo reale. Loading/empty/error
non sono quindi "presenti o assenti nello Stitch" in senso stretto — sono
dedotti (quando possibile) dal comportamento implicito del componente, e
segnati esplicitamente come "non presente nel mockup" quando non deducibile.

---

## 0. Design System (asset)

- **ID Stitch**: `asset-stub-assets_82e76a4246ec4b638fc6948d7683e4ff`
- **Nome**: Design System (Motus Mobility / "utility_horizon")
- **Descrizione**: file YAML+Markdown con token di colore, tipografia,
  raggi, spaziature, più una descrizione testuale di brand, elevazione,
  forme e componenti condivisi. Fonte per tutti i token usati nei 4
  `code.html` (che duplicano gli stessi token, con lievi differenze di
  arrotondamento — vedi discrepanze sotto).
- **Flusso di appartenenza**: trasversale (non una schermata).

### Colori (valori esatti dal file DESIGN.md)

| Token                                    | Valore                | Uso dichiarato                                                      |
| ---------------------------------------- | --------------------- | ------------------------------------------------------------------- |
| `surface`                                | `#f9f9ff`             | sfondo pagina                                                       |
| `surface-dim`                            | `#d5daea`             | —                                                                   |
| `surface-bright`                         | `#f9f9ff`             | —                                                                   |
| `surface-container-lowest`               | `#ffffff`             | card/loghi                                                          |
| `surface-container-low`                  | `#f1f3ff`             | raggruppamento liste, hover                                         |
| `surface-container`                      | `#eaeef4`             | icone in cerchio                                                    |
| `surface-container-high`                 | `#e3e8f8`             | divisori                                                            |
| `surface-container-highest`              | `#dee2f2`             | —                                                                   |
| `on-surface`                             | `#161c27`             | testo primario                                                      |
| `on-surface-variant`                     | `#424753`             | testo secondario                                                    |
| `inverse-surface` / `inverse-on-surface` | `#2b303c` / `#edf0ff` | —                                                                   |
| `outline` / `outline-variant`            | `#727784` / `#c2c6d5` | bordi, assi grafico                                                 |
| `surface-tint`                           | `#005bbf`             | —                                                                   |
| `primary`                                | `#004492`             | azioni primarie                                                     |
| `on-primary`                             | `#ffffff`             | testo su primario                                                   |
| `primary-container`                      | `#005bbf`             | bottoni "hero", pin evidenziato                                     |
| `on-primary-container`                   | `#c8d8ff`             | —                                                                   |
| `secondary` / `secondary-container`      | `#0059bb` / `#1371e6` | —                                                                   |
| `tertiary` / `tertiary-container`        | `#7c2e00` / `#a23f01` | badge "Served"                                                      |
| `error` / `error-container`              | `#ba1a1a` / `#ffdad6` | avatar lista predizioni (decorativo, non stato d'errore)            |
| `background`                             | `#f9f9ff`             | sfondo app                                                          |
| `map-background`                         | `#f8f9fa`             | sfondo mappa                                                        |
| `border-subtle`                          | `#dadce0`             | bordi card                                                          |
| `semantic-success`                       | `#188038`             | prezzo in calo, "Open 24/7"                                         |
| `semantic-error`                         | `#d93025`             | dichiarato ma **non osservato in uso** in nessuno dei 4 `code.html` |

⚠️ **Discrepanza numerica rilevata**: i valori hex dentro i 4 file
`code.html` (tutti e 4 identici tra loro) **non coincidono esattamente**
con `DESIGN.md` per diversi token (es. `primary`: `#004492` nel DESIGN.md
vs `#005bbf` nei `code.html`; `background`: `#f9f9ff` vs `#f6faff`;
`surface-container-low`: `#f1f3ff` vs `#f0f4fa`). I 4 `code.html` sono
internamente coerenti tra loro (stessa palette esatta ripetuta 4 volte) e
sono la fonte più recente/vicina all'implementazione — vanno quindi presi
come riferimento primario per il porting dei token, con `DESIGN.md` come
riferimento secondario/narrativo (brand, elevazione, forme). Vedi tabella
"Token da `code.html` (fonte primaria)" più sotto.

### Tipografia (Inter, da DESIGN.md — identica nei 4 code.html)

| Token                | Size / Line height | Weight | Letter spacing |
| -------------------- | ------------------ | ------ | -------------- |
| `display-lg`         | 32px / 40px        | 600    | -0.02em        |
| `headline-lg`        | 24px / 32px        | 500    | —              |
| `headline-lg-mobile` | 20px / 28px        | 500    | —              |
| `headline-md`        | 18px / 24px        | 500    | —              |
| `body-lg`            | 16px / 24px        | 400    | —              |
| `body-md`            | 14px / 20px        | 400    | —              |
| `label-lg`           | 14px / 20px        | 500    | 0.1px          |
| `label-md`           | 12px / 16px        | 500    | 0.5px          |
| `label-sm`           | 11px / 16px        | 400    | —              |

### Raggi, spaziatura, elevazione, forme (da DESIGN.md, narrativo + valori)

- Raggi: `sm` 0.25rem, `DEFAULT` 0.5rem, `md` 0.75rem, `lg` 1rem, `xl` 1.5rem, `full` 9999px (i `code.html` ridefiniscono `borderRadius` in modo diverso: `DEFAULT` 0.25rem, `lg` 0.5rem, `xl` 0.75rem, `full` 9999px, più `2xl`/`3xl` solo nel file Dettaglio Stazione — 1rem/1.5rem).
- Spaziatura: unità base 4px, gutter liste 12px, margine mobile 16px, margine desktop 24px, padding componente 16px orizzontale / 10px verticale.
- Elevazione: Livello 2 (card/pin) = `0px 1px 2px rgba(60,64,67,0.3), 0px 1px 3px 1px rgba(60,64,67,0.15)`; Livello 3 (sheet/modali) = `0px -2px 12px rgba(60,64,67,0.1)` + bordo `border-subtle`. Hover pin/liste = traslazione Y -4px (desktop).
- Forme: componenti standard 8px; superfici a foglio (bottom sheet, pannelli) 12–16px sull'angolo superiore; pillole (pin mappa, barra di ricerca, bottom nav "active") full-round.
- Font applicativo: **Inter** esclusivamente (400/500/600), più **Material Symbols Outlined** per tutte le icone (`font-variation-settings: 'FILL' 1` per icone "riempite" nello stato attivo/enfatizzato).

---

## 1. Motus Brand Logo

- **ID Stitch**: `a18184fe02884416830fda392f454578`
- **Nome**: Motus Brand Logo
- **Descrizione**: logo orizzontale — icona (pin di localizzazione stilizzato con dentro una pistola di benzina, in blu `#005bbf`/`#004492`) + wordmark "MOTUS" in maiuscolo, stesso blu, font bold sans-serif geometrico (non Inter — è un lockup logo, non testo UI).
- **Flusso di appartenenza**: trasversale — usato come immagine (`<img>`) nell'header di **tutte** le altre 4 schermate (stesso URL asset Google `lh3.googleusercontent.com/aida/AP1WRLu4Dy7...`).
- **Azioni disponibili**: nessuna (asset statico), ma è cliccabile/linkato implicitamente in 2 schermate (vedi sotto).
- **Schermate collegate**: appare in Segnala Prezzo, Dettaglio Stazione, Previsioni Pro, Mappa Motus.
- **Dati visualizzati**: n/a (asset grafico).
- **Varianti**: nessuna variante separata osservata nell'export (un solo file `screen.png` in `motus_brand_logo/`); dimensione visiva varia per contesto (altezza fissa `h-8`/`h-full`, ~32px, in tutti gli header).
- **Loading/empty/error state**: n/a — asset statico.
- **Componenti**: nessuno, è l'asset stesso.
- **Asset**: `stitch_motus/motus_brand_logo/screen.png` (143 775 byte, sfondo bianco pieno, non trasparente — da ritagliare/rigenerare con sfondo trasparente per uso reale in header).
- **Colori**: blu primario (`#005bbf`/`#004492`, coerente col token `primary`), nessun secondo colore.
- **Tipografia**: wordmark non-Inter (font display custom del logo, va trattato come immagine, non ricreato in testo).
- **Spaziature**: n/a.
- **Responsive**: usato a dimensione fissa (`h-8`, `w-8`) in tutti gli header; nella Mappa Motus l'header lo centra (`flex-1 flex justify-center`), nelle altre 3 schermate è allineato a sinistra accanto al pulsante indietro.

---

## 2. Segnala Prezzo (Standard Header)

- **ID Stitch**: `e0cd4605476d4da8b000e7366d0aff69`
- **Nome**: Segnala Prezzo (titolo pagina HTML: "Report Prices - Motus")
- **Descrizione**: form di segnalazione prezzo carburante per una stazione specifica (arrivo da contesto stazione già noto — non chiede di scegliere la stazione).
- **Flusso di appartenenza**: nuovo flusso "Segnalazione prezzo", non presente in `user-flows.md` (Flussi 1–6 esistenti). Raggiungibile da Dettaglio Stazione tramite il bottone "Report Price" (osservato nel `code.html` di Dettaglio Stazione, azione 2).
- **Azioni disponibili**:
  - Back (freccia, header)
  - Search (icona lente, header) — azione dichiarata ma target non specificato nel mockup
  - Profilo utente (icona persona, header)
  - Input numerico prezzo **Petrol 95** (placeholder `1.85`, step `0.01`, prefisso `$`)
  - Input numerico prezzo **Diesel** (placeholder `1.92`)
  - Input numerico prezzo **LPG** (placeholder `0.85`)
  - Toggle "Price Mismatch" (`role="switch"`, on/off, con testo di supporto "Report significant discrepancies")
  - Submit "Submit Report" (bottone primario pieno, icona `send`)
- **Schermate collegate**: proviene da Dettaglio Stazione (contesto stazione mostrato in card: "Shell Station" / "123 Main Street"); nessuna schermata di conferma/successo inclusa nell'export (dopo submit non è definito nel mockup — `onsubmit="event.preventDefault()"`, nessuna navigazione codificata).
- **Dati visualizzati**: nome stazione, indirizzo breve (card di contesto in alto); 3 campi prezzo carburante; 1 flag booleano mismatch.
- **Varianti**: nessuna (1 sola versione, "Standard Header").
- **Loading state**: non presente nel mockup (nessuno spinner, nessun testo "invio in corso").
- **Empty state**: non applicabile (è un form vuoto di default, i placeholder non sono valori precompilati).
- **Error state**: non presente — nessuna validazione visibile (nessun messaggio di errore, nessun bordo rosso, `type="number"` senza `min`/`max`/`required` espliciti nell'HTML).
- **Componenti utilizzati**: Header standard (back + logo + titolo + search + profilo), Card contesto stazione (icona + testo), Form Field numerico con prefisso valuta, Switch/Toggle, Bottone primario pieno con icona.
- **Asset**: solo il logo Motus (stesso URL condiviso).
- **Colori**: `bg-background` pagina, `bg-surface` card/form, `border-border-subtle`, focus `ring-primary-container`, bottone `bg-primary`/`hover:bg-primary-container`.
- **Tipografia**: `font-headline-md` (nome stazione), `font-body-md` (indirizzo), `font-label-lg` (etichette campo), `font-headline-lg` (valore prezzo dentro l'input).
- **Spaziature**: `px-margin-mobile`/`px-margin-desktop`, `gap-6` tra sezioni, card e form con `rounded-2xl`, input alti `h-16`.
- **Comportamento responsive**: `pt-20 pb-24` mobile vs `md:pt-24 md:pb-0` desktop; contenuto centrato `max-w-screen-md mx-auto`; nessuna bottom nav in questa schermata (commento esplicito nell'HTML: _"Navigation Shell suppressed because this is a transactional screen"_).

---

## 3. Dettaglio Stazione (Standard Header)

- **ID Stitch**: `d3b33d58ae3045d081ea8beba603ba0b`
- **Nome**: Dettaglio Stazione (titolo pagina HTML: "Station Detail - Eni Via Roma")
- **Descrizione**: vista dettaglio di una stazione con mappa statica in testa, bottom-sheet con info, azioni, prezzi correnti, servizi/amenity, orari.
- **Flusso di appartenenza**: Flusso "Dettaglio impianto" (equivalente concettuale a S03 in `screen-inventory.md`/`mobile-completion-matrix.md`), ma **visivamente molto più ricco** di quanto implementato oggi (vedi Fase 3).
- **Azioni disponibili**:
  - Back (freccia, header)
  - Search (header)
  - Profilo (header)
  - **Navigate** (bottone pieno `primary-container`, icona `directions`) — apre navigazione esterna, non specificato il target
  - **Report Price** (bottone outline, icona `edit_note`) — porta a Segnala Prezzo
  - **Save** (bottone outline, icona `bookmark_add`) — salva/preferiti (nessuna schermata "Favorites" nell'export, ma referenziata anche nella bottom nav di Previsioni Pro/Mappa)
- **Schermate collegate**: Report Price → Segnala Prezzo; Navigate → esterno (mappe di sistema, non Mappa Motus interna, presumibilmente); Save → funzionalità "Favorites" non presente come schermata Stitch nell'export.
- **Dati visualizzati**:
  - Immagine di sfondo tipo mappa/foto stazione (200px altezza, `background-image`)
  - Nome stazione ("Eni - Via Roma"), indirizzo completo, badge "Open 24/7" (verde), distanza ("2.4 km")
  - Logo/brand della stazione (immagine 56×56, placeholder)
  - **Prezzi correnti**: 3 righe (Senza Piombo 95 € 1.849 "Self Service" aggiornato 2h fa; Diesel € 1.729 "Self Service" 4h fa; Diesel Special € 1.959 "Served" ieri, riga con opacità ridotta) — barra colore laterale verde (self-service) vs arancio/tertiary (served)
  - **Amenities**: griglia 4 colonne, 5 icone (Cafe, Car Wash, Restroom, Store, EV Charge)
  - **Hours**: 3 righe (Lun-Ven 06:00-22:00, Sab 07:00-20:00, Dom Closed) + nota informativa in calce
- **Varianti**: nessuna (1 sola versione, "Standard Header"); container HTML impostato come "device mockup" (`max-w-[414px]`, bordi arrotondati, ombra) — è un artefatto della presentazione Stitch, non layout applicativo reale.
- **Loading state**: non presente.
- **Empty state**: non presente — tutti i dati sono popolati nel mockup; nessuna variante "nessun prezzo disponibile" (che invece l'app attuale gestisce, vedi `useStationDetail`).
- **Error state**: non presente (nessun 404/500 raffigurato).
- **Componenti utilizzati**: Header standard, Hero image/mappa, Bottom sheet con drag handle, Card azioni orizzontali scrollabili, Lista prezzi con indicatore colore + badge tipo servizio, Griglia icone servizi, Lista orari.
- **Asset**: logo Motus (header), immagine hero (mappa/foto), logo/brand stazione (placeholder).
- **Colori**: `semantic-success` (badge Open 24/7, barra self-service), `tertiary-container`/`tertiary-fixed` (barra e badge "Served"), `primary-container`/`on-primary-container` (bottone Navigate), superfici `surface-container-high` per i divisori.
- **Tipografia**: `headline-lg-mobile` (nome stazione), `body-md` (indirizzo), `headline-md` (titoli sezione), `body-lg` (nome carburante), `headline-md` semibold (prezzo), `label-sm` (timestamp, note).
- **Spaziature**: bottom sheet `rounded-t-3xl`, sezioni `px-6`, divisori `h-px my-4`, azioni `gap-3`.
- **Comportamento responsive**: dichiarato solo in forma di "mobile device container" centrato anche su desktop (`md:pt-8`, `md:rounded-[2rem]`) — non un vero layout desktop alternativo (a differenza di Mappa Motus, che ha un layout desktop esplicito con rail laterale).

---

## 4. Previsioni Pro (Standard Header)

- **ID Stitch**: `0acf7ae776d74a5ba6763b0dd3a20fd2`
- **Nome**: Previsioni Pro (titolo pagina HTML: "Motus - Pro Predictions")
- **Descrizione**: schermata **premium/Pro**, analisi predittiva prezzo carburante — raccomandazione (aspettare/fare rifornimento ora), grafico trend 7 giorni, lista stazioni con previsione.
- **Flusso di appartenenza**: **nuovo flusso, assente in `user-flows.md`** — "Previsioni prezzo / Pro". Non ha equivalente in nessuna delle 4 schermate implementate oggi (S01–S04).
- **Azioni disponibili**:
  - Search bar (header, placeholder "Search for gas stations...")
  - Avatar profilo (header)
  - Bottone "View all on Map" → naviga a Mappa Motus
  - Bottom nav: Map / Favorites / **Pro (attivo)** / Profile
  - Righe lista stazioni predette (implicitamente cliccabili, `active:bg-*` non presente qui ma `hover:bg-surface-container-low transition-colors` sì)
- **Schermate collegate**: Mappa Motus (via "View all on Map" e via tab "Map"); Favorites e Profile referenziati solo come tab (nessuna schermata Stitch per questi nell'export).
- **Dati visualizzati**:
  - Card raccomandazione: etichetta "RECOMMENDATION", titolo "Wait to Fuel Up", testo "Prices are expected to drop by Friday.", valore `-$0.12 / gallon`, box risparmio stimato "~$1.80" su pieno
  - Grafico trend 7 giorni: SVG a curva, asse Y `$3.40–$3.60`, asse X `Mon / Wed / Fri (Est)`, etichetta serie "Regular Unleaded"
  - Lista "Best Predicted Stations": 3 righe (Speedway $3.42 ↓Exp.Fri; QuikTrip $3.45 ↓Exp.Sat; Costco Gas $3.29 "Stable" — nessuna freccia), ciascuna con avatar iniziale colorato, nome, distanza, via
- **Varianti**: nessuna.
- **Loading state**: non presente (nessuno skeleton per il calcolo predittivo).
- **Empty state**: non presente (es. "previsione non disponibile per questa zona" non raffigurato).
- **Error state**: non presente.
- **Componenti utilizzati**: Header con search bar inline (diverso dagli altri header: qui la search è un campo finto sempre visibile, non un'icona), Card raccomandazione con barra colore superiore e icona trend, Card grafico lineare custom (SVG inline, non libreria chart), Lista risultati con avatar-iniziale, Bottom Navigation Bar (4 tab).
- **Asset**: logo Motus (piccolo, 32×32, nell'header a sinistra della search bar — non centrato come nelle altre schermate), avatar utente (foto).
- **Colori**: `primary-container` (icona trend, barra top card, valori enfatizzati), `semantic-success` (risparmio, frecce "in calo"), avatar iniziali con colori diversi per riga (`error-container`, `tertiary-container`, `secondary-container` — puramente decorativi, non semantici).
- **Tipografia**: `display-lg` (valore `-$0.12`), `headline-lg-mobile` (titolo raccomandazione, titolo pagina), `headline-md` (titoli sezione, prezzi lista), `body-lg`/`body-md` (testo descrittivo).
- **Spaziature**: `pt-[80px] pb-[90px]` per lasciare spazio a header fisso e bottom nav fissa, card `rounded-2xl`, gap `gutter` (12px) tra sezioni.
- **Comportamento responsive**: nessun breakpoint `md:` esplicito nel contenuto (a differenza di Mappa Motus) — la bottom nav è presente senza `md:hidden`, quindi nel mockup resterebbe visibile anche desktop (incoerenza minore rispetto a Mappa Motus, che nasconde la bottom nav su desktop a favore del rail laterale).

---

## 5. Mappa Motus (Standard Header)

- **ID Stitch**: `cf26daff4b3e45a9bb74e23565803016`
- **Nome**: Mappa Motus (titolo pagina HTML: "Motus - Map")
- **Descrizione**: schermata **mappa a schermo intero** con pin prezzo carburante e bottom sheet "Cheapest Nearby" — **assente come schermata nell'app attuale** (l'app oggi ha solo liste, mai una vista cartografica).
- **Flusso di appartenenza**: nuovo flusso "Mappa" — parzialmente sovrapponibile a Flusso 4 (Impianti vicini) di `user-flows.md`, ma con presentazione cartografica invece che a lista (S04 attuale è `NearbyStationsScreen`, una lista).
- **Azioni disponibili**:
  - Search (header)
  - Avatar profilo (header, con `hover:ring-2`)
  - Tap su pin mappa (3 pin nel mockup: 2 "normali" con solo prezzo, 1 "cheapest/highlighted" con icona+prezzo in grassetto e doppio anello di focus)
  - Chiudi bottom sheet (icona X, solo mobile)
  - Righe lista "Cheapest Nearby" (cliccabili, bottone "Navigate" a comparsa su hover per la riga evidenziata)
  - Bottom nav mobile: Map (attivo) / Favorites / Pro / Profile
  - Rail laterale desktop (`md:flex`, nascosto mobile): stessi 4 target, più un blocco logo in alto
- **Schermate collegate**: righe della lista → presumibilmente Dettaglio Stazione (stesso pattern dati: nome, distanza, prezzo); tab Pro → Previsioni Pro; tab Favorites/Profile → nessuna schermata Stitch nell'export.
- **Dati visualizzati**:
  - Mappa di sfondo (immagine statica, non mappa interattiva reale — `data-location="Berlin, Germany"`)
  - 3 pin con prezzo (`1.88€`, `1.69€` evidenziato, `1.75€`)
  - Bottom sheet: titolo "Cheapest Nearby", sottotitolo "Regular E10 • 5km radius", 3 righe stazione (Motus Station 1.2km "Open 24/7" 1.69€ evidenziata; City Fuel 2.4km "Closes at 22:00" 1.75€; Express Gas 3.8km "Open 24/7" 1.88€)
- **Varianti**: **2 layout nello stesso file** — mobile (bottom sheet + bottom nav) e desktop (`md:`: sheet-pannello 420px ancorato a sinistra, sheet non full-width, rail di navigazione laterale 80px al posto della bottom nav). Questa è l'unica delle 4 schermate con un vero layout desktop alternativo esplicito, non solo un mockup ridimensionato.
- **Loading state**: non presente (mappa e pin sono statici/precaricati nel mockup).
- **Empty state**: non presente (nessuna variante "nessuna stazione nel raggio").
- **Error state**: non presente (nessuna variante "posizione non disponibile"/permesso negato — cosa che invece l'app attuale già gestisce in `useNearbyStations`).
- **Componenti utilizzati**: Header trasparente/overlay su mappa, Pin mappa (2 varianti: normale e "cheapest"), Bottom Sheet con drag handle + header sticky con backdrop-blur, Riga lista stazione con logo/brand, prezzo, azione "Navigate" a comparsa, Bottom Navigation Bar (mobile), Rail di navigazione verticale (desktop).
- **Asset**: mappa di sfondo (immagine statica placeholder, "Berlin, Germany" — dato di test, non riferito a Italia/dati reali del backend), logo Motus (header), loghi/brand stazione nella lista (placeholder), avatar utente.
- **Colori**: pin normali `bg-surface`/`text-on-surface` con bordo; pin "cheapest" `bg-primary`/`text-on-primary` con `ring-2 ring-primary ring-offset-2`; riga lista evidenziata `bg-surface-container-low border-primary/20`; nav attiva mobile con pillola `bg-secondary-fixed/50`; rail desktop attivo con `bg-secondary-fixed/50` in un riquadro 48×48.
- **Tipografia**: `label-lg` (testo pin, righe lista), `headline-md` (nome stazione lista, titolo sheet), `headline-lg` (prezzo evidenziato in lista), `body-md` (sottotitolo sheet, distanza/orario).
- **Spaziature**: bottom sheet `max-h-[442px]` mobile / `max-h-[530px]` desktop, sheet ancorato a `bottom-[64px]` mobile (sopra la bottom nav) / `bottom-margin-desktop` + `left-margin-desktop` desktop.
- **Comportamento responsive**: il più completo delle 4 — bottom nav sostituita da rail laterale (`md:hidden` / `md:flex`), bottom sheet che passa da full-width/bottom a pannello 420px ancorato in basso a sinistra, header che si sposta di `md:ml-20` per non sovrapporsi al rail.

---

## Riepilogo flussi impliciti nuovi (non in `user-flows.md`)

| Flusso implicito da Stitch                            | Schermate coinvolte                                                                        | Copertura in `user-flows.md` esistente                                                                                                 |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| Segnalazione prezzo                                   | Dettaglio Stazione → Segnala Prezzo                                                        | Assente                                                                                                                                |
| Previsioni Pro                                        | (Home/Map) → Previsioni Pro → Mappa Motus                                                  | Assente                                                                                                                                |
| Mappa (vista cartografica)                            | Mappa Motus ↔ Dettaglio Stazione, Mappa Motus ↔ Previsioni Pro                             | Sovrapposto solo parzialmente a Flusso 4 (che oggi è una lista, non una mappa)                                                         |
| Salva/Preferiti                                       | Dettaglio Stazione (bottone "Save") → "Favorites" (tab, nessuna schermata Stitch reperita) | Assente                                                                                                                                |
| Profilo utente                                        | Icona/avatar in ogni header → "Profile" (tab, nessuna schermata Stitch reperita)           | Assente                                                                                                                                |
| Navigazione a 4 tab (Map / Favorites / Pro / Profile) | Bottom nav mobile in Previsioni Pro e Mappa Motus, rail desktop in Mappa Motus             | **In contraddizione con la Home a 3 pulsanti descritta in `mobile-completion-matrix.md`** (S01/S02/S04, nessuna tab bar) — vedi Fase 3 |

Questi 6 elementi vengono ripresi puntualmente nella matrice di gap
(`stitch-implementation-gap.md`, Fase 3).
