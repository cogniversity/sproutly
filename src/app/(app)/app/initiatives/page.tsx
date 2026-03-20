import type { Metadata } from "next";
import { requireActiveWorkspace } from "@/lib/workspace-context";
import { InitiativesBoard } from "@/components/initiatives/initiatives-board";
import * as initiatives from "@/lib/services/initiatives";

export const metadata: Metadata = {
  title: "Initiatives — Sproutly",
};

export default async function InitiativesPage() {
  const ctx = await requireActiveWorkspace();
  const list = await initiatives.listInitiatives(ctx.workspaceId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Initiatives</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Programs that span multiple plots (demos, migrations, coordinated work).
        </p>
      </div>
      <InitiativesBoard workspaceId={ctx.workspaceId} initial={list} />
    </div>
  );
}
