import { aiComposerDraftSchema, type AiComposerDraft } from "@/lib/ai-composer";

export async function composeWorkDraft(input: {
  apiKey: string;
  prompt: string;
  plotNames: string[];
}): Promise<AiComposerDraft> {
  const plotsText = input.plotNames.length
    ? input.plotNames.map((name) => `- ${name}`).join("\n")
    : "(no plots yet)";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You convert product planning text into a create-only draft for a planning app. Return ONLY valid JSON with keys: summary, sprouts, initiatives, harvests. " +
            "Use local ids like s1, s2, i1, h1. " +
            "Sprouts can be IDEA, FEATURE, BUG, DEBT, or TASK. " +
            "If a feature or idea has tasks, create a parent sprout and child task sprouts with parentLocalId set to the parent local id. " +
            "For initiatives and harvests, use linkedSproutLocalIds to reference proposed sprouts in the same response. " +
            "Create-only means do not propose updates to existing items. " +
            "Use plotName only when the prompt strongly implies a likely home plot name from the provided plot list. " +
            "Leave optional dates/labels null when unclear.",
        },
        {
          role: "user",
          content:
            `Available plot names:\n${plotsText}\n\n` +
            `User input:\n${input.prompt}\n\n` +
            "Return a concise summary and the proposed items.",
        },
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

  const parsed = aiComposerDraftSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new Error("Model response did not match expected draft shape");
  }

  return parsed.data;
}
