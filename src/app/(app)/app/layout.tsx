import Link from "next/link";
import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/auth";
import { SignOutButton } from "@/components/app/sign-out-button";

export default async function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAppSession();
  if (!session) {
    redirect("/login");
  }

  const workspace = session.memberships[0]?.workspace;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <Link
              href="/app"
              className="font-semibold text-emerald-800 dark:text-emerald-400"
            >
              Sproutly
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link
                href="/app"
                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Home
              </Link>
              <Link
                href="/app/plots"
                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Plots
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-zinc-500 sm:inline">
              {session.user.name}
              {workspace ? (
                <span className="text-zinc-400"> · {workspace.name}</span>
              ) : null}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
