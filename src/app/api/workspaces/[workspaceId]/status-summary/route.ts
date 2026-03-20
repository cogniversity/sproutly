import { getAppSession } from "@/lib/auth";
import { canReadWorkspace } from "@/lib/authz";
import { jsonError } from "@/lib/http";
import { getWorkspaceStatusSummary } from "@/lib/services/status-summary";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ workspaceId: string }> },
) {
  const { workspaceId } = await ctx.params;
  const session = await getAppSession();
  if (!session) return jsonError("Unauthorized", 401);
  if (!canReadWorkspace(session, workspaceId)) {
    return jsonError("Forbidden", 403);
  }

  const { searchParams } = new URL(req.url);
  const recentDays = Math.min(
    90,
    Math.max(1, Number(searchParams.get("recentDays") ?? 14) || 14),
  );

  const summary = await getWorkspaceStatusSummary(workspaceId, recentDays);
  return Response.json({
    recentDays,
    recentSinceIso: summary.recentSinceIso,
    inProgress: summary.inProgress,
    recentDone: summary.recentDone,
    onHold: summary.onHold,
    stuck: summary.stuck,
  });
}
