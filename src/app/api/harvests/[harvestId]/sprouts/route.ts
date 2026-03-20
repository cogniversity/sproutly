import { getAppSession } from "@/lib/auth";
import { canEditWorkspace } from "@/lib/authz";
import { jsonError } from "@/lib/http";
import * as harvests from "@/lib/services/harvests";
import * as sprouts from "@/lib/services/sprouts";
import { linkSproutBodySchema } from "@/lib/validations/api";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ harvestId: string }> },
) {
  const { harvestId } = await ctx.params;
  const session = await getAppSession();
  if (!session) return jsonError("Unauthorized", 401);

  const h = await harvests.getHarvest(harvestId);
  if (!h) return jsonError("Not found", 404);
  if (!canEditWorkspace(session, h.workspaceId)) {
    return jsonError("Forbidden", 403);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }
  const parsed = linkSproutBodySchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid request", 400);

  const spr = await sprouts.getSproutById(parsed.data.sproutId);
  if (!spr || spr.plot.workspaceId !== h.workspaceId) {
    return jsonError("Sprout not in workspace", 400);
  }

  try {
    const link = await harvests.linkSprout(harvestId, parsed.data.sproutId);
    return Response.json({ sprout: link.sprout }, { status: 201 });
  } catch {
    return jsonError("Already linked", 409);
  }
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ harvestId: string }> },
) {
  const { harvestId } = await ctx.params;
  const session = await getAppSession();
  if (!session) return jsonError("Unauthorized", 401);

  const h = await harvests.getHarvest(harvestId);
  if (!h) return jsonError("Not found", 404);
  if (!canEditWorkspace(session, h.workspaceId)) {
    return jsonError("Forbidden", 403);
  }

  const sproutId = new URL(req.url).searchParams.get("sproutId");
  if (!sproutId) return jsonError("sproutId required", 400);

  await harvests.unlinkSprout(harvestId, sproutId);
  return new Response(null, { status: 204 });
}
