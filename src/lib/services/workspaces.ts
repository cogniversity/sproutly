import type { MembershipRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function createWorkspace(input: { name: string; creatorUserId: string }) {
  const base = input.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
  const slug = `${base || "workspace"}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  return prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: {
        name: input.name.trim(),
        slug,
      },
    });
    await tx.membership.create({
      data: {
        userId: input.creatorUserId,
        workspaceId: workspace.id,
        role: "ADMIN",
      },
    });
    return workspace;
  });
}

export async function listWorkspaceMembers(workspaceId: string) {
  return prisma.membership.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
  });
}

export async function addMemberByEmail(input: {
  workspaceId: string;
  email: string;
  role: MembershipRole;
}): Promise<{ ok: true } | { ok: false; reason: "not_found" | "already_member" }> {
  const email = input.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { ok: false, reason: "not_found" };

  const existing = await prisma.membership.findUnique({
    where: {
      userId_workspaceId: { userId: user.id, workspaceId: input.workspaceId },
    },
  });
  if (existing) return { ok: false, reason: "already_member" };

  await prisma.membership.create({
    data: {
      userId: user.id,
      workspaceId: input.workspaceId,
      role: input.role,
    },
  });
  return { ok: true };
}
