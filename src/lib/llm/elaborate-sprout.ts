export type ElaborationSuggestion = { title: string; description?: string };

const SYSTEM = `You are a product/engineering planning assistant. Given a feature or task title (and optional description), respond with ONLY valid JSON: {"suggestions":[{"title":"string","description":"optional short string"}]} with 3-8 concrete, actionable sub-items. No markdown, no prose outside JSON.`;

export async function elaborateWithOpenAI(input: {
  apiKey: string;
  sproutTitle: string;
  sproutDescription?: string | null;
  plotName?: string;
}): Promise<ElaborationSuggestion[]> {
  const user = `Plot / product: ${input.plotName ?? "(unknown)"}\nTitle: ${input.sproutTitle}\nDescription: ${input.sproutDescription ?? "(none)"}`;
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: user },
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
  const parsed = JSON.parse(raw) as { suggestions?: ElaborationSuggestion[] };
  if (!Array.isArray(parsed.suggestions)) {
    throw new Error("Invalid JSON shape from model");
  }
  return parsed.suggestions.filter(
    (s) => s && typeof s.title === "string" && s.title.trim().length > 0,
  );
}

