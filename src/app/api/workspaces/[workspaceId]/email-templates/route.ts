import { getAppSession } from "@/lib/auth";
import {
  canEditWorkspace,
  canReadWorkspace,
} from "@/lib/authz";
import { jsonError } from "@/lib/http";
import * as templates from "@/lib/services/email-templates";
import { createEmailTemplateBodySchema } from "@/lib/validations/api";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ workspaceId: string }> },
) {
  const { workspaceId } = await ctx.params;
  const session = await getAppSession();
  if (!session) return jsonError("Unauthorized", 401);
  if (!canReadWorkspace(session, workspaceId)) {
    return jsonError("Forbidden", 403);
  }
  const list = await templates.listTemplates(workspaceId);
  return Response.json({ templates: list });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ workspaceId: string }> },
) {
  const { workspaceId } = await ctx.params;
  const session = await getAppSession();
  if (!session) return jsonError("Unauthorized", 401);
  if (!canEditWorkspace(session, workspaceId)) {
    return jsonError("Forbidden", 403);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }
  const parsed = createEmailTemplateBodySchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid request", 400);

  const row = await templates.createTemplate({
    workspaceId,
    kind: parsed.data.kind,
    name: parsed.data.name,
    subject: parsed.data.subject,
    bodyHtml: parsed.data.bodyHtml,
  });
  return Response.json({ template: row }, { status: 201 });
}
