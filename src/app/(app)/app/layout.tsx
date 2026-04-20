import Link from "next/link";
import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/auth";
import { getActiveWorkspaceId } from "@/lib/active-workspace";
import { SignOutButton } from "@/components/app/sign-out-button";
import { WorkspaceSwitcher } from "@/components/workspace/workspace-switcher";

export default async function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAppSession();
  if (!session) {
    redirect("/login");
  }

  const activeId = await getActiveWorkspaceId(session);
  const activeMembership = session.memberships.find(
    (m) => m.workspace.id === activeId,
  );
  const workspace = activeMembership?.workspace;

  const switcherMemberships = session.memberships.map((m) => ({
    id: m.workspace.id,
    name: m.workspace.name,
    role: m.role,
  }));

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-6">
            <Link
              href="/app"
              className="font-semibold text-emerald-800 dark:text-emerald-400"
            >
              Sproutly
            </Link>
            <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <Link
                href="/app"
                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Home
              </Link>
              <Link
                href="/app/workspaces"
                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Workspaces
              </Link>
              <Link
                href="/app/plots"
                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Plots
              </Link>
              <Link
                href="/app/initiatives"
                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Initiatives
              </Link>
              <Link
                href="/app/harvests"
                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Harvests
              </Link>
              <Link
                href="/app/status"
                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Status
              </Link>
              <Link
                href="/app/settings"
                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Settings
              </Link>
            </nav>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <WorkspaceSwitcher
              memberships={switcherMemberships}
              activeWorkspaceId={activeId ?? ""}
            />
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-500">
                {session.user.name}
                {workspace ? (
                  <span className="text-zinc-400"> · {workspace.name}</span>
                ) : null}
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
