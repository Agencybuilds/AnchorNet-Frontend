"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchSettlements,
  openSettlement,
  executeSettlement,
  cancelSettlement,
} from "@/lib/settlementsApi";
import { Settlement, Pagination } from "@/lib/types";
import { pluralize } from "@/lib/format";
import { Card } from "./Card";
import { Spinner } from "./Spinner";
import { SettlementForm } from "./SettlementForm";
import { SettlementTable } from "./SettlementTable";

/** Settlements fetched per page. */
const PAGE_SIZE = 10;

type ListState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; settlements: Settlement[]; pagination: Pagination };

/** Client panel for opening and managing settlements. */
export function SettlementsPanel() {
  const [state, setState] = useState<ListState>({ status: "loading" });
  const [nonce, setNonce] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const reload = useCallback(() => {
    setState({ status: "loading" });
    setNonce((n) => n + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchSettlements({ page: 1, pageSize: PAGE_SIZE, signal: controller.signal })
      .then(({ settlements, pagination }) =>
        setState({ status: "ready", settlements, pagination }),
      )
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Request failed",
        });
      });
    return () => controller.abort();
  }, [nonce]);

  async function loadMore() {
    if (state.status !== "ready") return;
    setLoadingMore(true);
    setMoreError(null);
    try {
      const next = await fetchSettlements({
        page: state.pagination.page + 1,
        pageSize: PAGE_SIZE,
      });
      setState((prev) =>
        prev.status === "ready"
          ? {
              status: "ready",
              settlements: [...prev.settlements, ...next.settlements],
              pagination: next.pagination,
            }
          : prev,
      );
    } catch (err: unknown) {
      setMoreError(
        err instanceof Error ? err.message : "Failed to load more settlements",
      );
    } finally {
      setLoadingMore(false);
    }
  }

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
          <>
            <SettlementTable
              settlements={state.settlements}
              onExecute={(id) => run(() => executeSettlement(id))}
              onCancel={(id) => run(() => cancelSettlement(id))}
            />
            {state.pagination.page < state.pagination.totalPages ? (
              <div className="mt-4 flex flex-col items-center gap-2">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-700 disabled:opacity-50"
                >
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
                {moreError ? (
                  <p className="text-xs text-red-400">{moreError}</p>
                ) : null}
              </div>
            ) : state.settlements.length > 0 ? (
              <p className="mt-4 text-center text-xs text-zinc-500">
                Showing all {pluralize(state.pagination.total, "settlement")}
              </p>
            ) : null}
          </>
        )}
      </Card>
    </div>
  );
}
