import { apiConfig, getApiBaseUrl } from "./config";
import {
  ApiHttpError,
  ApiInvalidResponseError,
  normalizeError,
  type ApiErrorBody,
} from "./errors";

export type QueryParams = Record<string, string | number | boolean | undefined>;

export interface RequestOptions {
  query?: QueryParams;
  signal?: AbortSignal;
  timeoutMs?: number;
}

export interface ApiClientOptions {
  /** Overrides EXPO_PUBLIC_API_URL — mainly for tests and alternate environments. */
  baseUrl?: string;
  timeoutMs?: number;
  /** Overrides global fetch — makes the client replaceable/mockable without touching globals. */
  fetchImpl?: typeof fetch;
}

function buildUrl(baseUrl: string, path: string, query?: QueryParams): string {
  const normalizedBase = `${baseUrl.replace(/\/+$/, "")}/`;
  const normalizedPath = path.replace(/^\/+/, "");
  const url = new URL(normalizedPath, normalizedBase);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue;
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as { error: unknown }).error === "string"
  );
}

async function parseJsonBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text.length === 0) return undefined;

  try {
    return JSON.parse(text);
  } catch (cause) {
    throw new ApiInvalidResponseError(
      "La risposta del server non è JSON valido.",
      cause,
    );
  }
}

/**
 * Generic HTTP client for the Motus read-only API. Knows nothing about
 * specific resources — per-resource modules (e.g. stations.ts) call
 * `get<T>()` and own their own types/query shapes.
 */
export class ApiClient {
  private readonly baseUrl?: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl;
    this.timeoutMs = options.timeoutMs ?? apiConfig.timeoutMs;
    // Resolved lazily (not `options.fetchImpl ?? fetch`): capturing the global
    // `fetch` value here would freeze it at construction time, so a caller
    // (or a test) that swaps `global.fetch` afterwards would be ignored.
    this.fetchImpl = options.fetchImpl ?? ((input, init) => fetch(input, init));
  }

  async get<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const baseUrl = this.baseUrl ?? getApiBaseUrl();
    const url = buildUrl(baseUrl, path, options.query);
    const timeoutMs = options.timeoutMs ?? this.timeoutMs;

    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    const externalSignal = options.signal;
    const onExternalAbort = () => controller.abort();
    externalSignal?.addEventListener("abort", onExternalAbort);

    try {
      const response = await this.fetchImpl(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });

      return await this.parseResponse<T>(response);
    } catch (error) {
      throw normalizeError(error, { timedOut, timeoutMs });
    } finally {
      clearTimeout(timer);
      externalSignal?.removeEventListener("abort", onExternalAbort);
    }
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const contentType = response.headers.get("content-type") ?? "";
      const genericMessage = `Richiesta fallita con stato ${response.status}.`;

      if (contentType.includes("application/json")) {
        const body = await parseJsonBody(response);
        if (isApiErrorBody(body)) {
          throw new ApiHttpError(response.status, body.error, body);
        }
      }

      throw new ApiHttpError(response.status, genericMessage);
    }

    const body = await parseJsonBody(response);
    return body as T;
  }
}

export function createApiClient(options?: ApiClientOptions): ApiClient {
  return new ApiClient(options);
}

/** Default shared instance; construct a separate ApiClient for tests or alternate configs. */
export const apiClient: ApiClient = createApiClient();
