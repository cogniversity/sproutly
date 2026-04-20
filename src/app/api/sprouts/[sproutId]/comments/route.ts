import { getAppSession } from "@/lib/auth";
import { canEditWorkspace } from "@/lib/authz";
import { jsonError } from "@/lib/http";
import * as sproutComments from "@/lib/services/sprout-comments";
import * as sprouts from "@/lib/services/sprouts";
import { createSproutCommentBodySchema } from "@/lib/validations/api";

export async function POST(
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

  const parsed = createSproutCommentBodySchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid request", 400);

  const comment = await sproutComments.createSproutComment({
    sproutId,
    authorUserId: session.user.id,
    body: parsed.data.body,
  });

  return Response.json({ comment }, { status: 201 });
}
