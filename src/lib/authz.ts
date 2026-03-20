import type { AppSession } from "@/lib/auth";

export function membershipForWorkspace(
  session: AppSession,
  workspaceId: string,
) {
  return session.memberships.find((m) => m.workspace.id === workspaceId);
}

export function canReadWorkspace(session: AppSession, workspaceId: string) {
  return Boolean(membershipForWorkspace(session, workspaceId));
}

export function canEditWorkspace(session: AppSession, workspaceId: string) {
  const m = membershipForWorkspace(session, workspaceId);
  return m?.role === "ADMIN" || m?.role === "EDITOR";
}

export function canAdminWorkspace(session: AppSession, workspaceId: string) {
  return membershipForWorkspace(session, workspaceId)?.role === "ADMIN";
}
