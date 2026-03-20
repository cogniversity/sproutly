import { NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth";
import {
  ACTIVE_WORKSPACE_COOKIE,
  activeWorkspaceCookieOptions,
} from "@/lib/active-workspace";
import { jsonError } from "@/lib/http";
import * as workspaces from "@/lib/services/workspaces";
import { createWorkspaceBodySchema } from "@/lib/validations/api";

export async function GET() {
  const session = await getAppSession();
  if (!session) return jsonError("Unauthorized", 401);
  return Response.json({
    workspaces: session.memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      slug: m.workspace.slug,
      role: m.role,
    })),
  });
}

export async function POST(req: Request) {
  const session = await getAppSession();
  if (!session) return jsonError("Unauthorized", 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }
  const parsed = createWorkspaceBodySchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid request", 400);

  const workspace = await workspaces.createWorkspace({
    name: parsed.data.name,
    creatorUserId: session.user.id,
  });

  const res = NextResponse.json({ workspace }, { status: 201 });
  res.cookies.set(
    ACTIVE_WORKSPACE_COOKIE,
    workspace.id,
    activeWorkspaceCookieOptions(),
  );
  return res;
}
