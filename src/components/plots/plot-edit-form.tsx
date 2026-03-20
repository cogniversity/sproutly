"use client";

import type { Plot } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AiSuggestButton } from "@/components/ai/ai-suggest-button";

export function PlotEditForm({
  workspaceId,
  plot,
}: {
  workspaceId: string;
  plot: Plot;
}) {
  const router = useRouter();
  const [name, setName] = useState(plot.name);
  const [description, setDescription] = useState(plot.description ?? "");
  const [timelineLabel, setTimelineLabel] = useState(plot.timelineLabel ?? "");
  const [msg, setMsg] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await fetch(`/api/plots/${plot.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim() || null,
        timelineLabel: timelineLabel.trim() || null,
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
    <form onSubmit={save} className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
          Plot details
        </h2>
        <AiSuggestButton
          workspaceId={workspaceId}
          entity="plot"
          title={name}
          description={description}
          onResult={(d) => {
            if (typeof d.description === "string") setDescription(d.description);
            if (typeof d.timelineLabel === "string") setTimelineLabel(d.timelineLabel);
          }}
        />
      </div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        rows={3}
        className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600"
      />
      <input
        value={timelineLabel}
        onChange={(e) => setTimelineLabel(e.target.value)}
        placeholder="Planning label e.g. Q3'27 (optional)"
        className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600"
      />
      {msg ? <p className="text-xs text-emerald-700 dark:text-emerald-400">{msg}</p> : null}
      <button
        type="submit"
        className="w-fit rounded bg-zinc-800 px-3 py-1.5 text-sm text-white dark:bg-zinc-200 dark:text-zinc-900"
      >
        Save plot
      </button>
    </form>
  );
}
