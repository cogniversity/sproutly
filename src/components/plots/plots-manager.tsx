"use client";

import type { Plot } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AiSuggestButton } from "@/components/ai/ai-suggest-button";

export function PlotsManager({
  workspaceId,
  initialPlots,
}: {
  workspaceId: string;
  initialPlots: Plot[];
}) {
  const router = useRouter();
  const [plots, setPlots] = useState(initialPlots);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [timelineLabel, setTimelineLabel] = useState("");

  async function createPlot(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const res = await fetch(`/api/workspaces/${workspaceId}/plots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim() || null,
        timelineLabel: timelineLabel.trim() || null,
      }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { plot: Plot };
    setPlots((p) => [...p, data.plot]);
    setName("");
    setDescription("");
    setTimelineLabel("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={createPlot}
        className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
      >
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            New plot
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
          placeholder="Name (required)"
          className="min-w-[240px] rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          rows={2}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
        />
        <input
          value={timelineLabel}
          onChange={(e) => setTimelineLabel(e.target.value)}
          placeholder="Planning label e.g. Q3'27 (optional)"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
        />
        <button
          type="submit"
          className="w-fit rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          Add plot
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {plots.length === 0 ? (
          <li className="text-zinc-500">No plots yet. Create one to start planting Sprouts.</li>
        ) : (
          plots.map((p) => (
            <li key={p.id}>
              <Link
                href={`/app/plots/${p.id}`}
                className="block rounded-lg border border-zinc-200 px-4 py-3 hover:border-emerald-600/40 hover:bg-emerald-50/50 dark:border-zinc-700 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-950/20"
              >
                <span className="font-medium">{p.name}</span>
                {p.timelineLabel ? (
                  <span className="ml-2 text-sm text-zinc-500">· {p.timelineLabel}</span>
                ) : null}
                {p.description ? (
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {p.description}
                  </p>
                ) : null}
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
