"use client";

import type { Plot } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AiSuggestButton } from "@/components/ai/ai-suggest-button";

export function PlotDetailsSection({
  workspaceId,
  plot,
}: {
  workspaceId: string;
  plot: Plot;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
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
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-zinc-50/40 p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">{plot.name}</h1>
            {plot.description ? (
              <p className="mt-2 whitespace-pre-wrap text-zinc-600 dark:text-zinc-400">
                {plot.description}
              </p>
            ) : (
              <p className="mt-2 text-sm italic text-zinc-400">No description</p>
            )}
            {plot.timelineLabel ? (
              <p className="mt-2 text-sm text-zinc-500">
                Planning: <span className="font-medium text-zinc-700 dark:text-zinc-300">{plot.timelineLabel}</span>
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => {
              setMsg("");
              setName(plot.name);
              setDescription(plot.description ?? "");
              setTimelineLabel(plot.timelineLabel ?? "");
              setEditing(true);
            }}
            className="shrink-0 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-white dark:border-zinc-600 dark:hover:bg-zinc-800"
          >
            Edit details
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={save}
      className="flex flex-col gap-3 rounded-xl border border-emerald-200/60 bg-emerald-50/30 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
          Edit plot
        </h2>
        <div className="flex flex-wrap gap-2">
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
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setName(plot.name);
              setDescription(plot.description ?? "");
              setTimelineLabel(plot.timelineLabel ?? "");
              setMsg("");
            }}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
          >
            Cancel
          </button>
        </div>
      </div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="rounded border border-zinc-300 px-2 py-2 text-xl font-semibold dark:border-zinc-600"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        rows={4}
        className="rounded border border-zinc-300 px-2 py-2 text-sm dark:border-zinc-600"
      />
      <input
        value={timelineLabel}
        onChange={(e) => setTimelineLabel(e.target.value)}
        placeholder="Planning label e.g. Q3'27 (optional)"
        className="rounded border border-zinc-300 px-2 py-2 text-sm dark:border-zinc-600"
      />
      {msg ? <p className="text-xs text-emerald-700 dark:text-emerald-400">{msg}</p> : null}
      <button
        type="submit"
        className="w-fit rounded bg-emerald-700 px-4 py-2 text-sm font-medium text-white"
      >
        Save changes
      </button>
    </form>
  );
}
