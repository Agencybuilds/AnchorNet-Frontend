import { describe, it, expect, vi, afterEach } from "vitest";
import {
  fetchSettlements,
  openSettlement,
  executeSettlement,
  cancelSettlement,
} from "./settlementsApi";

function mockFetch(status: number, body: unknown) {
  const fn = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: "Mock",
    json: async () => body,
  });
  return fn;
}

function settlement(status = "pending") {
  return {
    id: 1,
    anchor: "a",
    asset: "USDC",
    amount: 100,
    fee: 1,
    status,
    createdAt: "",
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("settlementsApi", () => {
  it("fetches settlements and forwards the anchor filter", async () => {
    const fn = mockFetch(200, { settlements: [settlement()] });
    vi.stubGlobal("fetch", fn);

    const settlements = await fetchSettlements("a");
    expect(settlements).toHaveLength(1);
    expect(fn.mock.calls[0][0]).toContain("anchor=a");
  });

  it("opens a settlement", async () => {
    vi.stubGlobal("fetch", mockFetch(201, settlement()));
    const result = await openSettlement({
      anchor: "a",
      asset: "USDC",
      amount: 100,
    });
    expect(result.status).toBe("pending");
  });

  it("executes a settlement", async () => {
    vi.stubGlobal("fetch", mockFetch(200, settlement("executed")));
    const result = await executeSettlement(1);
    expect(result.status).toBe("executed");
  });

  it("cancels a settlement", async () => {
    vi.stubGlobal("fetch", mockFetch(200, settlement("cancelled")));
    const result = await cancelSettlement(1);
    expect(result.status).toBe("cancelled");
  });
});
