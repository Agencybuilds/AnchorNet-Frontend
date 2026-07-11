/**
 * Wallet helpers for the demo connect flow.
 *
 * This is a stand-in for a real Stellar wallet integration (e.g. Freighter):
 * it models a connected account and address formatting without signing.
 */

export interface WalletAccount {
  /** Stellar public key (G... address). */
  address: string;
}

/** localStorage key the connected account is persisted under. */
const STORAGE_KEY = "anchornet:wallet";

/** Persists the connected wallet account so it survives a page refresh. */
export function saveAccount(account: WalletAccount): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
}

/** Reads a previously persisted wallet account, if any and well-formed. */
export function loadAccount(): WalletAccount | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<WalletAccount>;
    if (typeof parsed.address !== "string") return null;
    return { address: parsed.address };
  } catch {
    return null;
  }
}

/** Clears any persisted wallet account. */
export function clearAccount(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

/** Shortens an address for display, e.g. "GABC…WXYZ". */
export function truncateAddress(address: string, visible = 4): string {
  if (address.length <= visible * 2 + 1) return address;
  return `${address.slice(0, visible)}…${address.slice(-visible)}`;
}

/** Produces a deterministic mock Stellar address from a seed. */
export function mockAddress(seed = "ANCHORNET"): string {
  const body = seed
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .padEnd(55, "X")
    .slice(0, 55);
  return `G${body}`;
}
