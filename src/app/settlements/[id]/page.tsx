import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SettlementDetail } from "@/components/SettlementDetail";

export const metadata: Metadata = {
  title: "Settlement detail – AnchorNet",
  description: "Full record detail for a single AnchorNet settlement.",
};

export default async function SettlementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Settlement detail
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Full record for a single cross-anchor settlement.
        </p>
        <div className="mt-8">
          {Number.isFinite(numericId) ? (
            <SettlementDetail id={numericId} />
          ) : (
            <p className="text-sm text-red-400">Invalid settlement id.</p>
          )}
        </div>
      </main>
    </div>
  );
}
