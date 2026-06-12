/**
 * Presentation helpers for formatting amounts and labels.
 */

/** Formats an integer amount with thousands separators (e.g. 1234567 -> "1,234,567"). */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
    amount,
  );
}

/** Formats a count with a pluralized noun (e.g. (1, "anchor") -> "1 anchor"). */
export function pluralize(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

/** Renders a fee in basis points from a fee/amount pair (e.g. 1/1000 -> "10 bps"). */
export function feeInBps(fee: number, amount: number): string {
  if (amount <= 0) return "0 bps";
  return `${Math.round((fee / amount) * 10_000)} bps`;
}
