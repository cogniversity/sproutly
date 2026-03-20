import { getAppSession } from "@/lib/auth";
import {
  canEditWorkspace,
  canReadWorkspace,
} from "@/lib/authz";
import { optDate } from "@/lib/date-parse";
import { jsonError } from "@/lib/http";
import * as sprouts from "@/lib/services/sprouts";
import { patchSproutBodySchema } from "@/lib/validations/api";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ sproutId: string }> },
) {
  const { sproutId } = await ctx.params;
  const session = await getAppSession();
  if (!session) return jsonError("Unauthorized", 401);

  const sprout = await sprouts.getSproutById(sproutId);
  if (!sprout) return jsonError("Not found", 404);
  const wsId = sprout.plot.workspaceId;
  if (!canReadWorkspace(session, wsId)) {
    return jsonError("Forbidden", 403);
  }
  return Response.json({ sprout });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ sproutId: string }> },
) {
  const { sproutId } = await ctx.params;
  const session = await getAppSession();
  if (!session) return jsonError("Unauthorized", 401);

  const sprout = await sprouts.getSproutById(sproutId);
  if (!sprout) return jsonError("Not found", 404);
  const wsId = sprout.plot.workspaceId;
  if (!canEditWorkspace(session, wsId)) {
    return jsonError("Forbidden", 403);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }
  const parsed = patchSproutBodySchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid request", 400);

  const { targetCompletionAt, ...rest } = parsed.data;
  const updated = await sprouts.updateSprout(sproutId, {
    ...rest,
    ...(targetCompletionAt !== undefined
      ? { targetCompletionAt: optDate(targetCompletionAt) }
      : {}),
  });
  return Response.json({ sprout: updated });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ sproutId: string }> },
) {
  const { sproutId } = await ctx.params;
  const session = await getAppSession();
  if (!session) return jsonError("Unauthorized", 401);

  const sprout = await sprouts.getSproutById(sproutId);
  if (!sprout) return jsonError("Not found", 404);
  const wsId = sprout.plot.workspaceId;
  if (!canEditWorkspace(session, wsId)) {
    return jsonError("Forbidden", 403);
  }

  await sprouts.deleteSprout(sproutId);
  return new Response(null, { status: 204 });
}
