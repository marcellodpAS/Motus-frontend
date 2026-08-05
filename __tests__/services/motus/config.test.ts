import {
  apiConfig,
  getApiBaseUrl,
  platformSetupHint,
} from "@/services/motus/config";
import { ApiConfigError } from "@/services/motus/errors";

describe("getApiBaseUrl", () => {
  const originalUrl = process.env.EXPO_PUBLIC_API_URL;

  afterEach(() => {
    process.env.EXPO_PUBLIC_API_URL = originalUrl;
  });

  it("throws ApiConfigError when EXPO_PUBLIC_API_URL is unset", () => {
    delete process.env.EXPO_PUBLIC_API_URL;

    expect(() => getApiBaseUrl()).toThrow(ApiConfigError);
  });

  it("throws ApiConfigError when EXPO_PUBLIC_API_URL is blank", () => {
    process.env.EXPO_PUBLIC_API_URL = "   ";

    expect(() => getApiBaseUrl()).toThrow(ApiConfigError);
  });

  it("throws ApiConfigError when EXPO_PUBLIC_API_URL is not a valid URL", () => {
    process.env.EXPO_PUBLIC_API_URL = "not-a-url";

    expect(() => getApiBaseUrl()).toThrow(ApiConfigError);
  });

  it("throws ApiConfigError when the URL scheme is not http/https", () => {
    process.env.EXPO_PUBLIC_API_URL = "ftp://example.com";

    expect(() => getApiBaseUrl()).toThrow(ApiConfigError);
  });

  it("includes a platform-specific hint in the missing-config message", () => {
    delete process.env.EXPO_PUBLIC_API_URL;

    expect(() => getApiBaseUrl("android")).toThrow(/10\.0\.2\.2/);
  });

  it("returns the configured URL with trailing slashes stripped", () => {
    process.env.EXPO_PUBLIC_API_URL = "http://localhost:8080/";

    expect(getApiBaseUrl()).toBe("http://localhost:8080");
  });

  it("accepts https URLs", () => {
    process.env.EXPO_PUBLIC_API_URL = "https://motus.example.com";

    expect(getApiBaseUrl()).toBe("https://motus.example.com");
  });
});

describe("platformSetupHint", () => {
  it("mentions the emulator loopback address on android", () => {
    expect(platformSetupHint("android")).toContain("10.0.2.2");
  });

  it("mentions localhost on ios", () => {
    expect(platformSetupHint("ios")).toContain("localhost");
  });

  it("falls back to a generic hint on other platforms", () => {
    expect(platformSetupHint("web")).not.toContain("10.0.2.2");
  });
});

describe("apiConfig", () => {
  it("exposes a positive default timeout", () => {
    expect(apiConfig.timeoutMs).toBeGreaterThan(0);
  });
});
