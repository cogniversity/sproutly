import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/auth";
import { InitiativesBoard } from "@/components/initiatives/initiatives-board";
import * as initiatives from "@/lib/services/initiatives";

export const metadata: Metadata = {
  title: "Initiatives — Sproutly",
};

export default async function InitiativesPage() {
  const session = await getAppSession();
  if (!session) redirect("/login");
  const ws = session.memberships[0]?.workspace;
  if (!ws) redirect("/login");

  const list = await initiatives.listInitiatives(ws.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Initiatives</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Programs that span multiple plots (demos, migrations, coordinated work).
        </p>
      </div>
      <InitiativesBoard workspaceId={ws.id} initial={list} />
    </div>
  );
}
