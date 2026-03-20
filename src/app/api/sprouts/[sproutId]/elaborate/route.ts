import { getAppSession } from "@/lib/auth";
import { canEditWorkspace } from "@/lib/authz";
import { elaborateWithOpenAI } from "@/lib/llm/elaborate-sprout";
import { jsonError } from "@/lib/http";
import * as sprouts from "@/lib/services/sprouts";
import { resolveLlmApiKey } from "@/lib/services/workspace-ai";
import { elaborateSproutBodySchema } from "@/lib/validations/api";

const AI_HINT =
  "Enable AI in Settings (admin) with an OpenAI API key, or set OPENAI_API_KEY on the server.";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ sproutId: string }> },
) {
  const { sproutId } = await ctx.params;
  const session = await getAppSession();
  if (!session) return jsonError("Unauthorized", 401);

  const sprout = await sprouts.getSproutById(sproutId);
  if (!sprout) return jsonError("Not found", 404);
  const wsId = sprout.plot.workspaceId;
  if (!canEditWorkspace(session, wsId)) {
    return jsonError("Forbidden", 403);
  }

  let body: unknown = {};
  try {
    const t = await req.text();
    if (t) body = JSON.parse(t);
  } catch {
    return jsonError("Invalid JSON", 400);
  }
  const parsed = elaborateSproutBodySchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid request", 400);

  const creds = await resolveLlmApiKey(wsId);
  if (!creds) {
    return Response.json(
      { error: "AI assist is not available for this workspace.", hint: AI_HINT },
      { status: 503 },
    );
  }

  let suggestions;
  try {
    if (creds.provider !== "OPENAI") {
      return Response.json(
        { error: "Only OpenAI is supported for elaboration in this build.", hint: AI_HINT },
        { status: 501 },
      );
    }
    suggestions = await elaborateWithOpenAI({
      apiKey: creds.apiKey,
      sproutTitle: sprout.title,
      sproutDescription: sprout.description,
      plotName: sprout.plot.name,
    });
  } catch {
    return Response.json(
      { error: "AI assist failed. Try again later.", hint: AI_HINT },
      { status: 502 },
    );
  }

  if (parsed.data.create) {
    const created = await sprouts.createChildSprouts(
      sproutId,
      sprout.plotId,
      suggestions,
    );
    return Response.json({ suggestions, created });
  }

  return Response.json({ suggestions });
}
