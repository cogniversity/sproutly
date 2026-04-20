"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AiSuggestButton } from "@/components/ai/ai-suggest-button";
import { quarterLabelFromDate } from "@/lib/timeline";

type InitiativeRow = {
  id: string;
  name: string;
  description: string | null;
  timelineLabel: string | null;
  targetCompletionAt: Date | string | null;
  plots: { plot: { id: string; name: string } }[];
  sprouts: { sprout: { id: string; title: string } }[];
};

export function InitiativesBoard({
  workspaceId,
  initial,
}: {
  workspaceId: string;
  initial: InitiativeRow[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [timelineLabel, setTimelineLabel] = useState("");
  const [targetCompletionAt, setTargetCompletionAt] = useState("");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const res = await fetch(`/api/workspaces/${workspaceId}/initiatives`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim() || null,
        timelineLabel: timelineLabel.trim() || null,
        targetCompletionAt: targetCompletionAt.trim() || null,
      }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { initiative: InitiativeRow };
    setItems((x) => [data.initiative, ...x]);
    setName("");
    setDescription("");
    setTimelineLabel("");
    setTargetCompletionAt("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={create}
        className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
      >
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-semibold">New initiative</h2>
          <AiSuggestButton
            workspaceId={workspaceId}
            entity="initiative"
            title={name}
            description={description}
            onResult={(d) => {
              if (typeof d.description === "string") setDescription(d.description);
              if (d.targetCompletionAt === null || typeof d.targetCompletionAt === "string") {
                const nextDate = d.targetCompletionAt
                  ? String(d.targetCompletionAt).slice(0, 10)
                  : "";
                setTargetCompletionAt(
                  nextDate,
                );
                if (nextDate) {
                  setTimelineLabel(quarterLabelFromDate(nextDate));
                } else if (typeof d.timelineLabel === "string") {
                  setTimelineLabel(d.timelineLabel);
                }
              } else if (typeof d.timelineLabel === "string") {
                setTimelineLabel(d.timelineLabel);
              }
            }}
          />
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (required)"
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          rows={2}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600"
        />
        <div className="flex flex-wrap gap-3">
          <input
            value={timelineLabel}
            onChange={(e) => setTimelineLabel(e.target.value)}
            placeholder="Timeline e.g. Q2'27"
            className="min-w-[160px] flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600"
          />
          <input
            type="date"
            value={targetCompletionAt}
            onChange={(e) => {
              const nextDate = e.target.value;
              setTargetCompletionAt(nextDate);
              const quarterLabel = quarterLabelFromDate(nextDate);
              if (quarterLabel) setTimelineLabel(quarterLabel);
            }}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600"
          />
        </div>
        <button
          type="submit"
          className="w-fit rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white"
        >
          Create
        </button>
      </form>

      <ul className="flex flex-col gap-3">
        {items.length === 0 ? (
          <li className="text-zinc-500">No cross-plot initiatives yet.</li>
        ) : (
          items.map((i) => (
            <li key={i.id}>
              <Link
                href={`/app/initiatives/${i.id}`}
                className="block rounded-lg border border-zinc-200 px-4 py-3 hover:border-emerald-600/40 dark:border-zinc-700"
              >
                <span className="font-medium">{i.name}</span>
                {i.timelineLabel ? (
                  <span className="ml-2 text-sm text-zinc-500">{i.timelineLabel}</span>
                ) : null}
                <p className="mt-1 text-xs text-zinc-500">
                  {i.plots.length} plot(s) · {i.sprouts.length} sprout(s)
                </p>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
