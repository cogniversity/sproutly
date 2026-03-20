import { getAppSession } from "@/lib/auth";
import { canAdminWorkspace, canReadWorkspace } from "@/lib/authz";
import { jsonError } from "@/lib/http";
import * as workspaces from "@/lib/services/workspaces";
import { inviteWorkspaceMemberBodySchema } from "@/lib/validations/api";

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

  const members = await workspaces.listWorkspaceMembers(workspaceId);
  return Response.json({
    members: members.map((m) => ({
      id: m.id,
      role: m.role,
      user: m.user,
      createdAt: m.createdAt,
    })),
  });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ workspaceId: string }> },
) {
  const { workspaceId } = await ctx.params;
  const session = await getAppSession();
  if (!session) return jsonError("Unauthorized", 401);
  if (!canAdminWorkspace(session, workspaceId)) {
    return jsonError("Forbidden", 403);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }
  const parsed = inviteWorkspaceMemberBodySchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid request", 400);

  const result = await workspaces.addMemberByEmail({
    workspaceId,
    email: parsed.data.email,
    role: parsed.data.role,
  });

  if (!result.ok) {
    if (result.reason === "not_found") {
      return jsonError(
        "No account for that email yet. Ask them to register, then invite again.",
        404,
      );
    }
    return jsonError("That person is already in this workspace.", 409);
  }

  return Response.json({ ok: true }, { status: 201 });
}
