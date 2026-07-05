"use client";

import { useCallback, useState } from "react";
import {
  fetchSettlements,
  openSettlement,
  executeSettlement,
  cancelSettlement,
} from "@/lib/settlementsApi";
import { useAsync } from "@/hooks/useAsync";
import { Card } from "./Card";
import { Spinner } from "./Spinner";
import { SettlementForm } from "./SettlementForm";
import { SettlementTable } from "./SettlementTable";

/** Client panel for opening and managing settlements. */
export function SettlementsPanel() {
  const load = useCallback(
    (signal: AbortSignal) => fetchSettlements({ signal }),
    [],
  );
  const { state, reload } = useAsync(load);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function run(action: () => Promise<unknown>) {
    setError(null);
    try {
      await action();
      reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Request failed");
    }
  }

  async function open(input: {
    anchor: string;
    asset: string;
    amount: number;
  }) {
    setPending(true);
    await run(() => openSettlement(input));
    setPending(false);
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-3 text-sm font-semibold text-zinc-200">
          Open settlement
        </h2>
        <SettlementForm onSubmit={open} pending={pending} />
        {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
      </Card>
      <Card>
        {state.status === "loading" ? (
          <Spinner label="Loading settlements…" />
        ) : state.status === "error" ? (
          <p className="text-sm text-red-400">{state.message}</p>
        ) : (
          <SettlementTable
            settlements={state.data.settlements}
            onExecute={(id) => run(() => executeSettlement(id))}
            onCancel={(id) => run(() => cancelSettlement(id))}
          />
        )}
      </Card>
    </div>
  );
}
