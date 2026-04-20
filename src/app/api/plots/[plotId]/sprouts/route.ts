import { getAppSession } from "@/lib/auth";
import {
  canEditWorkspace,
  canReadWorkspace,
} from "@/lib/authz";
import { optDate } from "@/lib/date-parse";
import { jsonError } from "@/lib/http";
import * as plots from "@/lib/services/plots";
import * as sprouts from "@/lib/services/sprouts";
import { createSproutBodySchema } from "@/lib/validations/api";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ plotId: string }> },
) {
  const { plotId } = await ctx.params;
  const session = await getAppSession();
  if (!session) return jsonError("Unauthorized", 401);

  const plot = await plots.getPlotById(plotId);
  if (!plot) return jsonError("Not found", 404);
  if (!canReadWorkspace(session, plot.workspaceId)) {
    return jsonError("Forbidden", 403);
  }

  const list = await sprouts.listSprouts(plotId);
  return Response.json({ sprouts: list });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ plotId: string }> },
) {
  const { plotId } = await ctx.params;
  const session = await getAppSession();
  if (!session) return jsonError("Unauthorized", 401);

  const plot = await plots.getPlotById(plotId);
  if (!plot) return jsonError("Not found", 404);
  if (!canEditWorkspace(session, plot.workspaceId)) {
    return jsonError("Forbidden", 403);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }
  const parsed = createSproutBodySchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid request", 400);

  const { targetCompletionAt, ...rest } = parsed.data;
  const sprout = await sprouts.createSprout({
    plotId,
    parentSproutId: rest.parentSproutId,
    title: rest.title,
    description: rest.description,
    type: rest.type,
    status: rest.status,
    timelineLabel: rest.timelineLabel,
    targetCompletionAt: optDate(targetCompletionAt ?? undefined),
    ownerUserId: rest.ownerUserId,
  });
  return Response.json({ sprout }, { status: 201 });
}
