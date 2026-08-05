# Motus — Guida di brand

Legenda: 🟢 Dato reale verificato in questa sessione — 🟡 Assunzione/interpretazione — 🔴 Aperto/da decidere.

## 0. Fonti

Questa guida deriva esclusivamente da materiale già reale nel repository, non da input esterni:

| Fonte                                                                                            | Cosa fornisce                                                                                                               |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `docs/motus/product-requirements.md` (Task 2)                                                    | Finalità dell'app, utenti, casi d'uso, assenza di login/ruoli                                                               |
| `docs/motus/design-inputs.md` (Task 4)                                                           | Inventario degli asset grafici esistenti, token tecnici provvisori                                                          |
| `docs/motus/architecture.md`, ADR (Task 6)                                                       | Stack Expo SDK 54, nessuna decisione di design system pregressa                                                             |
| `src/theme/tokens.js`                                                                            | Colori/spaziature/tipografia già in codice (dichiarati "provvisori" nel commento del file)                                  |
| `app.json`                                                                                       | Colori già cablati per icone/splash (`android.adaptiveIcon.backgroundColor`, `plugins[expo-splash-screen].backgroundColor`) |
| `assets/favicon.png`, `assets/android-icon-foreground.png`, `assets/android-icon-monochrome.png` | Segno grafico (chevron blu) già presente e riutilizzabile, ispezionato visivamente                                          |

Nessun elemento di questa guida è stato inventato senza un ancoraggio a una di queste fonti.

## 1. Finalità e personalità del prodotto (da Task 2)

🟢 Motus è un client di sola consultazione per dati pubblici MIMIT su impianti e prezzi carburante in Italia: ricerca impianti, dettaglio impianto/prezzi, ricerca "vicino a me", nessuna registrazione, nessun ruolo utente, nessuna scrittura.

🟡 Personalità derivata (non dichiarata esplicitamente in alcun documento, dedotta per coerenza con quanto sopra):

- **Istituzionale/neutrale**: dato pubblico, nessuna pubblicità, nessuna manipolazione — il brand non deve sembrare commerciale o "venditore".
- **Funzionale/essenziale**: strumento di consultazione rapida (prezzo, distanza), non un'app lifestyle — la forma deve favorire la leggibilità immediata, non la decorazione.
- **Diretto**: messaggi d'errore già in italiano semplice e diretto nel backend (`"impianto non trovato"`, ecc.) — il tono visivo deve essere coerente: chiaro, senza fronzoli.
- **Movimento/direzione**: il nome stesso, _Motus_ (lat. "movimento"), e il caso d'uso "impianti più vicini" suggeriscono un'identità legata a direzione/orientamento.

## 2. Principi visivi

