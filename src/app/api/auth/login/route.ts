import { NextResponse } from "next/server";
import {
  loginUser,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { loginBodySchema } from "@/lib/validations/api";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = loginBodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid request", 400);
  }

  const result = await loginUser(parsed.data.email, parsed.data.password);
  if (!result) {
    return jsonError("Invalid email or password", 401);
  }

  const workspace = result.session.memberships[0]?.workspace;
  const res = NextResponse.json({
    user: result.session.user,
    workspace,
  });
  res.cookies.set(SESSION_COOKIE, result.sessionToken, sessionCookieOptions());
  return res;
}
