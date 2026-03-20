import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAppSession } from "@/lib/auth";
import { canReadWorkspace } from "@/lib/authz";
import * as plots from "@/lib/services/plots";
import * as sprouts from "@/lib/services/sprouts";
import { PlotEditForm } from "@/components/plots/plot-edit-form";
import { PlotSproutsManager } from "@/components/plots/plot-sprouts-manager";

type Props = { params: Promise<{ plotId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { plotId } = await params;
  const plot = await plots.getPlotById(plotId);
  return {
    title: plot ? `${plot.name} — Sproutly` : "Plot — Sproutly",
  };
}

export default async function PlotDetailPage({ params }: Props) {
  const { plotId } = await params;
  const session = await getAppSession();
  if (!session) redirect("/login");

  const plot = await plots.getPlotById(plotId);
  if (!plot) notFound();
  if (!canReadWorkspace(session, plot.workspaceId)) {
    redirect("/app/plots");
  }

  const sproutList = await sprouts.listSprouts(plotId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/app/plots"
          className="text-sm text-emerald-700 dark:text-emerald-400"
        >
          ← All plots
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {plot.name}
        </h1>
      </div>
      <PlotEditForm workspaceId={plot.workspaceId} plot={plot} />
      <PlotSproutsManager
        plotId={plotId}
        workspaceId={plot.workspaceId}
        plotName={plot.name}
        initialSprouts={sproutList}
      />
    </div>
  );
}
