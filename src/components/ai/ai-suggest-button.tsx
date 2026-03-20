"use client";

import { useState } from "react";

type Entity = "plot" | "sprout" | "initiative";

export function AiSuggestButton({
  workspaceId,
  entity,
  title,
  description,
  plotName,
  onResult,
  label = "Suggest with AI",
}: {
  workspaceId: string;
  entity: Entity;
  title: string;
  description?: string;
  plotName?: string;
  onResult: (data: Record<string, unknown>) => void;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);

  async function run() {
    if (!title.trim()) {
      alert("Add a title first so AI has context.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/ai/enrich`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity,
          title: title.trim(),
          description: description?.trim() || null,
          plotName: plotName?.trim() || null,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        hint?: string;
      } & Record<string, unknown>;
      if (!res.ok) {
        alert(data.error ?? "AI unavailable.");
        return;
      }
      delete data.error;
      delete data.hint;
      onResult(data);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => void run()}
      className="rounded-lg border border-emerald-600/40 px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-50 disabled:opacity-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
    >
      {busy ? "…" : label}
    </button>
  );
}
