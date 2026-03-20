import type { Metadata } from "next";
import { requireActiveWorkspace } from "@/lib/workspace-context";
import { HarvestsBoard } from "@/components/harvests/harvests-board";
import * as harvests from "@/lib/services/harvests";

export const metadata: Metadata = {
  title: "Harvests — Sproutly",
};

export default async function HarvestsPage() {
  const ctx = await requireActiveWorkspace();
  const list = await harvests.listHarvests(ctx.workspaceId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Harvests</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Releases: what ships together.
        </p>
      </div>
      <HarvestsBoard workspaceId={ctx.workspaceId} initial={list} />
    </div>
  );
}
