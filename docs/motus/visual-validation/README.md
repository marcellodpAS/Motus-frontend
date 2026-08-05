# Motus — Verifica visiva (Task 19, Fase 5)

## Esito: verifica visiva NON eseguibile in questo ambiente

Come richiesto esplicitamente dal task in questa eventualità, nessuna
schermata di questo lavoro viene classificata `complete-and-verified`. Lo
stato corretto per ogni schermata elencata sotto è **`implemented-but-
runtime-unverified`**.

## Cosa è stato verificato realmente in questa sessione

✅ **Verificato dal vivo, non dedotto**:

| Verifica               | Comando                                            | Esito                                                                                                                                                                                                                                                                                |
| ---------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tooling iOS            | `xcrun simctl list devices`                        | `error: unable to find utility "simctl", not a developer tool or in PATH` — nessun simulatore iOS disponibile                                                                                                                                                                        |
| Tooling Android        | `which emulator adb`, `$ANDROID_HOME`              | Nessun binario trovato, variabile d'ambiente vuota — nessun emulatore/SDK Android disponibile                                                                                                                                                                                        |
| Dispositivo fisico     | —                                                  | Nessun dispositivo collegato a questa sessione (ambiente CLI headless, non ha accesso hardware)                                                                                                                                                                                      |
| Build reale del bundle | `npx expo export --platform web`                   | ✅ **Successo**: bundle Metro completo (879 moduli), zero errori, tutte le route incluse (`(tabs)`, `stations`, `stations/[id]`, `stations/[id]/report`, `prices`, `nearby`), tutti gli asset dei font icona (`MaterialIcons`, `MaterialCommunityIcons`, ecc.) risolti correttamente |
| Test automatici        | `pnpm validate` (lint + format + typecheck + test) | ✅ 60 suite, 296 test, tutti verdi                                                                                                                                                                                                                                                   |

Questo è lo stesso limite ambientale già documentato nelle sessioni
precedenti (`docs/motus/release-report.md`, sezioni "Stato iOS"/"Stato
Android"): **nessuna sessione di questo repository ha mai potuto avviare
l'app su un simulatore/emulatore/dispositivo reale**. Non è un limite
introdotto in questo task, né aggirabile con gli strumenti disponibili qui
(nessun MCP di automazione browser, nessun tool di screenshot).

## Perché il bundle web è comunque un segnale utile (non un sostituto)

L'export web (`expo export --platform web`) esegue lo stesso bundler
Metro/Babel/TypeScript userebbe per iOS/Android, sulle stesse route e con
le stesse dipendenze native aggiunte in questo task
(`@expo/vector-icons`, `react-native-svg`, `@react-native-async-storage/
async-storage`). Un bundle riuscito senza errori significa:

- nessun errore di import/risoluzione modulo su nessuna delle nuove route o nuovi componenti;
- nessun font/icona mancante nel set `MaterialIcons` usato da `Icon.tsx` (i nomi dei glyph sono stati verificati uno per uno contro la glyph map installata prima di scriverli, non indovinati — vedi commit history);
- nessun errore di sintassi/tipo che il solo `tsc --noEmit` potrebbe non catturare (es. errori runtime di risoluzione moduli Metro).

**Non dimostra** però l'aspetto visivo reale (layout, colori, spaziature
effettivamente renderizzati, comportamento touch) — solo che l'app _può
avviarsi_ senza crash strutturali. Questo è il motivo per cui nessuna
schermata è classificata `complete-and-verified` nonostante questo esito
positivo.

## Come completare questa fase quando l'ambiente lo permette

1. Aprire il progetto su una macchina con Xcode (simulatore iOS) o Android
   Studio (emulatore) installato, oppure scansionare il QR code di
   `expo start` con Expo Go su un dispositivo fisico.
2. Per ciascuna delle schermate elencate sotto: aprirla nell'app,
   acquisire uno screenshot, confrontarlo pixel per pixel con lo
   screenshot Stitch corrispondente (`assets/stitch_motus/*/screen.png`,
   già estratto in questa sessione), correggere le differenze (struttura,
   proporzioni, colori, tipografia, spaziature, bordi, icone, gerarchia,
   stati, interazioni) e salvare lo screenshot risultante in questa
   cartella con lo stesso nome della riga sottostante.
3. Solo a quel punto, promuovere la riga da `implemented-but-runtime-
unverified` a `complete-and-verified` in `mobile-completion-matrix.md`
   e in questo documento.

## Stato per schermata

| Schermata                     | Riferimento Stitch                                                         | Implementazione                                         | Test                                     | Stato                                                                                                                                                     |
| ----------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Map (tab, home)               | `cf26daff4b3e45a9bb74e23565803016` (Mappa Motus)                           | `src/features/map/MapScreen.tsx`                        | `MapScreen.test.tsx` (4 test)            | `implemented-but-runtime-unverified`                                                                                                                      |
| Dettaglio impianto            | `d3b33d58ae3045d081ea8beba603ba0b` (Dettaglio Stazione)                    | `src/features/station-detail/StationDetailScreen.tsx`   | `StationDetailScreen.test.tsx` (9 test)  | `implemented-but-runtime-unverified`                                                                                                                      |
| Segnala Prezzo                | `e0cd4605476d4da8b000e7366d0aff69`                                         | `src/features/report-price/ReportPriceScreen.tsx`       | `ReportPriceScreen.test.tsx` (4 test)    | `implemented-but-runtime-unverified`                                                                                                                      |
| Pro (tab)                     | `0acf7ae776d74a5ba6763b0dd3a20fd2` (Previsioni Pro)                        | `src/features/pro-predictions/ProPredictionsScreen.tsx` | `ProPredictionsScreen.test.tsx` (2 test) | `implemented-but-runtime-unverified` — contenuto intenzionalmente diverso da Stitch (stato "non disponibile", vedi `stitch-implementation-gap.md` riga 8) |
| Favorites (tab)               | Nessuno screen Stitch dedicato (solo bottone "Save" in Dettaglio Stazione) | `src/features/favorites/FavoritesScreen.tsx`            | `FavoritesScreen.test.tsx` (2 test)      | `implemented-but-runtime-unverified` — nessun riferimento Stitch da confrontare                                                                           |
| Profile (tab)                 | Nessuno screen Stitch dedicato (solo icona profilo negli header)           | `src/features/profile/ProfileScreen.tsx`                | `ProfileScreen.test.tsx` (1 test)        | `implemented-but-runtime-unverified` — nessun riferimento Stitch da confrontare                                                                           |
| Ricerca impianti (S01)        | Nessuno screen Stitch dedicato                                             | `src/features/stations-search/StationsSearchScreen.tsx` | `StationsSearchScreen.test.tsx`          | `implemented-but-runtime-unverified`                                                                                                                      |
| Ricerca prezzi (S02)          | Nessuno screen Stitch dedicato                                             | `src/features/prices-search/PricesSearchScreen.tsx`     | `PricesSearchScreen.test.tsx`            | `implemented-but-runtime-unverified`                                                                                                                      |
| Impianti vicini — lista (S04) | Sovrapposto parzialmente alla bottom sheet di Mappa Motus                  | `src/features/nearby-stations/NearbyStationsScreen.tsx` | `NearbyStationsScreen.test.tsx`          | `implemented-but-runtime-unverified`                                                                                                                      |

Nessuna riga è, né può essere in questo ambiente, `complete-and-verified`.
