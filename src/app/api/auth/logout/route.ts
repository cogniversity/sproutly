import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { logoutSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

export async function POST() {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  await logoutSession(raw);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  return res;
}
