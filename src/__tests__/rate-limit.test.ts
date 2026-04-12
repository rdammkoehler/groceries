import { checkRateLimit, resetRateLimitState, MAX_REQUESTS } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    resetRateLimitState();
  });

  it("allows requests under the limit", () => {
    const result = checkRateLimit("192.168.1.1");

    expect(result.limited).toBe(false);
    expect(result.remaining).toBe(MAX_REQUESTS - 1);
  });

  it("decrements remaining with each request", () => {
    checkRateLimit("192.168.1.1");
    checkRateLimit("192.168.1.1");
    const result = checkRateLimit("192.168.1.1");

    expect(result.limited).toBe(false);
    expect(result.remaining).toBe(MAX_REQUESTS - 3);
  });

  it("blocks requests at the limit", () => {
    for (let requestIndex = 0; requestIndex < MAX_REQUESTS; requestIndex++) {
      checkRateLimit("192.168.1.1");
    }

    const result = checkRateLimit("192.168.1.1");

    expect(result.limited).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it("tracks different IPs independently", () => {
    for (let requestIndex = 0; requestIndex < MAX_REQUESTS; requestIndex++) {
      checkRateLimit("192.168.1.1");
    }

    const resultBlockedIp = checkRateLimit("192.168.1.1");
    const resultFreshIp = checkRateLimit("192.168.1.2");

    expect(resultBlockedIp.limited).toBe(true);
    expect(resultFreshIp.limited).toBe(false);
    expect(resultFreshIp.remaining).toBe(MAX_REQUESTS - 1);
  });

  it("resets after the time window passes", () => {
    const originalDateNow = Date.now;
    let currentTime = 1000000;
    Date.now = () => currentTime;

    try {
      for (let requestIndex = 0; requestIndex < MAX_REQUESTS; requestIndex++) {
        checkRateLimit("192.168.1.1");
      }

      expect(checkRateLimit("192.168.1.1").limited).toBe(true);

      // Advance past the 60-second window
      currentTime += 61_000;

      const result = checkRateLimit("192.168.1.1");
      expect(result.limited).toBe(false);
      expect(result.remaining).toBe(MAX_REQUESTS - 1);
    } finally {
      Date.now = originalDateNow;
    }
  });
});
