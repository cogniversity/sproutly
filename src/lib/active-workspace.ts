import { cookies } from "next/headers";
import type { AppSession, SessionWorkspace } from "@/lib/auth";

export const ACTIVE_WORKSPACE_COOKIE = "sproutly_workspace_id";

export function activeWorkspaceCookieOptions() {
  return {
    httpOnly: true as const,
    path: "/",
    maxAge: 365 * 24 * 60 * 60,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

/** Resolves current workspace from cookie, validated against session; falls back to first membership. */
export async function getActiveWorkspaceId(session: AppSession): Promise<string | null> {
  if (session.memberships.length === 0) return null;
  const jar = await cookies();
  const raw = jar.get(ACTIVE_WORKSPACE_COOKIE)?.value;
  if (raw && session.memberships.some((m) => m.workspace.id === raw)) {
    return raw;
  }
  return session.memberships[0]!.workspace.id;
}

export type ActiveWorkspaceContext = {
  session: AppSession;
  workspaceId: string;
  workspace: SessionWorkspace;
};

export async function getActiveWorkspaceContext(
  session: AppSession,
): Promise<ActiveWorkspaceContext | null> {
  const workspaceId = await getActiveWorkspaceId(session);
  if (!workspaceId) return null;
  const m = session.memberships.find((x) => x.workspace.id === workspaceId);
  if (!m) return null;
  return { session, workspaceId, workspace: m.workspace };
}
