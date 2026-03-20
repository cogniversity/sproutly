import type { LlmProvider } from "@prisma/client";

type Entity = "plot" | "sprout" | "initiative";

const INSTRUCTIONS: Record<
  Entity,
  { system: string; userTemplate: (ctx: EnrichContext) => string }
> = {
  plot: {
    system: `You help product teams. Return ONLY valid JSON with keys: description (string, optional), timelineLabel (string, optional, e.g. Q3'27 or 2027-H2). No markdown.`,
    userTemplate: (c) =>
      `Plot title (required): ${c.title}\nExisting description: ${c.description ?? "(none)"}\nSuggest concise description and an optional planning label for this product/stream.`,
  },
  sprout: {
    system: `Return ONLY valid JSON: description (string), timelineLabel (string or empty), targetCompletionAt (string ISO date YYYY-MM-DD or null). No markdown.`,
    userTemplate: (c) =>
      `Sprout title: ${c.title}\nPlot: ${c.plotName ?? "unknown"}\nExisting description: ${c.description ?? "(none)"}\nSuggest description, a label like Q1'28 if appropriate, and a realistic target completion date or null.`,
  },
  initiative: {
    system: `Return ONLY valid JSON: description (string), timelineLabel (string or empty), targetCompletionAt (string ISO YYYY-MM-DD or null). No markdown.`,
    userTemplate: (c) =>
      `Initiative name: ${c.title}\nExisting description: ${c.description ?? "(none)"}\nSuggest description, planning label, optional target completion date.`,
  },
};

export type EnrichContext = {
  title: string;
  description?: string | null;
  plotName?: string | null;
};

export type EnrichPlotResult = { description?: string; timelineLabel?: string };
export type EnrichSproutResult = {
  description?: string;
  timelineLabel?: string;
  targetCompletionAt?: string | null;
};
export type EnrichInitiativeResult = EnrichSproutResult;

export async function enrichEntity(input: {
  apiKey: string;
  entity: Entity;
  context: EnrichContext;
}): Promise<EnrichPlotResult | EnrichSproutResult> {
  const cfg = INSTRUCTIONS[input.entity];
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: cfg.system },
        { role: "user", content: cfg.userTemplate(input.context) },
      ],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${err.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error("Empty model response");
  return JSON.parse(raw) as EnrichPlotResult & EnrichSproutResult;
}

export function providerLabel(p: LlmProvider): string {
  switch (p) {
    case "OPENAI":
      return "OpenAI";
    case "ANTHROPIC":
      return "Anthropic";
    case "GOOGLE":
      return "Google";
    default:
      return "LLM";
  }
}
