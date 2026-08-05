# Motus — Audit del server MCP dedicato al design

## Metodologia

Verifica eseguita in questa sessione (2026-08-05) tramite:
- Ispezione della configurazione MCP reale: `~/.claude.json` (chiave globale `mcpServers`, chiave `mcpServers` dell'entry di progetto per `Motus-frontend`, `enabledMcpjsonServers`), assenza di file `.mcp.json` nel repository.
- `ToolSearch` sui tool deferred disponibili in sessione, per identificare tutti gli strumenti con dominio "design" (query su design/figma/asset/component/token/export).
- Chiamata reale, non distruttiva, allo strumento identificato: `DesignSync` con `method: "list_projects"`.
- Chiamata reale a `ListMcpResourcesTool` (senza filtro `server`) per verificare risorse esposte da qualunque server MCP connesso.

Ogni affermazione marcata ✅ è stata osservata realmente in questa sessione, non dedotta dalla sola documentazione del tool.

---

## 1. Server MCP effettivamente configurati

✅ **Verificato**: nessun server MCP personalizzato è configurato, né a livello globale né per questo progetto.

| Fonte controllata | Esito |
| --- | --- |
| `~/.claude.json` → `mcpServers` (livello globale) | `{}` (vuoto) |
| `~/.claude.json` → `projects["…/Motus-frontend"].mcpServers` | `{}` (vuoto) |
| `~/.claude.json` → `projects["…/Motus-frontend"].enabledMcpjsonServers` | `[]` (vuoto) |
| File `.mcp.json` nel repository | Assente |
| `claude mcp list` (CLI) | Comando non disponibile in questo ambiente (`command not found: claude`) |

L'unica famiglia di strumenti realmente prefissata `mcp__` (cioè un vero e proprio server MCP nel senso stretto del protocollo) presente in questa sessione è `mcp__plugin_context-mode_context-mode__*` (plugin **context-mode**): fornisce `ctx_execute`, `ctx_search`, `ctx_batch_execute`, `ctx_fetch_and_index`, `ctx_index`, `ctx_insight`, `ctx_purge`, `ctx_stats`, `ctx_doctor`, `ctx_upgrade`. ✅ Verificato dal proprio schema: **nessuno di questi metodi riguarda design, progetti grafici, componenti o asset** — è un server dedicato a esecuzione sandboxata di codice e ricerca full-text per risparmiare contesto, estraneo al perimetro di questo task.

`claudeAiMcpEverConnected` (storico connettori claude.ai mai autorizzati per questo account) elenca: `claude.ai Google Calendar`, `claude.ai Gmail`, `claude.ai Google Drive`, `claude.ai Claude Code Remote`. ✅ Nessuno di questi è un connettore di design.

## 2. Lo strumento pertinente a Motus: `DesignSync`

✅ **Identificato tramite `ToolSearch`** (query: "figma design system component asset token export") come unico strumento della sessione il cui dominio è "design": legge/aggiorna i **progetti design-system di claude.ai/design** attraverso il login claude.ai dell'utente (o un'autorizzazione dedicata via `/design-login` se non si dispone di un login claude.ai).

⚠️ **Precisazione importante sulla natura dello strumento**: `DesignSync` **non ha il prefisso `mcp__`** e **non compare in nessuna configurazione `mcpServers`** di questo ambiente (verificato al punto 1). È uno strumento nativo di Claude Code che parla con il prodotto separato "claude.ai/design" via OAuth, non un server MCP registrato dall'utente in senso classico. Lo si documenta qui perché è l'unica capacità reale del dominio "design" in questa sessione e corrisponde al vocabolario richiesto dal task (progetti, file, asset, workspace) — ma va riportato con questa distinzione per non dichiarare l'esistenza di un "server MCP" che, tecnicamente, non è configurato come tale in questo ambiente.

Il tool dichiara inoltre una dipendenza da uno skill companion `/design-sync`, **non presente** nell'elenco degli skill disponibili in questa sessione (verificato contro l'elenco completo degli skill del system prompt) — il flusso guidato descritto nella documentazione del tool non è quindi interamente disponibile qui, solo le chiamate dirette al tool.

### Operazioni (`method`) esposte da `DesignSync` — nomi reali dallo schema

| `method` | Tipo | Descrizione dallo schema reale |
| --- | --- | --- |
| `list_projects` | Lettura | Elenca i progetti design-system scrivibili dall'utente: `name`, `owner`, `projectId`, `updatedAt` |
| `get_project` | Lettura | Metadati di un progetto: `name`, `type`, `owner`, `canEdit` |
| `list_files` | Lettura | Elenca i path dei file in un progetto |
| `get_file` | Lettura | Legge un file remoto (**limite 256 KiB**) |
| `create_project` | Scrittura (permission prompt) | Crea un nuovo progetto design-system, richiede solo `name` |
| `finalize_plan` | Scrittura (permission prompt) | Blocca l'insieme esatto di path da scrivere/eliminare (`writes`, `deletes`, `localDir`), restituisce `planId` |
| `write_files` | Scrittura (richiede `planId`) | Scrive file (max 256 per chiamata) da `localPath` o `data` inline |
| `delete_files` | Scrittura (richiede `planId`) | Elimina file dal progetto |
| `register_assets` | Scrittura (richiede `planId`) | Registra card di anteprima nel pannello "Design System" (legacy — non serve più se il file HTML ha il marker `@dsCard`) |
| `unregister_assets` | Scrittura (richiede `planId`) | Rimuove una card registrata |
| `report_validate` | — | Riceve conteggi aggregati (`total`, `bad`, `thin`, `variantsIdentical`, `iterations`) da un file `.render-check.json` locale |

