import { NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth";
import { canReadWorkspace } from "@/lib/authz";
import {
  ACTIVE_WORKSPACE_COOKIE,
  activeWorkspaceCookieOptions,
} from "@/lib/active-workspace";
import { jsonError } from "@/lib/http";
import { switchWorkspaceBodySchema } from "@/lib/validations/api";

export async function POST(req: Request) {
  const session = await getAppSession();
  if (!session) return jsonError("Unauthorized", 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }
  const parsed = switchWorkspaceBodySchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid request", 400);

  if (!canReadWorkspace(session, parsed.data.workspaceId)) {
    return jsonError("Forbidden", 403);
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(
    ACTIVE_WORKSPACE_COOKIE,
    parsed.data.workspaceId,
    activeWorkspaceCookieOptions(),
  );
  return res;
}
