import { createApiClient } from "@/services/motus/client";
import {
  ApiAbortError,
  ApiConfigError,
  ApiHttpError,
  ApiInvalidResponseError,
  ApiNetworkError,
  ApiTimeoutError,
} from "@/services/motus/errors";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function htmlResponse(status: number, body: string): Response {
  return new Response(body, {
    status,
    headers: { "content-type": "text/html" },
  });
}

describe("ApiClient.get", () => {
  it("returns parsed JSON on 200", async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValue(jsonResponse(200, { status: "ok" }));
    const client = createApiClient({
      baseUrl: "http://localhost:8080",
      fetchImpl,
    });

    const result = await client.get<{ status: string }>("/health");

    expect(result).toEqual({ status: "ok" });
  });

  it("requests the joined base URL and path", async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValue(jsonResponse(200, { data: [] }));
    const client = createApiClient({
      baseUrl: "http://localhost:8080",
      fetchImpl,
    });

    await client.get("/api/stations");

    const [url] = fetchImpl.mock.calls[0] as [string];
    expect(url).toBe("http://localhost:8080/api/stations");
  });

  it("appends query params, skipping undefined values", async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValue(jsonResponse(200, { data: [] }));
    const client = createApiClient({
      baseUrl: "http://localhost:8080",
      fetchImpl,
    });

    await client.get("/api/stations", {
      query: { comune: "Roma", limit: 50, provincia: undefined },
    });

    const [url] = fetchImpl.mock.calls[0] as [string];
    const parsed = new URL(url);
    expect(parsed.searchParams.get("comune")).toBe("Roma");
    expect(parsed.searchParams.get("limit")).toBe("50");
    expect(parsed.searchParams.has("provincia")).toBe(false);
  });

  it("throws ApiConfigError when no base URL is configured", async () => {
    const originalUrl = process.env.EXPO_PUBLIC_API_URL;
    delete process.env.EXPO_PUBLIC_API_URL;

    const fetchImpl = jest.fn();
    const client = createApiClient({ fetchImpl });

    await expect(client.get("/health")).rejects.toThrow(ApiConfigError);
    expect(fetchImpl).not.toHaveBeenCalled();

    process.env.EXPO_PUBLIC_API_URL = originalUrl;
  });

  it("throws ApiHttpError with the server message on a JSON error body", async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValue(jsonResponse(404, { error: "impianto non trovato" }));
    const client = createApiClient({
      baseUrl: "http://localhost:8080",
      fetchImpl,
    });

    await expect(client.get("/api/stations/999999999")).rejects.toMatchObject({
      status: 404,
      message: "impianto non trovato",
    });
  });

  it("throws ApiHttpError with a generic message on a non-JSON error body", async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValue(htmlResponse(501, "<html>Unsupported method</html>"));
    const client = createApiClient({
      baseUrl: "http://localhost:8080",
      fetchImpl,
    });

    const error = await client.get("/api/stations").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiHttpError);
    expect((error as ApiHttpError).status).toBe(501);
  });

  it("throws ApiInvalidResponseError when a 200 body is not valid JSON", async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      new Response("not json", {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    const client = createApiClient({
      baseUrl: "http://localhost:8080",
      fetchImpl,
    });

    await expect(client.get("/health")).rejects.toThrow(
      ApiInvalidResponseError,
    );
  });

  it("throws ApiNetworkError when fetch itself fails", async () => {
    const fetchImpl = jest
      .fn()
      .mockRejectedValue(new TypeError("Network request failed"));
    const client = createApiClient({
      baseUrl: "http://localhost:8080",
      fetchImpl,
    });

    await expect(client.get("/health")).rejects.toThrow(ApiNetworkError);
  });

  it("throws ApiTimeoutError when the request exceeds timeoutMs", async () => {
    jest.useFakeTimers();

    const fetchImpl = jest
      .fn()
      .mockImplementation((_url: string, init?: RequestInit) => {
        return new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(Object.assign(new Error("Aborted"), { name: "AbortError" }));
          });
        });
      });
    const client = createApiClient({
      baseUrl: "http://localhost:8080",
      fetchImpl,
      timeoutMs: 1000,
    });

    const pending = client.get("/health");
    const assertion = expect(pending).rejects.toThrow(ApiTimeoutError);
    await jest.advanceTimersByTimeAsync(1000);
    await assertion;

    jest.useRealTimers();
  });

  it("throws ApiAbortError when the caller cancels via AbortSignal", async () => {
    const controller = new AbortController();
    const fetchImpl = jest
      .fn()
      .mockImplementation((_url: string, init?: RequestInit) => {
        return new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(Object.assign(new Error("Aborted"), { name: "AbortError" }));
          });
        });
      });
    const client = createApiClient({
      baseUrl: "http://localhost:8080",
      fetchImpl,
    });

    const pending = client.get("/health", { signal: controller.signal });
    const assertion = expect(pending).rejects.toThrow(ApiAbortError);
    controller.abort();
    await assertion;
  });
});
