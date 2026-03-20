import Link from "next/link";
import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/auth";
import { listPlots } from "@/lib/services/plots";

export default async function AppHomePage() {
  const session = await getAppSession();
  if (!session) redirect("/login");
  const ws = session.memberships[0]?.workspace;
  const plotCount = ws ? (await listPlots(ws.id)).length : 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Hi, {session.user.name}
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          You are in <strong>{ws?.name ?? "your workspace"}</strong>. Organize work
          into Plots, then capture ideas and delivery as Sprouts.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/app/plots"
          className="rounded-xl border border-zinc-200 p-5 transition hover:border-emerald-600/40 hover:bg-emerald-50/50 dark:border-zinc-800 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-950/20"
        >
          <h2 className="font-medium text-emerald-800 dark:text-emerald-400">
            Plots
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {plotCount === 0
              ? "Create your first plot (product or team stream)."
              : `${plotCount} plot${plotCount === 1 ? "" : "s"} · open the board`}
          </p>
        </Link>
        <div className="rounded-xl border border-dashed border-zinc-300 p-5 dark:border-zinc-700">
          <h2 className="font-medium text-zinc-700 dark:text-zinc-300">
            Coming next
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Initiatives, Harvests, leadership status, and AI-assisted breakdown—see{" "}
            <Link
              href="https://github.com/cogniversity/sproutly/blob/main/docs/BUSINESS_REQUIREMENTS_DOCUMENT.md"
              className="text-emerald-700 underline dark:text-emerald-400"
            >
              BRD
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
