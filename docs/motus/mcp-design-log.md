# Motus — Log delle operazioni MCP di design (Task 9)

Registro delle chiamate reali eseguite in questa sessione (2026-08-05) verso lo strumento di design disponibile. Nessun output qui riportato è simulato: ogni riga della tabella §2 corrisponde a una chiamata tool realmente eseguita e al suo risultato reale.

## 1. Strumento utilizzato

Come già accertato in `docs/motus/mcp-audit.md` (Task 4/6) e riconfermato all'inizio di questo task: l'unico strumento del dominio "design" disponibile in sessione è **`DesignSync`**, che legge/scrive progetti design-system su claude.ai/design. Non ha prefisso `mcp__` e non è elencato in `mcpServers` — è uno strumento nativo di Claude Code verso un prodotto separato, non un server MCP registrato in senso stretto (distinzione già documentata in `mcp-audit.md`, riportata qui solo come richiamo, non riverificata da zero).

Nessun altro strumento con capacità di design (generazione immagini, editor vettoriale, Figma, ecc.) è comparso in `ToolSearch` durante questo task.

## 2. Operazioni eseguite, in ordine

| #   | Metodo           | Parametri chiave                                                                                                                                                                                                     | Esito reale                                                                               |
| --- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1   | `list_projects`  | —                                                                                                                                                                                                                    | `{"projects":[]}` — confermato: ancora nessun progetto, coerente con l'audit del Task 4/6 |
| 2   | `create_project` | `name: "Motus"`                                                                                                                                                                                                      | **Creato** — `projectId: cde3c6bc-4c82-4852-97c4-8f5f5c7c88f5`                            |
| 3   | `list_projects`  | —                                                                                                                                                                                                                    | _(non ripetuto dopo la creazione; verifica di esistenza fatta via `list_files`, vedi #6)_ |
| 4   | `finalize_plan`  | `projectId: cde3c6bc-4c82-4852-97c4-8f5f5c7c88f5`, `localDir: <scratchpad>/brand`, `writes: ["assets/icons/*.svg","assets/icons/*.png","assets/images/*.svg","assets/images/*.png","preview/*.html"]`, `deletes: []` | `planId: plan_cde3c6bc4c824852_adeaffb22879`                                              |
| 5   | `write_files`    | 19 file (9 SVG, 6 PNG in `assets/icons/`+`assets/images/`, 4 HTML in `preview/`), tutti via `localPath`                                                                                                              | `{"written":19}`                                                                          |
| 6   | `list_files`     | `projectId: cde3c6bc-4c82-4852-97c4-8f5f5c7c88f5`                                                                                                                                                                    | 22 path restituiti (4 directory + 18 file), confermano la scrittura riuscita — vedi §3    |

### Nota su un dettaglio dello schema non documentato

`finalize_plan` ha **rifiutato** la prima chiamata (senza `deletes`) con l'errore `finalize_plan requires: deletes.`, nonostante lo schema del tool indichi `deletes` come opzionale ("exact paths ... that will be deleted"). Corretto passando `deletes: []` esplicito. Riportato come limite/comportamento reale riscontrato, non una supposizione.

## 3. Identificativi delle risorse create

- **Progetto**: `Motus` — `projectId: cde3c6bc-4c82-4852-97c4-8f5f5c7c88f5` (claude.ai/design)
- **Piano di scrittura**: `planId: plan_cde3c6bc4c824852_adeaffb22879`
- **File presenti nel progetto dopo la sincronizzazione** (da `list_files`, risposta reale):
  ```
  assets/icons/motus-icon-dark-bg.png
  assets/icons/motus-icon-dark-bg.svg
  assets/icons/motus-icon-light-bg.png
  assets/icons/motus-icon-light-bg.svg
  assets/icons/motus-symbol-monochrome-white.png
  assets/icons/motus-symbol-monochrome-white.svg
  assets/icons/motus-symbol-monochrome.png
  assets/icons/motus-symbol-monochrome.svg
  assets/icons/motus-symbol.png
  assets/icons/motus-symbol.svg
  assets/images/motus-logo-on-dark.png
  assets/images/motus-logo-on-dark.svg
  assets/images/motus-logo-primary.png
  assets/images/motus-logo-primary.svg
  assets/images/motus-splash.svg
  preview/app-icons.html
  preview/colors.html
  preview/logotype.html
  preview/symbol.html
  ```
  (più le directory implicite `assets`, `assets/icons`, `assets/images`, `preview`)

## 4. Limiti reali incontrati con questo strumento

Confermano e completano quanto già documentato in `mcp-audit.md`:

1. **Nessuna generazione di immagini/loghi**: `DesignSync` non ha alcun metodo che produca grafica. Ogni file caricato (simbolo, logotipo, icone, splash) è stato **prodotto fuori dallo strumento** — come sorgente SVG scritta a mano in questa sessione, sulla base del segno grafico già esistente in `assets/favicon.png`/`assets/android-icon-foreground.png` (ispezionato visivamente, non ridisegnato da zero) — e poi solo **sincronizzato** sul progetto via `write_files`.
2. **Nessun concetto nativo di "schermata"/frame/canvas**: coerente con l'audit precedente, non rilevante per questo task (nessuna schermata prevista).
3. **`get_file` limitato a 256 KiB**: non un problema in questa sessione (tutti i PNG prodotti sono <25 KB), ma un vincolo reale dello strumento per usi futuri con asset più pesanti.
4. **`finalize_plan` richiede `deletes` esplicito** anche quando non si elimina nulla (vedi nota §2) — comportamento più rigido di quanto lo schema dichiari.
5. **Nessuna validazione né conversione di formato lato server**: lo strumento accetta i byte così come sono (`write_files` da `localPath`); qualunque controllo di formato/dimensione/leggibilità (§7 di `brand-guidelines.md`) è stato eseguito localmente, fuori da `DesignSync`, con `rsvg-convert` (rendering SVG→PNG) e ispezione visiva diretta dei render.

## 5. Asset esportati (formati realmente supportati)

Formati usati: **SVG** (sorgente vettoriale, editabile) e **PNG** (raster, renderizzato da SVG via `rsvg-convert`, strumento reale disponibile in ambiente — verificato con `which rsvg-convert`). Nessun formato non verificato (es. AI, Sketch, Figma nativo) è stato dichiarato o prodotto: non esiste uno strumento in questa sessione capace di generarli o leggerli.

| Asset                              | Formati esportati          | Percorso locale                                                   | Sincronizzato su `DesignSync`                                      |
| ---------------------------------- | -------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------ |
| Simbolo isolato                    | SVG, PNG 1024×1024         | `assets/icons/motus-symbol.*`                                     | Sì                                                                 |
| Simbolo monocromatico (ink)        | SVG, PNG 1024×1024         | `assets/icons/motus-symbol-monochrome.*`                          | Sì                                                                 |
| Simbolo monocromatico (bianco)     | SVG, PNG 1024×1024         | `assets/icons/motus-symbol-monochrome-white.*`                    | Sì                                                                 |
| Icona su sfondo chiaro             | SVG, PNG 1024×1024         | `assets/icons/motus-icon-light-bg.*`                              | Sì                                                                 |
| Icona su sfondo scuro              | SVG, PNG 1024×1024         | `assets/icons/motus-icon-dark-bg.*`                               | Sì                                                                 |
| Logotipo primario                  | SVG, PNG 640×200           | `assets/images/motus-logo-primary.*`                              | Sì                                                                 |
| Logotipo su sfondo scuro           | SVG, PNG 640×200           | `assets/images/motus-logo-on-dark.*`                              | Sì                                                                 |
| Splash (sorgente)                  | SVG                        | `assets/images/motus-splash.svg`                                  | Sì                                                                 |
| App icon di produzione             | PNG 1024×1024, senza alpha | `assets/icon.png` (sostituito, era difettoso)                     | No (file di produzione dell'app, non caricato sul progetto design) |
| Sfondo icona Android di produzione | PNG 1024×1024, senza alpha | `assets/android-icon-background.png` (sostituito, era difettoso)  | No                                                                 |
| Splash di produzione               | PNG 1024×1024, con alpha   | `assets/splash-icon.png` (sostituito, era placeholder scollegato) | No                                                                 |

I tre file "di produzione" non sono stati caricati su `DesignSync` perché sono i file realmente referenziati da `app.json` (`expo.icon`, `android.adaptiveIcon.backgroundImage`, `plugins[expo-splash-screen].image`): la loro sede canonica è il repository, non il progetto design — `DesignSync` ospita le varianti/preview di lavoro (§3), non sostituisce gli asset applicativi.

## 6. Verifica di leggibilità (riferimento)

Eseguita localmente con `rsvg-convert` a 16/24/32/48/64px e ispezione visiva diretta di ogni export — dettaglio e soglia raccomandata in `docs/motus/brand-guidelines.md`, §7. Non è stata delegata a `DesignSync`, che non offre alcuna funzione di verifica visiva o rendering a più risoluzioni.
