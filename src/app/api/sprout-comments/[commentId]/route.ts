import { getAppSession } from "@/lib/auth";
import { canEditWorkspace, canReadWorkspace } from "@/lib/authz";
import { jsonError } from "@/lib/http";
import * as sproutComments from "@/lib/services/sprout-comments";
import { patchSproutCommentBodySchema } from "@/lib/validations/api";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ commentId: string }> },
) {
  const { commentId } = await ctx.params;
  const session = await getAppSession();
  if (!session) return jsonError("Unauthorized", 401);

  const comment = await sproutComments.getSproutCommentById(commentId);
  if (!comment) return jsonError("Not found", 404);
  const wsId = comment.sprout.plot.workspaceId;
  if (!canReadWorkspace(session, wsId)) {
    return jsonError("Forbidden", 403);
  }

  return Response.json({ comment });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ commentId: string }> },
) {
  const { commentId } = await ctx.params;
  const session = await getAppSession();
  if (!session) return jsonError("Unauthorized", 401);

  const comment = await sproutComments.getSproutCommentById(commentId);
  if (!comment) return jsonError("Not found", 404);
  const wsId = comment.sprout.plot.workspaceId;
  if (!canEditWorkspace(session, wsId)) {
    return jsonError("Forbidden", 403);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = patchSproutCommentBodySchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid request", 400);

  const updated = await sproutComments.updateSproutComment(
    commentId,
    parsed.data.body,
  );

  return Response.json({ comment: updated });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ commentId: string }> },
) {
  const { commentId } = await ctx.params;
  const session = await getAppSession();
  if (!session) return jsonError("Unauthorized", 401);

  const comment = await sproutComments.getSproutCommentById(commentId);
  if (!comment) return jsonError("Not found", 404);
  const wsId = comment.sprout.plot.workspaceId;
  if (!canEditWorkspace(session, wsId)) {
    return jsonError("Forbidden", 403);
  }

  await sproutComments.deleteSproutComment(commentId);
  return new Response(null, { status: 204 });
}
