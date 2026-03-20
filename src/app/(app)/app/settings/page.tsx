import type { Metadata } from "next";
import { Suspense } from "react";
import { requireActiveWorkspace } from "@/lib/workspace-context";
import { membershipForWorkspace } from "@/lib/authz";
import { SettingsDashboard } from "@/components/settings/settings-dashboard";
import * as emailTemplates from "@/lib/services/email-templates";

export const metadata: Metadata = {
  title: "Settings — Sproutly",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const ctx = await requireActiveWorkspace();
  const { session, workspaceId, workspace } = ctx;

  const role = membershipForWorkspace(session, workspaceId)?.role;
  const isAdmin = role === "ADMIN";

  const sp = await searchParams;
  const tabParam = sp.tab;
  const defaultTab =
    tabParam === "templates" || tabParam === "digest"
      ? tabParam
      : isAdmin
        ? "ai"
        : "templates";

  const initialTemplates = await emailTemplates.listTemplates(workspaceId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Workspace: <strong>{workspace.name}</strong>
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
        <SettingsDashboard
          workspaceId={workspaceId}
          isAdmin={isAdmin}
          defaultTab={defaultTab}
          initialTemplates={initialTemplates}
        />
      </Suspense>
    </div>
  );
}