1. **Chiarezza funzionale** — ogni elemento deve restare leggibile a colpo d'occhio, come una segnaletica stradale. Niente texture, ombre decorative o effetti che non servano a distinguere un elemento dall'altro.
2. **Neutralità istituzionale** — palette contenuta (blu + neutri), nessun colore "promozionale" aggiuntivo non richiesto dai dati (es. i colori dei prezzi/carburanti, se introdotti in futuro, sono un tema a parte, non trattato qui).
3. **Direzione** — il simbolo richiama un segno di direzione/orientamento (chevron verso l'alto), coerente col nome _Motus_ e con il caso d'uso "vicino a me". Non è un monogramma della lettera iniziale del nome (non esiste una lettura "M" plausibile nel segno) — va descritto e usato come **simbolo astratto di direzione**, non come iniziale.
4. **Continuità con l'esistente** — il colore primario (`#2563EB`) e il segno grafico (chevron) esistevano già nel repository (`src/theme/tokens.js`, `assets/favicon.png`) prima di questo task: questa guida li **conferma e sistematizza**, non introduce un brand alternativo scollegato da ciò che l'app già usa.

## 3. Simbolo

🟢 Il simbolo è lo stesso segno a chevron ("∧") già presente e utilizzabile in `assets/favicon.png` e `assets/android-icon-foreground.png` prima di questo task, ricostruito qui come sorgente vettoriale pulita (nessuna guida di costruzione "cotta" nel file, a differenza del vecchio `assets/icon.png`).

- Geometria: singolo tratto a "V" con estremità e giunzione arrotondate (`stroke-linecap: round`, `stroke-linejoin: round`), non un poligono chiuso.
- Sorgente vettoriale canonica: [`assets/icons/motus-symbol.svg`](../../assets/icons/motus-symbol.svg) — viewBox `1024×1024`, path `M 310 700 L 512 290 L 714 700`, `stroke-width: 170`.
- Ogni altra variante (monocromatica, su sfondo chiaro/scuro, icona app) riusa **la stessa geometria**, cambiando solo riempimento e sfondo — nessuna decorazione aggiuntiva rispetto a questo segno.

## 4. Colore

🟢 Tutti i valori sono ripresi da `src/theme/tokens.js` o `app.json`, non inventati:

| Token             | Valore    | Origine                                                   | Uso                                                     |
| ----------------- | --------- | --------------------------------------------------------- | ------------------------------------------------------- |
| Gradiente — alto  | `#1D4ED8` | Derivato (tonalità più scura di `primary`)                | Apice del simbolo                                       |
| Primary           | `#2563EB` | `tokens.js: colors.primary`                               | Uso piatto a colore singolo (es. link, stati attivi)    |
| Gradiente — basso | `#93C5FD` | Derivato (tonalità più chiara di `primary`)               | Base/piedi del simbolo                                  |
| Ink               | `#0F172A` | `tokens.js: colors.foreground`                            | Testo logotipo su sfondo chiaro, versione monocromatica |
| Surface           | `#F8FAFC` | `tokens.js: colors.background`                            | Sfondo splash, sfondo logotipo chiaro                   |
| Icon background   | `#E6F4FE` | `app.json: android.adaptiveIcon.backgroundColor`          | Sfondo icona app                                        |
| Dark surface      | `#0F172A` | `tokens.js: colors.foreground`, riusato come sfondo scuro | Sfondo logotipo/icona su superfici scure                |

🔴 **Aperto**: `tokens.js` non definisce ancora una palette per tema scuro applicativo (solo `foreground` riusato qui come sfondo). Se l'app adotterà un tema scuro completo, questi valori andranno rivisti in `tokens.js`, non solo in questa guida.

## 5. Logotipo

🟢 Simbolo + wordmark "Motus", impaginazione orizzontale. File: [`assets/images/motus-logo-primary.svg`](../../assets/images/motus-logo-primary.svg) (sfondo chiaro), [`assets/images/motus-logo-on-dark.svg`](../../assets/images/motus-logo-on-dark.svg) (sfondo scuro).

🔴 **Aperto — tipografia**: `assets/fonts/` è vuota (confermato in `design-inputs.md`), nessun font custom è mai stato scelto o licenziato per Motus. Il wordmark in questa guida usa lo stack di sistema (`-apple-system, system-ui, Segoe UI, Roboto, sans-serif`) come scelta onesta e disponibile oggi — **non va presentato come il typeface definitivo del brand**, ma come composizione provvisoria in attesa di una decisione tipografica dedicata (fuori perimetro di questo task).

## 6. Utilizzo su sfondi chiari e scuri

| Contesto                                     | Simbolo                                                                                                                                                         | Testo/logotipo   |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Sfondo chiaro (`#F8FAFC`, `#E6F4FE`, bianco) | Versione a gradiente (`motus-symbol.svg`) o monocromatica ink (`motus-symbol-monochrome.svg`)                                                                   | Ink `#0F172A`    |
| Sfondo scuro (`#0F172A` o più scuro)         | Versione a gradiente invariata (contrasto verificato visivamente — il blu resta leggibile su navy) o monocromatica bianca (`motus-symbol-monochrome-white.svg`) | Bianco `#FFFFFF` |

Regola: **non alterare i due blu del gradiente tra sfondo chiaro e scuro** — solo il colore del testo e, quando serve un segno a tinta unica, la versione monocromatica cambiano.

## 7. Verifica di leggibilità a piccole dimensioni

🟢 Verificata in questa sessione renderizzando `motus-icon-light-bg.svg` (rsvg-convert) a 16, 24, 32, 48, 64px e ispezionando visivamente ogni export:

| Dimensione   | Esito                                                                                                                                                                       |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 16px         | Riconoscibile ma la tacca interna tra le due gambe tende a chiudersi otticamente — dimensione minima accettabile solo per contesti a bassa importanza (es. favicon browser) |
| 24px         | Leggibile, forma a "V" distinguibile chiaramente                                                                                                                            |
| 32px e oltre | Pienamente leggibile, gradiente visibile senza banding                                                                                                                      |

**Dimensione minima raccomandata: 24px.** Sotto questa soglia preferire la versione monocromatica piatta (meno dettaglio da risolvere) alla versione a gradiente.

## 8. Inventario asset prodotti in questo task

Tutti in `assets/icons/` e `assets/images/`, sorgente vettoriale (`.svg`) + export raster (`.png`) dove pertinente:

| File                                                      | Tipo                                                     |
| --------------------------------------------------------- | -------------------------------------------------------- |
| `assets/icons/motus-symbol.svg` / `.png`                  | Simbolo isolato, gradiente, sfondo trasparente           |
| `assets/icons/motus-symbol-monochrome.svg` / `.png`       | Simbolo monocromatico (ink)                              |
| `assets/icons/motus-symbol-monochrome-white.svg` / `.png` | Simbolo monocromatico (bianco, per sfondi scuri/overlay) |
| `assets/icons/motus-icon-light-bg.svg` / `.png`           | Icona app, sfondo chiaro — sorgente di `assets/icon.png` |
| `assets/icons/motus-icon-dark-bg.svg` / `.png`            | Esempio d'uso su sfondo scuro                            |
| `assets/images/motus-logo-primary.svg` / `.png`           | Logotipo completo, sfondo chiaro                         |
| `assets/images/motus-logo-on-dark.svg` / `.png`           | Logotipo completo, sfondo scuro                          |
| `assets/images/motus-splash.svg`                          | Sorgente vettoriale dello splash (simbolo + superficie)  |

### File di produzione corretti (bug, non nuove decorazioni)

| File                                 | Problema riscontrato (da `design-inputs.md`)                                     | Correzione applicata                                                                                                                                        |
| ------------------------------------ | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `assets/icon.png`                    | Guide di costruzione blueprint "cotte" nel PNG                                   | Rigenerato da `motus-icon-light-bg.svg`, 1024×1024, nessuna guida                                                                                           |
| `assets/android-icon-background.png` | Stesse guide di costruzione cotte nello sfondo                                   | Rigenerato come riempimento piatto `#E6F4FE`, 1024×1024                                                                                                     |
| `assets/splash-icon.png`             | Placeholder generico (tre cerchi concentrici) senza relazione col segno di brand | Sostituito col simbolo (`motus-symbol.png`, sfondo trasparente), coerente con `expo-splash-screen.backgroundColor` già impostato su `#F8FAFC` in `app.json` |

🟢 **Non modificati** (già valutati coerenti e riutilizzabili in `design-inputs.md`): `assets/favicon.png`, `assets/android-icon-foreground.png`, `assets/android-icon-monochrome.png`.

## 9. Cosa NON è incluso in questo task

Per rispetto dei vincoli del task:

- Nessuna schermata applicativa (S01–S04) è stata disegnata o implementata.
- Nessuna decorazione aggiuntiva (icone tematiche per carburante/posizione, illustrazioni) è stata introdotta: non derivano da un design approvato.
- Nessun font custom è stato scelto o scaricato: resta un punto aperto (§5).
- Nessun tema scuro applicativo completo è stato definito in `tokens.js`: qui si documenta solo l'uso del simbolo su sfondo scuro, non un redesign dei token dell'app.

Dettagli su strumenti MCP usati, operazioni eseguite e limiti incontrati: vedi [`docs/motus/mcp-design-log.md`](./mcp-design-log.md).
