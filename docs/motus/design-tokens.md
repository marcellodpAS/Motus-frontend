# Motus — Design token e tema NativeWind (Task 10)

Legenda: 🟢 Dato reale verificato in questa sessione — 🟡 Assunzione/interpretazione — 🔴 Aperto/da decidere.

## 1. Fonte di verità

🟢 **Unica fonte**: [`src/theme/tokens.ts`](../../src/theme/tokens.ts). Ogni valore (colore, dimensione, peso) esiste in questo file **una sola volta**; nessun altro file lo ridigita.

Tre consumatori, tutti a valle dello stesso file:

| Consumatore            | Come                                                                    | File                                                                                      |
| ---------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| TypeScript             | `import { colors, spacing, ... } from "@/theme"`                        | [`src/theme/index.ts`](../../src/theme/index.ts) re-esporta `tokens.ts`                   |
| Tailwind/NativeWind    | `require("./src/theme/tokens")`                                         | [`tailwind.config.js`](../../tailwind.config.js)                                          |
| Adapter di piattaforma | `density` (dati puri) e `getShadowStyle()` (helper `Platform.OS`-aware) | [`src/theme/shadowStyle.ts`](../../src/theme/shadowStyle.ts), consumato da `src/platform` |

🟢 **Verificato in questa sessione, non assunto**: `tailwind.config.js` è un file `.js` semplice, ma Tailwind (v3.4) carica **ogni** file di config tramite `jiti` (`tailwindcss/lib/lib/load-config.js`), che intercetta anche i `require()` annidati fatti _dentro_ quel file — quindi `require("./src/theme/tokens")` risolve correttamente `tokens.ts` (TypeScript), senza bisogno di compilarlo prima o di duplicarlo in un file `.js` parallelo. Confermato eseguendo `loadConfig()` direttamente su `tailwind.config.js` reale del progetto e ispezionando `theme.extend` risultante (colori, spacing, fontSize, fontWeight, borderRadius, borderWidth, boxShadow, width/height, minWidth/minHeight tutti presenti e corretti).

`tokens.ts` non importa `react-native`: viene eseguito da Node/jiti fuori da qualunque runtime RN (durante il caricamento della config Tailwind), quindi deve restare puramente dati. La sola logica che dipende da `Platform.OS` (`getShadowStyle`) vive in un file separato, importato solo da codice app/test, mai da `tailwind.config.js`.

### Debito risolto

`docs/motus/architecture.md` §4 segnalava una duplicazione: `tokens.js` (runtime) e `tokens.d.ts` (dichiarazione manuale, stessi valori ridigitati come literal type). Un unico modulo `.ts` nativo tipizzato elimina il problema alla radice — non esiste più un secondo file da tenere sincronizzato a mano.

## 2. Categorie di token

Tutte definite in `tokens.ts`, con la motivazione dei valori scelti nei commenti del file stesso (non ripetuta qui).

| Categoria                        | Export                                                                    | Note                                                                                                                                                              |
| -------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Colore                           | `colors`                                                                  | Solo nomi semantici (vedi §3) — nessun valore hex esposto altrove                                                                                                 |
| Font size / weight / line height | `fontSize`, `fontWeight`, `lineHeight`                                    | Scale indipendenti, componibili singolarmente (es. `font-semibold` da solo)                                                                                       |
| Tipografia composita             | `typography`                                                              | Tuple `[fontSize, {lineHeight, fontWeight}]` per Tailwind — `body`/`title` invariati rispetto ai token provvisori precedenti                                      |
| Spacing                          | `spacing`                                                                 | Invariato rispetto ai token provvisori precedenti                                                                                                                 |
| Radius                           | `radius`                                                                  | —                                                                                                                                                                 |
| Border                           | `colors.border`/`colors.borderFocused` (tinta) + `borderWidth` (spessore) | Due dimensioni distinte dello stesso concetto                                                                                                                     |
| Shadow / elevation               | `shadow` + `getShadowStyle()`                                             | Vedi §4                                                                                                                                                           |
| Icon size                        | `iconSize`                                                                | Numeri unitless, per prop `style`/futuro componente `Icon`                                                                                                        |
| Touch target                     | `touchTarget`                                                             | `comfortable` (48, copre sia iOS HIG 44pt che Material 48dp) e `automotive` (64, 🟡 assunzione — nessuna cifra ufficiale reperita in `automotive-feasibility.md`) |
| Density                          | `density`                                                                 | Vedi §5                                                                                                                                                           |

🔴 **Non definiti — omissioni deliberate, non dimenticanze:**

- **`fontFamily`**: `assets/fonts/` è vuota, nessun typeface scelto (`brand-guidelines.md` §5). `Text` in RN richiede un nome di font nativo singolo, non uno stack CSS — inventarne uno sarebbe scorretto a runtime, non solo provvisorio.
- **Motion token**: nessun requisito di animazione in `product-requirements.md`/`architecture.md`; il brief del task stesso li richiede "solo se necessari".

## 3. Nomi semantici e stati

