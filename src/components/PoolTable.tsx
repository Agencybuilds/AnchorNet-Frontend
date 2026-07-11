"use client";

import { Pool } from "@/lib/types";
import { formatAmount, pluralize } from "@/lib/format";
import { useSortableData, SortState } from "@/hooks/useSortableData";

type SortKey = "asset" | "total" | "anchors";

function getSortValue(pool: Pool, key: SortKey): string | number {
  return pool[key];
}

/** Renders aggregated liquidity pools as a sortable table. */
export function PoolTable({ pools }: { pools: Pool[] }) {
  const { sorted, sort, requestSort } = useSortableData<Pool, SortKey>(
    pools,
    getSortValue,
  );

  if (pools.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No liquidity pools yet. Provide liquidity via the API to see them here.
      </p>
    );
  }

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-zinc-800 text-zinc-400">
          <SortableHeader
            label="Asset"
            sortKey="asset"
            sort={sort}
            onSort={requestSort}
          />
          <SortableHeader
            label="Total liquidity"
            sortKey="total"
            sort={sort}
            onSort={requestSort}
          />
          <SortableHeader
            label="Anchors"
            sortKey="anchors"
            sort={sort}
            onSort={requestSort}
          />
        </tr>
      </thead>
      <tbody>
        {sorted.map((pool) => (
          <tr key={pool.asset} className="border-b border-zinc-900">
            <td className="py-2 font-mono text-zinc-100">{pool.asset}</td>
            <td className="py-2 text-zinc-200">{formatAmount(pool.total)}</td>
            <td className="py-2 text-zinc-400">
              {pluralize(pool.anchors, "anchor")}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SortableHeader({
  label,
  sortKey,
  sort,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  sort: SortState<SortKey> | null;
  onSort: (key: SortKey) => void;
}) {
  const active = sort?.key === sortKey;
  const indicator = active ? (sort?.direction === "asc" ? "▲" : "▼") : "";

  return (
    <th className="py-2 font-medium">
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        aria-label={`Sort by ${label}`}
        className="flex items-center gap-1 hover:text-zinc-200"
      >
        {label}
        <span className="w-2 text-[10px] text-zinc-500">{indicator}</span>
      </button>
    </th>
  );
}