---

## 3. Verifica delle capacità richieste dal task

| Capacità richiesta | Esito | Motivazione (con nome reale del metodo) |
| --- | --- | --- |
| **Lettura di design** | ✅ SÌ | `list_projects`, `get_project`, `list_files`, `get_file` — tutti metodi di lettura reali |
| **Creazione di progetti** | ✅ SÌ (non eseguita in questo task) | `create_project(name)` — esiste, richiede permission prompt; **non chiamato** in questa sessione per rispetto del vincolo "non creare ancora tutte le schermate" e per prudenza (azione con effetto persistente sull'account claude.ai dell'utente) |
| **Creazione di schermate** | ❌ NO, non come primitiva dedicata | Non esiste alcun concetto nativo di "schermata"/frame/canvas/mockup nello schema. `write_files` scrive file arbitrari (tipicamente HTML di anteprima componente) a path scelti dal chiamante: è un meccanismo di **sincronizzazione file**, non un generatore di schermate o un editor visuale |
| **Modifica di schermate** | ❌ NO, non come primitiva dedicata | Stessa osservazione: `write_files` può sovrascrivere un file esistente, ma non esiste un'operazione di "modifica" strutturata (nessun diff visuale, nessun concetto di frame/schermata da modificare in-place) |
| **Creazione di componenti** | ⚠️ PARZIALE | `write_files` + `register_assets` permettono di caricare e catalogare (gruppo, nome, sottotitolo, viewport) anteprime HTML di componenti nel pannello "Design System" — ma il contenuto del componente (markup/HTML) deve essere prodotto dal chiamante; il tool non genera autonomamente design o codice di componente |
| **Gestione di token** (colore/spaziatura/tipografia) | ❌ NO, nessuna primitiva dedicata | Nessun metodo specifico per "design token". Potrebbero solo essere modellati come un file qualunque (es. `tokens.json`) tramite `write_files`, senza alcuna struttura o validazione nativa da parte del tool |
| **Generazione di logo** | ❌ NO | Nessun metodo di generazione immagini/loghi nello schema |
| **Esportazione di asset** | ⚠️ PARZIALE | `get_file` scarica il contenuto di un file remoto già esistente in un progetto (max 256 KiB) — è "esportazione" solo nel senso di lettura/download di ciò che è già stato caricato; non esiste un endpoint di export in formati immagine (PNG/SVG) o come bundle |
| **Estrazione di codice o specifiche** | ⚠️ PARZIALE, ma oggi vuota | `list_files` + `get_file` permetterebbero di leggere markup/codice dei file di un progetto esistente — **ma nessun progetto esiste** (vedi §4), quindi non c'è nulla da estrarre allo stato attuale |

---

## 4. Design Motus già esistenti — verificato dal vivo

✅ **Operazione non distruttiva eseguita realmente**: `DesignSync` con `method: "list_projects"`.

Risposta reale ottenuta:
```json
{"method":"list_projects","projects":[]}
```

**Nessun progetto** design-system è disponibile in scrittura per l'utente — array vuoto. Non esiste quindi **nessun progetto "Motus"**, né alcun altro progetto, su questo strumento. Conferma anche l'assenza di qualunque workspace o asset caricato in precedenza: senza un `projectId` valido, `get_project`/`list_files`/`get_file` non hanno nulla da restituire (non chiamati, perché non applicabili in assenza di progetti).

✅ **Verifica aggiuntiva**: `ListMcpResourcesTool` (senza filtro `server`, quindi su tutti i server MCP connessi) → risposta: *"No resources found. MCP servers may still provide tools even if they have no resources."* Nessuna risorsa MCP di alcun tipo, design o altro, è esposta in questa sessione.

## 5. Riferimento irrisolto trovato nel codice: "Stitch"

Durante l'ispezione (necessaria per `design-inputs.md`) di `src/theme/tokens.js` in questo repository è stato trovato il commento:

> *"Temporary technical tokens. Replace these values after the Stitch design analysis"*

⚠️ **Nessun server MCP, tool o skill chiamato "Stitch" esiste o è raggiungibile in questo ambiente** (verificato: non compare in `ToolSearch`, non compare tra gli skill disponibili, non compare in `mcpServers`). Il riferimento non è quindi verificabile né utilizzabile in questo task. Riportato come dato di fatto grezzo in `design-inputs.md`, non come funzionalità disponibile.

---

## Conclusione: cosa del processo di design è realmente svolgibile via MCP oggi

- **Svolgibile ora**: lettura di eventuali progetti/file/asset esistenti su claude.ai/design (ma oggi non ce n'è nessuno per l'utente corrente); creazione di un nuovo progetto design-system vuoto (`create_project`, non ancora eseguita); caricamento di file HTML di componente già prodotti altrove, con catalogazione nel pannello Design System (`write_files` + `register_assets`, previo `finalize_plan`).
- **Non svolgibile con questo strumento**: generazione autonoma di schermate, componenti, loghi o design token — `DesignSync` è un meccanismo di **sincronizzazione** tra file locali e un progetto claude.ai/design, non uno strumento generativo. Ogni contenuto di design (markup, HTML, token) deve essere prodotto altrove (es. dal modello stesso durante l'implementazione, o da uno strumento di design esterno) e poi eventualmente sincronizzato.
- **Nessun altro server MCP** in questa sessione (context-mode, connettori claude.ai Gmail/Calendar/Drive/Remote) ha alcuna capacità di design.
