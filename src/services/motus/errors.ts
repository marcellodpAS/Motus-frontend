export type ApiErrorKind =
  "config" | "network" | "timeout" | "aborted" | "http" | "invalid-response";

export interface ApiErrorBody {
  error: string;
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly cause?: unknown;

  constructor(kind: ApiErrorKind, message: string, cause?: unknown) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.cause = cause;
  }
}

export class ApiConfigError extends ApiError {
  constructor(message: string) {
    super("config", message);
    this.name = "ApiConfigError";
  }
}

export class ApiNetworkError extends ApiError {
  constructor(message: string, cause?: unknown) {
    super("network", message, cause);
    this.name = "ApiNetworkError";
  }
}

export class ApiTimeoutError extends ApiError {
  readonly timeoutMs: number;

  constructor(timeoutMs: number) {
    super("timeout", `Richiesta interrotta per timeout dopo ${timeoutMs}ms.`);
    this.name = "ApiTimeoutError";
    this.timeoutMs = timeoutMs;
  }
}

export class ApiAbortError extends ApiError {
  constructor() {
    super("aborted", "Richiesta annullata.");
    this.name = "ApiAbortError";
  }
}

export class ApiHttpError extends ApiError {
  readonly status: number;
  readonly body?: ApiErrorBody;

  constructor(status: number, message: string, body?: ApiErrorBody) {
    super("http", message);
    this.name = "ApiHttpError";
    this.status = status;
    this.body = body;
  }
}

export class ApiInvalidResponseError extends ApiError {
  constructor(message: string, cause?: unknown) {
    super("invalid-response", message, cause);
    this.name = "ApiInvalidResponseError";
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}

export interface NormalizeErrorContext {
  timedOut?: boolean;
  timeoutMs?: number;
}

/**
 * Collapses everything a fetch call can throw (already-typed ApiError,
 * AbortError from either the internal timeout or a caller-supplied
 * AbortSignal, TypeError from a failed network fetch, or anything else) into
 * the ApiError taxonomy above.
 */
export function normalizeError(
  error: unknown,
  context: NormalizeErrorContext = {},
): ApiError {
  if (isApiError(error)) {
    return error;
  }

  if (error instanceof Error && error.name === "AbortError") {
    return context.timedOut
      ? new ApiTimeoutError(context.timeoutMs ?? 0)
      : new ApiAbortError();
  }

  if (error instanceof Error) {
    return new ApiNetworkError(error.message, error);
  }

  return new ApiNetworkError("Errore di rete sconosciuto.", error);
}
