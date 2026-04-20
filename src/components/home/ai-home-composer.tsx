"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { InlineNotice } from "@/components/ui/inline-notice";
import type { AiComposerDraft } from "@/lib/ai-composer";

export function AiHomeComposer({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function createDraft() {
    if (!prompt.trim()) {
      setError("Describe what you want to create first.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/ai/compose-draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        draft?: AiComposerDraft;
        error?: string;
        hint?: string;
      };
      if (!res.ok || !data.draft) {
        setError([data.error, data.hint].filter(Boolean).join(" ") || "Could not draft from AI.");
        return;
      }

      const draftId = crypto.randomUUID();
      sessionStorage.setItem(
        `ai-composer-draft:${draftId}`,
        JSON.stringify({
          originalPrompt: prompt.trim(),
          draft: data.draft,
        }),
      );
      router.push(`/app/compose/review?draft=${encodeURIComponent(draftId)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 dark:border-emerald-900 dark:bg-emerald-950/20">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-emerald-900 dark:text-emerald-200">
            AI Composer
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Describe work in plain English. AI will draft new sprouts, initiatives,
            harvests, and links, then send you to a review screen where you can edit
            or partially accept the proposal.
          </p>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={6}
          placeholder="Example: Create a feature for Audience Agent with tasks for copy, landing page, and analytics. Also create a Q4 launch initiative and include those sprouts."
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />

        <div className="flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="rounded-full bg-white px-3 py-1 dark:bg-zinc-900">
            Create only
          </span>
          <span className="rounded-full bg-white px-3 py-1 dark:bg-zinc-900">
            Sprouts + initiatives + harvests
          </span>
          <span className="rounded-full bg-white px-3 py-1 dark:bg-zinc-900">
            Review before apply
          </span>
        </div>

        {error ? <InlineNotice message={error} tone="error" /> : null}

        <div className="flex justify-end">
          <button
            type="button"
            disabled={busy}
            onClick={() => void createDraft()}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {busy ? "Drafting…" : "Draft with AI"}
          </button>
        </div>
      </div>
    </div>
  );
}
