"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import { WalletAccount, mockAddress } from "@/lib/wallet";

export interface WalletContextValue {
  account: WalletAccount | null;
  connect: () => void;
  disconnect: () => void;
}

export const WalletContext = createContext<WalletContextValue | null>(null);

/** Provides a mock wallet connection to the component tree. */
export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<WalletAccount | null>(null);

  const connect = useCallback(
    () => setAccount({ address: mockAddress("anchornet-user") }),
    [],
  );
  const disconnect = useCallback(() => setAccount(null), []);

  const value = useMemo(
    () => ({ account, connect, disconnect }),
    [account, connect, disconnect],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}
