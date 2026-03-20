import { getAppSession } from "@/lib/auth";
import { jsonError } from "@/lib/http";

export async function GET() {
  const session = await getAppSession();
  if (!session) {
    return jsonError("Unauthorized", 401);
  }
  return Response.json({
    user: session.user,
    workspaces: session.memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      slug: m.workspace.slug,
      role: m.role,
    })),
  });
}
