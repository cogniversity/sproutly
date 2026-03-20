import { getAppSession } from "@/lib/auth";
import {
  canEditWorkspace,
  canReadWorkspace,
} from "@/lib/authz";
import { optDate } from "@/lib/date-parse";
import { jsonError } from "@/lib/http";
import * as harvests from "@/lib/services/harvests";
import { createHarvestBodySchema } from "@/lib/validations/api";

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
  const list = await harvests.listHarvests(workspaceId);
  return Response.json({ harvests: list });
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
  const parsed = createHarvestBodySchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid request", 400);

  const row = await harvests.createHarvest({
    workspaceId,
    name: parsed.data.name,
    versionLabel: parsed.data.versionLabel,
    targetDate: optDate(parsed.data.targetDate ?? undefined) ?? null,
    shippedAt: optDate(parsed.data.shippedAt ?? undefined) ?? null,
  });
  return Response.json({ harvest: row }, { status: 201 });
}
