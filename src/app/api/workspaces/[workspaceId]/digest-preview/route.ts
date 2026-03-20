import { getAppSession } from "@/lib/auth";
import { canReadWorkspace } from "@/lib/authz";
import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import {
  getWorkspaceStatusSummary,
  renderDigestHtml,
} from "@/lib/services/status-summary";
import * as templates from "@/lib/services/email-templates";

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
  const templateId = searchParams.get("templateId");

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });
  if (!workspace) return jsonError("Not found", 404);

  const summary = await getWorkspaceStatusSummary(workspaceId, recentDays);
  const digestHtml = renderDigestHtml(summary, workspace.name);

  if (templateId) {
    const tpl = await templates.getTemplate(templateId);
    if (!tpl || tpl.workspaceId !== workspaceId) {
      return jsonError("Template not found", 404);
    }
    const merged = templates.mergeTemplate(tpl.subject, tpl.bodyHtml, {
      workspaceName: workspace.name,
      digestHtml,
    });
    return Response.json({
      subject: merged.subject,
      html: merged.bodyHtml,
      summary,
    });
  }

  return Response.json({
    subject: `${workspace.name} — status digest`,
    html: digestHtml,
    summary,
  });
}
