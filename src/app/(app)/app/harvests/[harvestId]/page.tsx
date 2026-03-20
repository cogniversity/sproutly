import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAppSession } from "@/lib/auth";
import { canReadWorkspace } from "@/lib/authz";
import { HarvestDetailClient } from "@/components/harvests/harvest-detail";
import * as harvests from "@/lib/services/harvests";

type Props = { params: Promise<{ harvestId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { harvestId } = await params;
  const row = await harvests.getHarvest(harvestId);
  return { title: row ? `${row.name} — Harvest` : "Harvest" };
}

export default async function HarvestDetailPage({ params }: Props) {
  const { harvestId } = await params;
  const session = await getAppSession();
  if (!session) redirect("/login");

  const row = await harvests.getHarvest(harvestId);
  if (!row) notFound();
  if (!canReadWorkspace(session, row.workspaceId)) {
    redirect("/app/harvests");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/app/harvests" className="text-sm text-emerald-700 dark:text-emerald-400">
          ← Harvests
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{row.name}</h1>
        {row.versionLabel ? (
          <p className="text-sm text-zinc-500">{row.versionLabel}</p>
        ) : null}
      </div>
      <HarvestDetailClient harvest={row} />
    </div>
  );
}
