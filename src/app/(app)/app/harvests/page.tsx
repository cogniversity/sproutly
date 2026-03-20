import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/auth";
import { HarvestsBoard } from "@/components/harvests/harvests-board";
import * as harvests from "@/lib/services/harvests";

export const metadata: Metadata = {
  title: "Harvests — Sproutly",
};

export default async function HarvestsPage() {
  const session = await getAppSession();
  if (!session) redirect("/login");
  const ws = session.memberships[0]?.workspace;
  if (!ws) redirect("/login");

  const list = await harvests.listHarvests(ws.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Harvests</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Releases: what ships together.
        </p>
      </div>
      <HarvestsBoard workspaceId={ws.id} initial={list} />
    </div>
  );
}
