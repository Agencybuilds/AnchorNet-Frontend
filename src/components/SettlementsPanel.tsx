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
import { matchesQuery } from "@/lib/search";
import { useToast } from "@/hooks/useToast";
import { Card } from "./Card";
import { TableSkeleton } from "./TableSkeleton";
import { SettlementForm } from "./SettlementForm";
import { SettlementTable } from "./SettlementTable";
import { ConfirmDialog } from "./ConfirmDialog";

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
  const [pending, setPending] = useState(false);
  const [query, setQuery] = useState("");
  const [pendingCancelId, setPendingCancelId] = useState<number | null>(null);
  const { notify } = useToast();

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

  async function run(action: () => Promise<unknown>, successMessage: string) {
    try {
      await action();
      notify("success", successMessage);
      reload();
    } catch (err: unknown) {
      notify("error", err instanceof Error ? err.message : "Request failed");
    }
  }

  async function open(input: {
    anchor: string;
    asset: string;
    amount: number;
  }) {
    setPending(true);
    await run(
      () => openSettlement(input),
      `Opened a settlement for ${input.amount} ${input.asset}.`,
    );
    setPending(false);
  }

  const visibleSettlements =
    state.status === "ready"
      ? state.settlements.filter((s) =>
          matchesQuery([s.id, s.anchor, s.asset], query),
        )
      : [];

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-3 text-sm font-semibold text-zinc-200">
          Open settlement
        </h2>
        <SettlementForm onSubmit={open} pending={pending} />
      </Card>
      <Card>
        {state.status === "loading" ? (
          <TableSkeleton columns={6} />
        ) : state.status === "error" ? (
          <p className="text-sm text-red-400">{state.message}</p>
        ) : (
          <>
            {state.settlements.length > 0 ? (
              <div className="mb-3 flex justify-end">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search settlements…"
                  aria-label="Search settlements"
                  className="w-full max-w-48 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-100 outline-none focus:border-zinc-600"
                />
              </div>
            ) : null}
            {visibleSettlements.length === 0 && state.settlements.length > 0 ? (
              <p className="py-6 text-center text-sm text-zinc-500">
                No settlements match your search.
              </p>
            ) : (
              <SettlementTable
                settlements={visibleSettlements}
                onExecute={(id) =>
                  run(() => executeSettlement(id), `Executed settlement #${id}.`)
                }
                onCancel={setPendingCancelId}
              />
            )}
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
      <ConfirmDialog
        open={pendingCancelId !== null}
        title="Cancel settlement"
        message={`Cancel settlement #${pendingCancelId}? Reserved liquidity will be released.`}
        confirmLabel="Cancel settlement"
        cancelLabel="Keep settlement"
        onCancel={() => setPendingCancelId(null)}
        onConfirm={() => {
          const id = pendingCancelId;
          setPendingCancelId(null);
          if (id !== null) {
            run(() => cancelSettlement(id), `Cancelled settlement #${id}.`);
          }
        }}
      />
    </div>
  );
}
