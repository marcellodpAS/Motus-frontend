# Motus — Configurazione locale del client API

Deliverable del Task 7 (`src/services/motus`). Spiega come impostare `EXPO_PUBLIC_API_URL` per sviluppare contro un'istanza locale del backend Motus (`docker compose up`, vedi `docs/motus/api-contract.md`).

## 1. Impostare `EXPO_PUBLIC_API_URL`

Copia `.env.example` in `.env` (non tracciato — vedi `.gitignore`) e imposta l'URL in base a dove gira l'app:

| Ambiente | Valore | Perché |
| --- | --- | --- |
| iOS Simulator | `http://localhost:8080` | Il simulatore condivide la rete/host del Mac |
| Web (`expo start --web`) | `http://localhost:8080` | Stesso browser/host della macchina di sviluppo |
| Android Emulator | `http://10.0.2.2:8080` | `localhost` nell'emulatore punta all'emulatore stesso, non all'host — `10.0.2.2` è l'alias che Android riserva per l'host |
| Dispositivo fisico (iOS o Android) | `http://<ip-lan-del-pc>:8080` | Il dispositivo è su una rete separata dal processo Metro; serve l'IP LAN reale della macchina di sviluppo (es. `192.168.1.42`), mai `localhost` |

Il backend deve restare raggiungibile sulla porta usata (default `8080` in questi esempi, coerente con la sessione di verifica di `api-contract.md`).

Se `EXPO_PUBLIC_API_URL` non è impostato o non è un URL `http(s)` valido, `getApiBaseUrl()` (`src/services/motus/config.ts`) lancia un `ApiConfigError` con un suggerimento specifico per la piattaforma corrente (`Platform.OS`) — l'errore emerge alla prima chiamata di rete, non silenziosamente.

## 2. Test automatici

I test non richiedono `EXPO_PUBLIC_API_URL` configurato:

- `ApiClient` accetta un `baseUrl` esplicito nel costruttore (`createApiClient({ baseUrl, fetchImpl })`), che scavalca la lettura dell'env var — usato da `__tests__/services/motus/client.test.ts`.
- `ApiClient` accetta anche un `fetchImpl` iniettato, così nessun test tocca la rete reale o il `fetch` globale per il client generico.
- I moduli per risorsa (es. `stations.ts`) usano l'istanza condivisa `apiClient` e vengono testati mockando `global.fetch` (`jest.fn()`), coerente con `docs/motus/testing-strategy.md` §2 — impostano `process.env.EXPO_PUBLIC_API_URL` solo nel proprio `beforeEach`/`afterEach`, senza effetti collaterali sugli altri test.

Nessun test automatico esegue chiamate di rete reali (`docs/motus/testing-strategy.md`).

## 3. Cosa è già implementato

Coerente con i vincoli del Task 7: solo il client generico (`client.ts`, `config.ts`, `errors.ts`, `types.ts`, `index.ts`) più l'unico endpoint necessario alla prima vertical slice (`stations.search`, `GET /api/stations` — `docs/motus/implementation-plan.md`, Fase 1). `getById`, `nearby` e `prices.search` vengono aggiunti quando la rispettiva vertical slice viene implementata (`docs/motus/architecture.md` §5).

## 4. Errori gestiti dal client

`src/services/motus/errors.ts` normalizza tutto ciò che una chiamata può produrre in un'unica gerarchia (`ApiError`), senza generare testo per la UI (quella è responsabilità della feature che consuma il client):

| Errore | Quando |
| --- | --- |
| `ApiConfigError` | `EXPO_PUBLIC_API_URL` mancante o non valido |
| `ApiNetworkError` | `fetch` fallisce (offline, DNS, host irraggiungibile) |
| `ApiTimeoutError` | Nessuna risposta entro `timeoutMs` (default 10s, `apiConfig.timeoutMs`) |
| `ApiAbortError` | Richiesta annullata dal chiamante tramite `AbortSignal` |
| `ApiHttpError` | Risposta HTTP non-2xx (`status`, più `body.error` quando il server risponde `{"error": string}`) |
| `ApiInvalidResponseError` | Corpo della risposta non è JSON valido |
