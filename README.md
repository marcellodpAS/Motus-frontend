# Motus

Base mobile cross-platform per iOS e Android costruita con Expo, React Native,
TypeScript, Expo Router, NativeWind e Zustand.

## Requisiti e installazione

- Expo SDK `54.0.36` (React Native `0.81.5`, React `19.1.0`)
- Node.js `22.13.x` (runtime fissato in `.nvmrc`; compatibile con Expo SDK 54)
- pnpm `9.7.1` (versione dichiarata in `package.json`)

Con Corepack:

```sh
corepack enable
corepack prepare pnpm@9.7.1 --activate
pnpm install
```

Avvio:

```sh
pnpm start
pnpm ios
pnpm android
pnpm web
```

Qualità:

```sh
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm validate
```

## Architettura

```text
src/
├── app/          # route e layout Expo Router
├── components/   # atoms, molecules, organisms, templates UI riutilizzabili
├── features/     # funzionalità verticali
├── hooks/        # hook condivisi
├── services/     # client API (src/services/motus)
├── stores/       # stato globale condiviso (Zustand)
├── theme/        # token semantici
├── types/
├── utils/
├── constants/
└── styles/       # entry point CSS globale
```

Le route in `src/app` compongono feature e template: non ospitano componenti UI
riutilizzabili. Gli atoms non dipendono dalle feature; le feature possono comporre
atoms, molecules e organisms. I componenti UI non accedono direttamente alle API.

`useAppStore` contiene soltanto un esempio di stato globale (`isAppReady`) per
verificare il setup; non introduce persistenza o middleware.

## Styling e token

NativeWind 4 usa Tailwind CSS 3 e Metro. Il CSS globale è
`src/styles/global.css`, importato una sola volta nel root layout. I componenti
usano `className` per gli stili statici, preferendo token semantici come
`bg-background`, `text-foreground` e `text-primary`.

`expo-system-ui` abilita `userInterfaceStyle: "automatic"` nel workflow CNG e
`expo-splash-screen` configura lo splash tramite plugin Expo. Lo status bar segue
il tema del sistema.

`src/theme/tokens.js` è la fonte di verità provvisoria: è consumata sia dai
moduli TypeScript in `src/theme` sia da `tailwind.config.js`. I token sono
tecnici temporanei, non il design finale. Per valori runtime (misure,
animazioni, coordinate o trasformazioni calcolate) usare `style` o `StyleSheet`,
senza costruire classi Tailwind dinamiche.

La configurazione non impedisce un futuro dark mode; la relativa strategia sarà
definita dopo l'analisi del design.

## Flusso Stitch

```text
Google Stitch via MCP
        ↓
analisi del design
        ↓
design token semantici
        ↓
tema Tailwind / NativeWind
        ↓
atoms → molecules → organisms → templates e routes
```

Nella fase di integrazione si analizzeranno progetto, design system e schermate
Stitch; i valori approvati sostituiranno i token in `src/theme/tokens.js`, da cui
verranno propagati al tema Tailwind e ai componenti composti.

## Client API

`src/services/motus` legge la base URL da `EXPO_PUBLIC_API_URL` (mai hardcodata
nei componenti) e centralizza parsing JSON, timeout, cancellazione via
`AbortSignal` e normalizzazione degli errori in una gerarchia tipizzata
(`ApiError`). Configurazione locale per simulatore iOS, emulatore Android e
dispositivo fisico: `docs/motus/local-setup.md`. Contratto verificato dal
vivo: `docs/motus/api-contract.md`.

## Nuove feature

Creare ogni feature in `src/features/<feature>`, mantenendo locale lo stato non
condiviso. Esporre UI riutilizzabile da `src/components` al livello Atomic Design
appropriato, registrare le route in `src/app` e aggiungere test osservabili in
`__tests__` o accanto alla feature quando crescerà.
