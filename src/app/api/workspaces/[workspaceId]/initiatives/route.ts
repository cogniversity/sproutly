import { getAppSession } from "@/lib/auth";
import {
  canEditWorkspace,
  canReadWorkspace,
} from "@/lib/authz";
import { optDate } from "@/lib/date-parse";
import { jsonError } from "@/lib/http";
import * as initiatives from "@/lib/services/initiatives";
import { createInitiativeBodySchema } from "@/lib/validations/api";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ workspaceId: string }> },
) {
  const { workspaceId } = await ctx.params;
  const session = await getAppSession();
  if (!session) return jsonError("Unauthorized", 401);
  if (!canReadWorkspace(session, workspaceId)) {
    return jsonError("Forbidden", 403);
  }
  const list = await initiatives.listInitiatives(workspaceId);
  return Response.json({ initiatives: list });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ workspaceId: string }> },
) {
  const { workspaceId } = await ctx.params;
  const session = await getAppSession();
  if (!session) return jsonError("Unauthorized", 401);
  if (!canEditWorkspace(session, workspaceId)) {
    return jsonError("Forbidden", 403);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }
  const parsed = createInitiativeBodySchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid request", 400);

  const { targetCompletionAt, ...ic } = parsed.data;
  const row = await initiatives.createInitiative({
    workspaceId,
    name: ic.name,
    description: ic.description,
    driUserId: ic.driUserId,
    startDate: optDate(ic.startDate ?? undefined) ?? null,
    endDate: optDate(ic.endDate ?? undefined) ?? null,
    timelineLabel: ic.timelineLabel,
    targetCompletionAt: optDate(targetCompletionAt ?? undefined),
  });
  return Response.json({ initiative: row }, { status: 201 });
}
