import type { Metadata } from "next";
import Link from "next/link";
import { requireActiveWorkspace } from "@/lib/workspace-context";
import { formatPlanningLine } from "@/lib/timeline";
import { getWorkspaceStatusSummary } from "@/lib/services/status-summary";

export const metadata: Metadata = {
  title: "Leadership status — Sproutly",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default async function StatusPage({
  searchParams,
}: {
  searchParams: Promise<{ recent?: string }>;
}) {
  const ctx = await requireActiveWorkspace();
  const sp = await searchParams;
  const recentDays = Math.min(
    90,
    Math.max(1, Number(sp.recent ?? 14) || 14),
  );

  const summary = await getWorkspaceStatusSummary(ctx.workspaceId, recentDays);

  const list = (items: typeof summary.inProgress) => {
    if (items.length === 0) {
      return (
        <p className="text-sm text-zinc-500">
          <em>Nothing in this bucket.</em>
        </p>
      );
    }
    return (
      <ul className="flex flex-col gap-2 text-sm">
        {items.map((s) => (
          <li key={s.id} className="flex flex-wrap gap-x-2 border-b border-zinc-100 pb-2 last:border-0 dark:border-zinc-800">
            <span className="font-medium">{s.title}</span>
            <span className="text-zinc-500">{s.plot.name}</span>
            {s.owner ? (
              <span className="text-zinc-400">· {s.owner.name}</span>
            ) : null}
            <span className="text-xs text-zinc-400">({s.status})</span>
            <span className="block text-xs text-zinc-400">
              {formatPlanningLine(
                s.targetCompletionAt ? new Date(s.targetCompletionAt) : null,
                s.timelineLabel,
              )}
            </span>
            <Link
              href={`/app/plots/${s.plot.id}`}
              className="text-xs text-emerald-700 underline dark:text-emerald-400"
            >
              Open plot
            </Link>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leadership status</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Narrative view across <strong>{ctx.workspace.name}</strong>. Recently done uses the
          last <strong>{recentDays}</strong> days (
          <Link href="/app/status?recent=7" className="text-emerald-700 underline dark:text-emerald-400">
            7d
          </Link>
          {" · "}
          <Link href="/app/status?recent=14" className="text-emerald-700 underline dark:text-emerald-400">
            14d
          </Link>
          {" · "}
          <Link href="/app/status?recent=30" className="text-emerald-700 underline dark:text-emerald-400">
            30d
          </Link>
          ).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="In progress / queued">{list(summary.inProgress)}</Section>
        <Section title="Done (recent)">{list(summary.recentDone)}</Section>
        <Section title="On hold">{list(summary.onHold)}</Section>
        <Section title="Stuck">{list(summary.stuck)}</Section>
      </div>

      <p className="text-xs text-zinc-500">
        Email digest preview:{" "}
        <Link
          href={`/app/settings?tab=digest&recent=${recentDays}`}
          className="text-emerald-700 underline dark:text-emerald-400"
        >
          Settings → Digest
        </Link>
      </p>
    </div>
  );
}
