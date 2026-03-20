import { getAppSession } from "@/lib/auth";
import { canAdminWorkspace } from "@/lib/authz";
import { jsonError } from "@/lib/http";
import {
  getAiSettings,
  maskApiKey,
  patchAiSettings,
} from "@/lib/services/workspace-ai";
import { patchAiSettingsSchema } from "@/lib/validations/api";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ workspaceId: string }> },
) {
  const { workspaceId } = await ctx.params;
  const session = await getAppSession();
  if (!session) return jsonError("Unauthorized", 401);
  if (!canAdminWorkspace(session, workspaceId)) {
    return jsonError("Forbidden", 403);
  }

  const row = await getAiSettings(workspaceId);
  return Response.json({
    enabled: row?.enabled ?? false,
    provider: row?.provider ?? null,
    apiKeyMasked: maskApiKey(row?.apiKey),
  });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ workspaceId: string }> },
) {
  const { workspaceId } = await ctx.params;
  const session = await getAppSession();
  if (!session) return jsonError("Unauthorized", 401);
  if (!canAdminWorkspace(session, workspaceId)) {
    return jsonError("Forbidden", 403);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }
  const parsed = patchAiSettingsSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid request", 400);

  const row = await patchAiSettings({
    workspaceId,
    enabled: parsed.data.enabled,
    provider: parsed.data.provider,
    apiKey: parsed.data.apiKey,
  });

  return Response.json({
    enabled: row.enabled,
    provider: row.provider,
    apiKeyMasked: maskApiKey(row.apiKey),
  });
}
