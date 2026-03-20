import { getAppSession } from "@/lib/auth";
import {
  canEditWorkspace,
  canReadWorkspace,
} from "@/lib/authz";
import { jsonError } from "@/lib/http";
import * as templates from "@/lib/services/email-templates";
import { patchEmailTemplateBodySchema } from "@/lib/validations/api";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ templateId: string }> },
) {
  const { templateId } = await ctx.params;
  const session = await getAppSession();
  if (!session) return jsonError("Unauthorized", 401);

  const row = await templates.getTemplate(templateId);
  if (!row) return jsonError("Not found", 404);
  if (!canReadWorkspace(session, row.workspaceId)) {
    return jsonError("Forbidden", 403);
  }
  return Response.json({ template: row });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ templateId: string }> },
) {
  const { templateId } = await ctx.params;
  const session = await getAppSession();
  if (!session) return jsonError("Unauthorized", 401);

  const row = await templates.getTemplate(templateId);
  if (!row) return jsonError("Not found", 404);
  if (!canEditWorkspace(session, row.workspaceId)) {
    return jsonError("Forbidden", 403);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }
  const parsed = patchEmailTemplateBodySchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid request", 400);

  const updated = await templates.updateTemplate(templateId, parsed.data);
  return Response.json({ template: updated });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ templateId: string }> },
) {
  const { templateId } = await ctx.params;
  const session = await getAppSession();
  if (!session) return jsonError("Unauthorized", 401);

  const row = await templates.getTemplate(templateId);
  if (!row) return jsonError("Not found", 404);
  if (!canEditWorkspace(session, row.workspaceId)) {
    return jsonError("Forbidden", 403);
  }

  await templates.deleteTemplate(templateId);
  return new Response(null, { status: 204 });
}
