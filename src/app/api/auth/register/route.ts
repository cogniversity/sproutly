import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ACTIVE_WORKSPACE_COOKIE,
  activeWorkspaceCookieOptions,
} from "@/lib/active-workspace";
import {
  registerUser,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { registerBodySchema } from "@/lib/validations/api";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = registerBodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid request", 400);
  }

  const { password, name } = parsed.data;
  const emailNorm = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: emailNorm } });
  if (existing) {
    return jsonError("Email already registered", 409);
  }

  try {
    const { sessionToken, session } = await registerUser({
      email: emailNorm,
      password,
      name,
    });
    const workspace = session.memberships[0]?.workspace;
    const res = NextResponse.json(
      {
        user: session.user,
        workspace,
      },
      { status: 201 },
    );
    res.cookies.set(SESSION_COOKIE, sessionToken, sessionCookieOptions());
    if (workspace) {
      res.cookies.set(
        ACTIVE_WORKSPACE_COOKIE,
        workspace.id,
        activeWorkspaceCookieOptions(),
      );
    }
    return res;
  } catch {
    return jsonError("Registration failed", 500);
  }
}
