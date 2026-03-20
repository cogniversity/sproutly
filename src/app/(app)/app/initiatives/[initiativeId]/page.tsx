import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAppSession } from "@/lib/auth";
import { canReadWorkspace } from "@/lib/authz";
import { InitiativeDetailClient } from "@/components/initiatives/initiative-detail";
import * as initiatives from "@/lib/services/initiatives";

type Props = { params: Promise<{ initiativeId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { initiativeId } = await params;
  const row = await initiatives.getInitiative(initiativeId);
  return { title: row ? `${row.name} — Initiative` : "Initiative" };
}

export default async function InitiativeDetailPage({ params }: Props) {
  const { initiativeId } = await params;
  const session = await getAppSession();
  if (!session) redirect("/login");

  const row = await initiatives.getInitiative(initiativeId);
  if (!row) notFound();
  if (!canReadWorkspace(session, row.workspaceId)) {
    redirect("/app/initiatives");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/app/initiatives" className="text-sm text-emerald-700 dark:text-emerald-400">
          ← Initiatives
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{row.name}</h1>
        {row.description ? (
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">{row.description}</p>
        ) : null}
      </div>
      <InitiativeDetailClient initiative={row} />
    </div>
  );
}
