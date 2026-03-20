import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import type { MembershipRole, User, Workspace } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateSessionToken, hashSessionToken } from "@/lib/token";

export const SESSION_COOKIE = "sproutly_session";
const SESSION_DAYS = 30;

export type SessionWorkspace = Pick<Workspace, "id" | "name" | "slug">;

export type AppSession = {
  user: Pick<User, "id" | "email" | "name">;
  memberships: { role: MembershipRole; workspace: SessionWorkspace }[];
};

function sessionExpiry(): Date {
  return new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
}

export async function registerUser(input: {
  email: string;
  password: string;
  name: string;
}): Promise<{ sessionToken: string; session: AppSession }> {
  const passwordHash = await bcrypt.hash(input.password, 12);
  const baseSlug =
    input.email
      .split("@")[0]
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "workspace";
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        name: input.name,
      },
    });
    const workspace = await tx.workspace.create({
      data: {
        name: `${input.name}'s workspace`,
        slug,
      },
    });
    await tx.membership.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        role: "ADMIN",
      },
    });
    const token = generateSessionToken();
    const tokenHash = hashSessionToken(token);
    await tx.session.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt: sessionExpiry(),
      },
    });
    return { user, workspace, token };
  });

  const session = await loadAppSession(result.user.id);
  if (!session) {
    throw new Error("Session load failed after register");
  }
  return { sessionToken: result.token, session };
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ sessionToken: string; session: AppSession } | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;

  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  await prisma.session.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt: sessionExpiry(),
    },
  });

  const session = await loadAppSession(user.id);
  if (!session) return null;
  return { sessionToken: token, session };
}

export async function logoutSession(rawToken: string | undefined): Promise<void> {
  if (!rawToken) return;
  const tokenHash = hashSessionToken(rawToken);
  await prisma.session.deleteMany({ where: { tokenHash } });
}

export async function getAppSession(): Promise<AppSession | null> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const tokenHash = hashSessionToken(raw);
  const row = await prisma.session.findFirst({
    where: {
      tokenHash,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: {
        include: {
          memberships: { include: { workspace: true } },
        },
      },
    },
  });
  if (!row) return null;
  return {
    user: {
      id: row.user.id,
      email: row.user.email,
      name: row.user.name,
    },
    memberships: row.user.memberships.map((m) => ({
      role: m.role,
      workspace: {
        id: m.workspace.id,
        name: m.workspace.name,
        slug: m.workspace.slug,
      },
    })),
  };
}

async function loadAppSession(userId: string): Promise<AppSession | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      memberships: { include: { workspace: true } },
    },
  });
  if (!user) return null;
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    memberships: user.memberships.map((m) => ({
      role: m.role,
      workspace: {
        id: m.workspace.id,
        name: m.workspace.name,
        slug: m.workspace.slug,
      },
    })),
  };
}

export function sessionCookieOptions() {
  return {
    httpOnly: true as const,
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}
