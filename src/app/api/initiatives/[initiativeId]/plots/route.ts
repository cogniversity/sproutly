import { getAppSession } from "@/lib/auth";
import { canEditWorkspace } from "@/lib/authz";
import { jsonError } from "@/lib/http";
import * as initiatives from "@/lib/services/initiatives";
import * as plots from "@/lib/services/plots";
import { linkPlotBodySchema } from "@/lib/validations/api";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ initiativeId: string }> },
) {
  const { initiativeId } = await ctx.params;
  const session = await getAppSession();
  if (!session) return jsonError("Unauthorized", 401);

  const ini = await initiatives.getInitiative(initiativeId);
  if (!ini) return jsonError("Not found", 404);
  if (!canEditWorkspace(session, ini.workspaceId)) {
    return jsonError("Forbidden", 403);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }
  const parsed = linkPlotBodySchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid request", 400);

  const plot = await plots.getPlotById(parsed.data.plotId);
  if (!plot || plot.workspaceId !== ini.workspaceId) {
    return jsonError("Plot not in workspace", 400);
  }

  try {
    const link = await initiatives.linkPlot(initiativeId, parsed.data.plotId);
    return Response.json({ plot: link.plot }, { status: 201 });
  } catch {
    return jsonError("Already linked", 409);
  }
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ initiativeId: string }> },
) {
  const { initiativeId } = await ctx.params;
  const session = await getAppSession();
  if (!session) return jsonError("Unauthorized", 401);

  const ini = await initiatives.getInitiative(initiativeId);
  if (!ini) return jsonError("Not found", 404);
  if (!canEditWorkspace(session, ini.workspaceId)) {
    return jsonError("Forbidden", 403);
  }

  const plotId = new URL(req.url).searchParams.get("plotId");
  if (!plotId) return jsonError("plotId required", 400);

  await initiatives.unlinkPlot(initiativeId, plotId);
  return new Response(null, { status: 204 });
}
