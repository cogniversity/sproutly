import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/auth";
import { listPlots } from "@/lib/services/plots";
import { PlotsManager } from "@/components/plots/plots-manager";

export const metadata: Metadata = {
  title: "Plots — Sproutly",
};

export default async function PlotsPage() {
  const session = await getAppSession();
  if (!session) redirect("/login");
  const ws = session.memberships[0]?.workspace;
  if (!ws) redirect("/login");

  const plots = await listPlots(ws.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Plots</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Each plot is a product, team, or stream. Sprouts live inside a plot.
        </p>
      </div>
      <PlotsManager workspaceId={ws.id} initialPlots={plots} />
    </div>
  );
}
