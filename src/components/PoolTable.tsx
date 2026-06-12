import { Pool } from "@/lib/types";
import { formatAmount, pluralize } from "@/lib/format";

/** Renders aggregated liquidity pools as a table. */
export function PoolTable({ pools }: { pools: Pool[] }) {
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
          <th className="py-2 font-medium">Asset</th>
          <th className="py-2 font-medium">Total liquidity</th>
          <th className="py-2 font-medium">Anchors</th>
        </tr>
      </thead>
      <tbody>
        {pools.map((pool) => (
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