`colors` espone solo ruoli semantici, mai la palette primitiva (`palette`, interna a `tokens.ts`, non esportata verso Tailwind): un cambio di palette futuro (es. dark mode, §6) non richiede toccare alcun componente.

Copertura degli stati richiesti:

| Stato                     | Token                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| default                   | `primary`, `secondary`, `danger`, `warning`, `success`, ... (valore base del ruolo)              |
| pressed                   | `primaryPressed`, `dangerPressed`                                                                |
| focused                   | `borderFocused`                                                                                  |
| selected                  | `selected`, `onSelected`                                                                         |
| disabled                  | `disabled`, `onDisabled`, `primaryDisabled`                                                      |
| loading                   | `loading` (fill per skeleton/placeholder)                                                        |
| success / warning / error | `success`, `warning`, `danger` — "error" è lo stesso intento di `danger`, un solo token, non due |

`danger`/`warning`/`success` non hanno un valore approvato dal brand (`brand-guidelines.md` §4, 🔴 aperto): i valori attuali sono gli swatch standard Tailwind red-600/amber-500/green-600 (contrasto verificabile), nello stesso spirito con cui `primary`/`foreground`/`background` già preesistenti coincidevano con la scala Tailwind blue/slate.

## 4. Shadow vs. elevation

React Native non ha un'API shadow cross-platform unica: iOS legge `shadowColor`/`shadowOffset`/`shadowOpacity`/`shadowRadius`, Android legge `elevation` (numero). Le classi NativeWind `shadow-*` (generate da `boxShadow` in `tailwind.config.js`) traducono solo `shadowColor`+`shadowRadius` — **mai** `elevation` — perché `react-native-css-interop` (`parseBoxShadow`) non lo implementa: verificato leggendo `node_modules/react-native-css-interop/dist/css-to-rn/parseDeclaration.js` in questa sessione, non assunto dalla documentazione NativeWind.

Conseguenza pratica: una `className="shadow-md"` da sola **non produce alcun effetto visibile su Android**. `getShadowStyle(level, os?)` in `shadowStyle.ts` è la mappatura completa e corretta (branch `ios`/`android` su `Platform.OS`, con parametro esplicito per i test) — i componenti che hanno bisogno di un'ombra visibile su entrambe le piattaforme devono usare l'helper, non solo la className.

## 5. Density (mobile / automotive)

`density.comfortable` e `density.automotive` sono **bundle di riferimenti** a `touchTarget`/`iconSize`/`spacing` già definiti sopra — nessun nuovo valore numerico viene introdotto in `density` stesso, quindi non può mai divergere dalle scale che nomina.

Manca deliberatamente un profilo `compact`: `ComponentDensity` (`src/platform/types.ts`) include quel valore, ma `docs/motus/platform-capabilities.md` §4 documenta che **non viene mai risolto** — nessuna soglia di design esiste per i telefoni, e introdurne una qui sarebbe esattamente l'euristica non documentata che il Task 8 ha già escluso. `density` in `tokens.ts` copre solo le due chiavi che il brief di questo task chiede esplicitamente ("density mobile", "density automotive").

Direzione delle dipendenze: `tokens.ts` **non** importa `ComponentDensity` da `src/platform/types.ts` — il layer token resta la base indipendente; è l'adapter di piattaforma (consumatore, non fonte) a scegliere quale chiave `density` usare in base al proprio `ComponentDensity` risolto.

## 6. Dark mode — preparazione, non implementazione

`colors` è costruito da `buildSemanticColors(palette)`, una funzione pura (non inline): aggiungere un tema scuro in futuro significa scrivere una seconda `palette` scura e chiamare `buildSemanticColors(darkPalette)`, non riscrivere la mappa semantica.

🟡 Nessuno store globale (Zustand o altro) è stato introdotto, né va introdotto solo per questo: NativeWind legge già lo schema colore del sistema operativo tramite `useColorScheme()` di React Native (RN espone `Appearance`/`useColorScheme` nativamente; `expo-system-ui` è già configurato con `userInterfaceStyle: "automatic"` in `app.json`, verificato in `architecture.md` §4). Quando il tema scuro sarà richiesto da un requisito di prodotto reale (oggi assente, `product-requirements.md`), il meccanismo di attivazione è quello nativo di NativeWind (variabili CSS / `dark:` variant), non uno store applicativo.

## 7. Vincoli rispettati

- **Nessuna duplicazione manuale**: un solo file (`tokens.ts`) contiene i valori letterali; `tailwind.config.js`, `theme/index.ts` e `shadowStyle.ts` li referenziano, non li ridigitano. `density`/`typography` compongono altri token per riferimento, non per copia.
- **Nessun colore specifico come unica API pubblica**: `palette` (valori hex) è interna a `tokens.ts` e non è esposta a `tailwind.config.js` — solo `colors` (nomi semantici) entra in `theme.extend`.
- **Nessun componente complesso**: nessun componente `Icon`/`Button`/tema-provider è stato aggiunto in questo task, solo dati tipizzati e un helper puro (`getShadowStyle`).
