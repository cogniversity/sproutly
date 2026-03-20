import type { Sprout, Plot, User } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type StatusSprout = Sprout & {
  plot: Pick<Plot, "id" | "name">;
  owner: Pick<User, "id" | "name"> | null;
};

export async function getWorkspaceStatusSummary(
  workspaceId: string,
  recentDays: number,
): Promise<{
  inProgress: StatusSprout[];
  recentDone: StatusSprout[];
  onHold: StatusSprout[];
  stuck: StatusSprout[];
  recentSinceIso: string;
}> {
  const since = new Date(Date.now() - recentDays * 86400000);

  const sprouts = await prisma.sprout.findMany({
    where: { plot: { workspaceId } },
    include: {
      plot: { select: { id: true, name: true } },
      owner: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const inProgress = sprouts.filter(
    (s) => s.status === "IN_PROGRESS" || s.status === "BACKLOG",
  );
  const recentDone = sprouts.filter(
    (s) => s.status === "DONE" && s.updatedAt >= since,
  );
  const onHold = sprouts.filter(
    (s) => s.status === "PAUSED" || s.status === "DEPRIORITIZED",
  );
  const stuck = sprouts.filter((s) => s.status === "BLOCKED");

  return {
    inProgress,
    recentDone,
    onHold,
    stuck,
    recentSinceIso: since.toISOString(),
  };
}

export function renderDigestHtml(summary: Awaited<ReturnType<typeof getWorkspaceStatusSummary>>, workspaceName: string) {
  const section = (title: string, items: StatusSprout[]) => {
    if (items.length === 0) {
      return `<h2>${title}</h2><p><em>Nothing in this bucket.</em></p>`;
    }
    const rows = items
      .map(
        (s) =>
          `<li><strong>${escapeHtml(s.title)}</strong> — ${escapeHtml(s.plot.name)}${s.owner ? ` — ${escapeHtml(s.owner.name)}` : ""} <span style="color:#666">(${s.status})</span></li>`,
      )
      .join("");
    return `<h2>${title}</h2><ul>${rows}</ul>`;
  };

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Status — ${escapeHtml(workspaceName)}</title></head><body style="font-family:system-ui,sans-serif;max-width:640px;margin:24px auto">
<h1>${escapeHtml(workspaceName)} — delivery snapshot</h1>
<p style="color:#666">Recently done since ${escapeHtml(summary.recentSinceIso)}</p>
${section("In progress / queued", summary.inProgress)}
${section("Done (recent)", summary.recentDone)}
${section("On hold", summary.onHold)}
${section("Stuck", summary.stuck)}
</body></html>`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
