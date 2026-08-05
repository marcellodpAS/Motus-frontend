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

export type {
  GeocodingStatus,
  NearbyStation,
  Pagination,
  Price,
  PriceRow,
  Station,
  StationSummary,
} from "./types";

export * as stations from "./stations";
export * as prices from "./prices";

export { cheapestPrice, stationTitle } from "./stationDisplay";
export { formatDataComunicazione, parseDataComunicazione } from "./priceFormat";
