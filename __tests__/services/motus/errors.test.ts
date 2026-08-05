import {
  ApiAbortError,
  ApiError,
  ApiHttpError,
  ApiNetworkError,
  ApiTimeoutError,
  isApiError,
  normalizeError,
} from "@/services/motus/errors";

describe("normalizeError", () => {
  it("passes through an existing ApiError unchanged", () => {
    const original = new ApiHttpError(404, "impianto non trovato");

    expect(normalizeError(original)).toBe(original);
  });

  it("maps a timed-out AbortError to ApiTimeoutError", () => {
    const abort = Object.assign(new Error("Aborted"), { name: "AbortError" });

    const result = normalizeError(abort, { timedOut: true, timeoutMs: 5000 });

    expect(result).toBeInstanceOf(ApiTimeoutError);
    expect((result as ApiTimeoutError).timeoutMs).toBe(5000);
  });

  it("maps a caller-triggered AbortError to ApiAbortError", () => {
    const abort = Object.assign(new Error("Aborted"), { name: "AbortError" });

    const result = normalizeError(abort, { timedOut: false });

    expect(result).toBeInstanceOf(ApiAbortError);
  });

  it("maps a network-level TypeError to ApiNetworkError", () => {
    const failure = new TypeError("Network request failed");

    const result = normalizeError(failure);

    expect(result).toBeInstanceOf(ApiNetworkError);
    expect(result.message).toBe("Network request failed");
    expect(result.cause).toBe(failure);
  });

  it("maps a non-Error throw to ApiNetworkError", () => {
    const result = normalizeError("boom");

    expect(result).toBeInstanceOf(ApiNetworkError);
  });
});

describe("isApiError", () => {
  it("identifies ApiError instances and their subclasses", () => {
    expect(isApiError(new ApiHttpError(500, "database non disponibile"))).toBe(
      true,
    );
    expect(isApiError(new Error("plain"))).toBe(false);
    expect(isApiError(new ApiError("network", "generic"))).toBe(true);
  });
});
