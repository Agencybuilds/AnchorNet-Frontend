import { describe, it, expect } from "vitest";
import { formatAmount, pluralize, feeInBps } from "./format";

describe("formatAmount", () => {
  it("adds thousands separators", () => {
    expect(formatAmount(1234567)).toBe("1,234,567");
  });

  it("drops fractional digits", () => {
    expect(formatAmount(1000.6)).toBe("1,001");
  });
});

describe("pluralize", () => {
  it("keeps the noun singular for a count of one", () => {
    expect(pluralize(1, "anchor")).toBe("1 anchor");
  });

  it("pluralizes other counts", () => {
    expect(pluralize(0, "anchor")).toBe("0 anchors");
    expect(pluralize(3, "anchor")).toBe("3 anchors");
  });
});

describe("feeInBps", () => {
  it("derives basis points from a fee/amount pair", () => {
    expect(feeInBps(1, 1000)).toBe("10 bps");
  });

  it("guards against a zero amount", () => {
    expect(feeInBps(0, 0)).toBe("0 bps");
  });
});
