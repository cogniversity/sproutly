import { getAppSession } from "@/lib/auth";
import {
  canEditWorkspace,
  canReadWorkspace,
} from "@/lib/authz";
import { jsonError } from "@/lib/http";
import * as plots from "@/lib/services/plots";
import { patchPlotBodySchema } from "@/lib/validations/api";

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
  return Response.json({ plot });
}

export async function PATCH(
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
  const parsed = patchPlotBodySchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid request", 400);

  const updated = await plots.updatePlot(plotId, parsed.data);
  return Response.json({ plot: updated });
}

export async function DELETE(
  _req: Request,
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

  await plots.deletePlot(plotId);
  return new Response(null, { status: 204 });
}
