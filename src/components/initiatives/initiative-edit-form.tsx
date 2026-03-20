"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AiSuggestButton } from "@/components/ai/ai-suggest-button";

export function InitiativeEditForm({
  workspaceId,
  initiative,
}: {
  workspaceId: string;
  initiative: {
    id: string;
    name: string;
    description: string | null;
    timelineLabel: string | null;
    targetCompletionAt: Date | string | null;
  };
}) {
  const router = useRouter();
  const [name, setName] = useState(initiative.name);
  const [description, setDescription] = useState(initiative.description ?? "");
  const [timelineLabel, setTimelineLabel] = useState(
    initiative.timelineLabel ?? "",
  );
  const [targetCompletionAt, setTargetCompletionAt] = useState(
    initiative.targetCompletionAt
      ? new Date(initiative.targetCompletionAt).toISOString().slice(0, 10)
      : "",
  );
  const [msg, setMsg] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await fetch(`/api/initiatives/${initiative.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim() || null,
        timelineLabel: timelineLabel.trim() || null,
        targetCompletionAt: targetCompletionAt.trim() || null,
      }),
    });
    if (!res.ok) {
      setMsg("Could not save.");
      return;
    }
    setMsg("Saved.");
    router.refresh();
  }

  return (
    <form
      onSubmit={save}
      className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
          Initiative details
        </h2>
        <AiSuggestButton
          workspaceId={workspaceId}
          entity="initiative"
          title={name}
          description={description}
          onResult={(d) => {
            if (typeof d.description === "string") setDescription(d.description);
            if (typeof d.timelineLabel === "string") setTimelineLabel(d.timelineLabel);
            if (d.targetCompletionAt === null || typeof d.targetCompletionAt === "string") {
              setTargetCompletionAt(
                d.targetCompletionAt ? String(d.targetCompletionAt).slice(0, 10) : "",
              );
            }
          }}
        />
      </div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name (required)"
        className="rounded border border-zinc-300 px-2 py-2 text-xl font-semibold dark:border-zinc-600"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        rows={3}
        className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600"
      />
      <div className="flex flex-wrap gap-3">
        <input
          value={timelineLabel}
          onChange={(e) => setTimelineLabel(e.target.value)}
          placeholder="Timeline e.g. Q2'27"
          className="min-w-[160px] flex-1 rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600"
        />
        <input
          type="date"
          value={targetCompletionAt}
          onChange={(e) => setTargetCompletionAt(e.target.value)}
          className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600"
        />
      </div>
      {msg ? <p className="text-xs text-emerald-700 dark:text-emerald-400">{msg}</p> : null}
      <button
        type="submit"
        className="w-fit rounded bg-zinc-800 px-3 py-1.5 text-sm text-white dark:bg-zinc-200 dark:text-zinc-900"
      >
        Save initiative
      </button>
    </form>
  );
}
