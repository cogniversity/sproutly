import { getAppSession } from "@/lib/auth";
import {
  canEditWorkspace,
  canReadWorkspace,
} from "@/lib/authz";
import { jsonError } from "@/lib/http";
import * as plots from "@/lib/services/plots";
import { createPlotBodySchema } from "@/lib/validations/api";

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
  const list = await plots.listPlots(workspaceId);
  return Response.json({ plots: list });
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
  const parsed = createPlotBodySchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid request", 400);

  const plot = await plots.createPlot({
    workspaceId,
    name: parsed.data.name,
    description: parsed.data.description,
    timelineLabel: parsed.data.timelineLabel,
  });
  return Response.json({ plot }, { status: 201 });
}
