# Motus — Input disponibili per il design

Poiché `mcp-audit.md` conferma che **nessun progetto di design Motus esiste** sul solo strumento di design disponibile (`DesignSync`, verificato con `list_projects` → `[]`), questo documento cataloga tutto ciò che **esiste realmente nel repository** come materiale di partenza per un futuro lavoro di design — nessuna fonte esterna, nessuna invenzione.

Legenda: 🟢 Asset/dato reale verificato in questa sessione — 🟡 Assunzione/interpretazione — 🔴 Riferimento trovato ma non verificabile/irrisolto.

---

## 1. Asset grafici presenti in `Motus-frontend/assets/`

Tutti i file sono stati aperti e ispezionati visivamente in questa sessione (non solo elencati per nome).

| File | Dimensioni | Contenuto osservato | Valutazione |
| --- | --- | --- | --- |
| `icon.png` | 1024×1024, RGB | 🟢 Segno grafico blu a forma di chevron/"A" stilizzato, su sfondo azzurro chiarissimo, **con guide di costruzione in stile blueprint visibili nell'immagine** (cerchi concentrici, linee guida tratteggiate, indicatore di centro) | ⚠️ Non utilizzabile così com'è come icona di produzione: le guide di costruzione sono "cotte" nel PNG, non sono un livello separato. Va rigenerato un export pulito dello stesso segno |
| `favicon.png` | 48×48, RGBA | 🟢 Stesso segno (chevron blu), pulito, senza guide | 🟢 Coerente e riutilizzabile |
| `android-icon-foreground.png` | 512×512 | 🟢 Stesso segno (chevron blu con gradiente), pulito, senza guide, su sfondo trasparente | 🟢 Coerente e riutilizzabile |
| `android-icon-background.png` | 512×512 | Non ispezionato visivamente in questa sessione (solo elencato) | — |
| `android-icon-monochrome.png` | 432×432 | Non ispezionato visivamente in questa sessione (solo elencato) | — |
| `splash-icon.png` | 1024×1024, colormap | 🟢 **Motivo geometrico generico**: tre cerchi concentrici grigio chiaro su griglia bianca, **nessuna relazione visibile con il segno blu usato altrove** | 🔴 Non è un asset di brand Motus: sembra un placeholder rimasto non sostituito |

**Conclusione verificata**: esiste già un segno grafico coerente (chevron/"A" blu, gradiente da blu scuro a blu chiaro) usato in 3 dei 4 file icona ispezionati — è il candidato più solido a "logo/marchio Motus" già presente nel repository, anche se **nessun documento lo dichiara esplicitamente come tale** (nessun brandbook, nessun file sorgente vettoriale, nessuna nota nel README). Lo `splash-icon.png` è invece scollegato da questo segno e va considerato un placeholder da sostituire, non un input di design valido.

## 2. Token tecnici già presenti in `src/theme/tokens.js`

🟢 Estratti dal file reale (non da documentazione):

```js
colors = {
  background: "#F8FAFC",
  surface:    "#FFFFFF",
  primary:    "#2563EB",
  foreground: "#0F172A",
  muted:      "#64748B",
  border:     "#E2E8F0",
}
spacing = { xs: "4px", sm: "8px", md: "16px", lg: "24px", xl: "32px" }
typography = {
  body:  ["16px", { lineHeight: "24px" }],
  title: ["24px", { lineHeight: "32px", fontWeight: "600" }],
}
```

🟢 Il commento in cima al file dichiara esplicitamente: *"Temporary technical tokens. Replace these values after the Stitch design analysis"* — quindi gli stessi autori del codice considerano questi valori **provvisori**, non un design system definitivo. Il colore `primary` (`#2563EB`, un blu) è visivamente coerente con il chevron blu del logo osservato al punto 1 (🟡 coincidenza plausibile, non confermata da alcun documento come intenzionale).

🔴 **Riferimento irrisolto**: "Stitch design analysis". Nessuno strumento, server MCP o skill con questo nome è disponibile in questo ambiente (verificato in `mcp-audit.md`, §5). Non è possibile determinare se si tratti di un processo di design pianificato ma non ancora documentato, di un prodotto esterno (es. lo strumento "Stitch" di Google Labs, mai citato altrove nel repository), o di altro. **Da chiarire con il team**, non risolvibile con le fonti disponibili in questo task.

## 3. Font e immagini dichiarati ma assenti

🟢 `assets/fonts/` e `assets/images/` contengono solo `.gitkeep`: **nessun font custom, nessuna immagine applicativa** oltre alle icone di sistema elencate sopra. `assets/icons/` idem, solo `.gitkeep`. Nessuna libreria di icone applicative (per S01–S04, es. icona "carburante", icona "posizione") esiste ancora nel repository.

## 4. Documenti prodotto/tecnici già prodotti in questo repository (Task 1–3)

Da riusare come input strutturato per il design, non da rileggere da zero:

| Documento | Cosa offre al design |
| --- | --- |
| `docs/motus/product-requirements.md` | Finalità, casi d'uso, dati visualizzati, azioni consentite — base per capire cosa ogni schermata deve mostrare |
| `docs/motus/domain-model.md` | Entità e relazioni (Impianto, Prezzo, Geocodifica) — base per i componenti dati (card impianto, riga prezzo) |
| `docs/motus/screen-inventory.md` | 4 schermate ipotizzate (S01–S04), tutte marcate come assunzione — punto di partenza per wireframe, non specifica confermata |
| `docs/motus/user-flows.md` | Sequenze di interazione e stati alternativi/errore da progettare per ciascuna schermata |
| `docs/motus/api-contract.md` | Campi realmente disponibili per ogni schermata, inclusi i casi limite osservati dal vivo (nome impianto vuoto, nessun prezzo, nessuna coordinata) — vincoli reali per il contenuto di ogni componente |
| `docs/motus/api-screen-mapping.md` | Quali chiamate ogni schermata deve fare, con i parametri esatti |

## 5. Stato del progetto design su `DesignSync` (claude.ai/design)

🟢 Verificato in questa sessione (`mcp-audit.md`, §4): **nessun progetto esistente**. Qualunque lavoro di design strutturato (componenti, schermate) dovrà partire da un progetto nuovo (`create_project`, non ancora eseguito in questo task) — non c'è nulla da recuperare o da cui ripartire su questo strumento.

---

## Riepilogo: cosa è disponibile vs cosa manca

| Input | Disponibile? |
| --- | --- |
| Segno grafico/logo (chevron blu) | 🟢 Sì, in 3 varianti pulite (`favicon.png`, `android-icon-foreground.png`) + 1 con difetto di export (`icon.png`) |
| Palette colori | 🟢 Sì, ma dichiarata esplicitamente provvisoria nel codice |
| Scala spaziature/tipografia | 🟢 Sì, provvisoria |
| Font custom | 🔴 Assente |
| Iconografia applicativa (carburante, posizione, ecc.) | 🔴 Assente |
| Splash screen coerente col brand | 🔴 Assente (placeholder generico non correlato) |
| Progetto design-system su claude.ai/design | 🔴 Assente (verificato: zero progetti) |
| Specifica funzionale/dati/flussi | 🟢 Sì, prodotta nei Task 1–3 di questo repository |
| Chiarimento su "Stitch design analysis" | 🔴 Riferimento trovato, non risolvibile con le fonti disponibili |
