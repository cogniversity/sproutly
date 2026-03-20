import { getAppSession } from "@/lib/auth";
import {
  canEditWorkspace,
  canReadWorkspace,
} from "@/lib/authz";
import { optDate } from "@/lib/date-parse";
import { jsonError } from "@/lib/http";
import * as initiatives from "@/lib/services/initiatives";
import { patchInitiativeBodySchema } from "@/lib/validations/api";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ initiativeId: string }> },
) {
  const { initiativeId } = await ctx.params;
  const session = await getAppSession();
  if (!session) return jsonError("Unauthorized", 401);

  const row = await initiatives.getInitiative(initiativeId);
  if (!row) return jsonError("Not found", 404);
  if (!canReadWorkspace(session, row.workspaceId)) {
    return jsonError("Forbidden", 403);
  }
  return Response.json({ initiative: row });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ initiativeId: string }> },
) {
  const { initiativeId } = await ctx.params;
  const session = await getAppSession();
  if (!session) return jsonError("Unauthorized", 401);

  const row = await initiatives.getInitiative(initiativeId);
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
  const parsed = patchInitiativeBodySchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid request", 400);

  const { startDate, endDate, targetCompletionAt, ...rest } = parsed.data;
  const updated = await initiatives.updateInitiative(initiativeId, {
    ...rest,
    ...(startDate !== undefined ? { startDate: optDate(startDate) } : {}),
    ...(endDate !== undefined ? { endDate: optDate(endDate) } : {}),
    ...(targetCompletionAt !== undefined
      ? { targetCompletionAt: optDate(targetCompletionAt) }
      : {}),
  });
  return Response.json({ initiative: updated });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ initiativeId: string }> },
) {
  const { initiativeId } = await ctx.params;
  const session = await getAppSession();
  if (!session) return jsonError("Unauthorized", 401);

  const row = await initiatives.getInitiative(initiativeId);
  if (!row) return jsonError("Not found", 404);
  if (!canEditWorkspace(session, row.workspaceId)) {
    return jsonError("Forbidden", 403);
  }

  await initiatives.deleteInitiative(initiativeId);
  return new Response(null, { status: 204 });
}
