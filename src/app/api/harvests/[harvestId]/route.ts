import { getAppSession } from "@/lib/auth";
import {
  canEditWorkspace,
  canReadWorkspace,
} from "@/lib/authz";
import { optDate } from "@/lib/date-parse";
import { jsonError } from "@/lib/http";
import * as harvests from "@/lib/services/harvests";
import { patchHarvestBodySchema } from "@/lib/validations/api";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ harvestId: string }> },
) {
  const { harvestId } = await ctx.params;
  const session = await getAppSession();
  if (!session) return jsonError("Unauthorized", 401);

  const row = await harvests.getHarvest(harvestId);
  if (!row) return jsonError("Not found", 404);
  if (!canReadWorkspace(session, row.workspaceId)) {
    return jsonError("Forbidden", 403);
  }
  return Response.json({ harvest: row });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ harvestId: string }> },
) {
  const { harvestId } = await ctx.params;
  const session = await getAppSession();
  if (!session) return jsonError("Unauthorized", 401);

  const row = await harvests.getHarvest(harvestId);
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
  const parsed = patchHarvestBodySchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid request", 400);

  const { targetDate, shippedAt, ...rest } = parsed.data;
  const updated = await harvests.updateHarvest(harvestId, {
    ...rest,
    ...(targetDate !== undefined ? { targetDate: optDate(targetDate) } : {}),
    ...(shippedAt !== undefined ? { shippedAt: optDate(shippedAt) } : {}),
  });
  return Response.json({ harvest: updated });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ harvestId: string }> },
) {
  const { harvestId } = await ctx.params;
  const session = await getAppSession();
  if (!session) return jsonError("Unauthorized", 401);

  const row = await harvests.getHarvest(harvestId);
  if (!row) return jsonError("Not found", 404);
  if (!canEditWorkspace(session, row.workspaceId)) {
    return jsonError("Forbidden", 403);
  }

  await harvests.deleteHarvest(harvestId);
  return new Response(null, { status: 204 });
}
