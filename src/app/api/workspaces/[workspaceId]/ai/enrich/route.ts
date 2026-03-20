import { getAppSession } from "@/lib/auth";
import { canEditWorkspace } from "@/lib/authz";
import { enrichEntity } from "@/lib/llm/enrich-entity";
import { jsonError } from "@/lib/http";
import { resolveLlmApiKey } from "@/lib/services/workspace-ai";
import { aiEnrichBodySchema } from "@/lib/validations/api";

const AI_HINT =
  "Enable AI in Settings (admin) and add an OpenAI key, or set OPENAI_API_KEY for the server.";

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
  const parsed = aiEnrichBodySchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid request", 400);

  const creds = await resolveLlmApiKey(workspaceId);
  if (!creds) {
    return Response.json(
      { error: "AI assist is not available for this workspace.", hint: AI_HINT },
      { status: 503 },
    );
  }
  if (creds.provider !== "OPENAI") {
    return Response.json(
      { error: "Only OpenAI enrichment is wired in this build.", hint: AI_HINT },
      { status: 501 },
    );
  }

  try {
    const out = await enrichEntity({
      apiKey: creds.apiKey,
      entity: parsed.data.entity,
      context: {
        title: parsed.data.title,
        description: parsed.data.description,
        plotName: parsed.data.plotName,
      },
    });
    return Response.json({ ...out, hint: undefined });
  } catch {
    return Response.json(
      { error: "AI request failed. Try again.", hint: AI_HINT },
      { status: 502 },
    );
  }
}
