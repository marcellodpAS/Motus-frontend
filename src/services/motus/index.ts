export { ApiClient, apiClient, createApiClient } from "./client";
export type { ApiClientOptions, QueryParams, RequestOptions } from "./client";

export { getApiBaseUrl, apiConfig, platformSetupHint } from "./config";

export {
  ApiError,
  ApiAbortError,
  ApiConfigError,
  ApiHttpError,
  ApiInvalidResponseError,
  ApiNetworkError,
  ApiTimeoutError,
  isApiError,
  normalizeError,
} from "./errors";
export type {
  ApiErrorBody,
  ApiErrorKind,
  NormalizeErrorContext,
} from "./errors";

export type { GeocodingStatus, Pagination, Price, Station } from "./types";

export * as stations from "./stations";

export { stationTitle } from "./stationDisplay";
