import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/auth";
import { getActiveWorkspaceId } from "@/lib/active-workspace";
import { WorkspacesPageClient } from "@/components/workspace/workspaces-page-client";
import * as workspaces from "@/lib/services/workspaces";

export const metadata: Metadata = {
  title: "Workspaces — Sproutly",
};

export default async function WorkspacesPage() {
  const session = await getAppSession();
  if (!session) redirect("/login");

  const activeId = await getActiveWorkspaceId(session);
  const list = session.memberships.map((m) => ({
    id: m.workspace.id,
    name: m.workspace.name,
    slug: m.workspace.slug,
    role: m.role,
  }));

  let initialMembers: { id: string; role: string; user: { email: string; name: string } }[] =
    [];
  if (activeId) {
    const rows = await workspaces.listWorkspaceMembers(activeId);
    initialMembers = rows.map((m) => ({
      id: m.id,
      role: m.role,
      user: { email: m.user.email, name: m.user.name },
    }));
  }

  const activeRole = session.memberships.find((m) => m.workspace.id === activeId)?.role;
  const isAdmin = activeRole === "ADMIN";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/app"
          className="text-sm text-emerald-700 dark:text-emerald-400"
        >
          ← Home
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Workspaces</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Switch workspace from the header anytime. Create a new workspace or invite teammates
          who already have a Sproutly account (they must register first).
        </p>
      </div>
      <WorkspacesPageClient
        initialWorkspaces={list}
        activeWorkspaceId={activeId ?? ""}
        initialMembers={initialMembers}
        canInvite={isAdmin && Boolean(activeId)}
      />
    </div>
  );
}
