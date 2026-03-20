import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/auth";
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
  const session = await getAppSession();
  if (!session) redirect("/login");
  const ws = session.memberships[0]?.workspace;
  if (!ws) redirect("/login");

  const role = membershipForWorkspace(session, ws.id)?.role;
  const isAdmin = role === "ADMIN";

  const sp = await searchParams;
  const tabParam = sp.tab;
  const defaultTab =
    tabParam === "templates" || tabParam === "digest"
      ? tabParam
      : isAdmin
        ? "ai"
        : "templates";

  const initialTemplates = await emailTemplates.listTemplates(ws.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Workspace: <strong>{ws.name}</strong>
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
        <SettingsDashboard
          workspaceId={ws.id}
          isAdmin={isAdmin}
          defaultTab={defaultTab}
          initialTemplates={initialTemplates}
        />
      </Suspense>
    </div>
  );
}
