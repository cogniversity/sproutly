"use client";

import type { Sprout, SproutStatus, User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AiSuggestButton } from "@/components/ai/ai-suggest-button";
import { toDateInputLocal } from "@/lib/date-parse";
import { formatPlanningLine } from "@/lib/timeline";

export type SproutRow = Sprout & {
  owner: Pick<User, "id" | "name" | "email"> | null;
};

const STATUSES: SproutStatus[] = [
  "BACKLOG",
  "IN_PROGRESS",
  "PAUSED",
  "DEPRIORITIZED",
  "BLOCKED",
  "DONE",
];

export function PlotSproutsManager({
  plotId,
  workspaceId,
  plotName,
  initialSprouts,
}: {
  plotId: string;
  workspaceId: string;
  plotName: string;
  initialSprouts: SproutRow[];
}) {
  const router = useRouter();
  const [sprouts, setSprouts] = useState(initialSprouts);
  const [title, setTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTimeline, setNewTimeline] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [aiPreview, setAiPreview] = useState<{
    sproutId: string;
    suggestions: { title: string; description?: string }[];
  } | null>(null);
  const [aiBusy, setAiBusy] = useState<string | null>(null);

  async function createSprout(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const res = await fetch(`/api/plots/${plotId}/sprouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: newDescription.trim() || null,
        timelineLabel: newTimeline.trim() || null,
        targetCompletionAt: newTarget.trim() || null,
      }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { sprout: SproutRow };
    setSprouts((s) => [data.sprout, ...s]);
    setTitle("");
    setNewDescription("");
    setNewTimeline("");
    setNewTarget("");
    router.refresh();
  }

  async function patchSprout(
    id: string,
    patch: Record<
      string,
      string | SproutStatus | null | undefined
    >,
  ) {
    const res = await fetch(`/api/sprouts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { sprout: SproutRow };
    setSprouts((s) => s.map((x) => (x.id === id ? data.sprout : x)));
    router.refresh();
  }

  async function removeSprout(id: string) {
    if (!confirm("Delete this Sprout?")) return;
    const res = await fetch(`/api/sprouts/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setSprouts((s) => s.filter((x) => x.id !== id));
    router.refresh();
  }

  async function elaborate(sproutId: string, create: boolean) {
    setAiBusy(sproutId);
    if (!create) setAiPreview(null);
    try {
      const res = await fetch(`/api/sprouts/${sproutId}/elaborate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ create }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        suggestions?: { title: string; description?: string }[];
        created?: SproutRow[];
        error?: string;
        hint?: string;
      };
      if (!res.ok) {
        alert([data.error, data.hint].filter(Boolean).join("\n\n"));
        return;
      }
      if (create && data.created?.length) {
        setSprouts((prev) => [...data.created!, ...prev]);
        setAiPreview(null);
        router.refresh();
        return;
      }
      if (data.suggestions?.length) {
        setAiPreview({ sproutId, suggestions: data.suggestions });
      }
    } finally {
      setAiBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={createSprout} className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-semibold">New sprout</h2>
          <AiSuggestButton
            workspaceId={workspaceId}
            entity="sprout"
            title={title}
            description={newDescription}
            plotName={plotName}
            onResult={(d) => {
              if (typeof d.description === "string") setNewDescription(d.description);
              if (typeof d.timelineLabel === "string") setNewTimeline(d.timelineLabel);
              if (d.targetCompletionAt === null || typeof d.targetCompletionAt === "string") {
                setNewTarget(
                  d.targetCompletionAt
                    ? String(d.targetCompletionAt).slice(0, 10)
                    : "",
                );
              }
            }}
          />
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (required)"
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600"
          required
        />
        <textarea
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          placeholder="Description (optional)"
          rows={2}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600"
        />
        <div className="flex flex-wrap gap-3">
          <input
            value={newTimeline}
            onChange={(e) => setNewTimeline(e.target.value)}
            placeholder="Timeline e.g. Q1'28"
            className="min-w-[160px] flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600"
          />
          <input
            type="date"
            value={newTarget}
            onChange={(e) => setNewTarget(e.target.value)}
            className="min-h-[2.5rem] min-w-[10rem] rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600"
          />
        </div>
        <button
          type="submit"
          className="w-fit rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white"
        >
          Add sprout
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50">
            <tr>
              <th className="px-3 py-2 font-medium">Title</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Planning</th>
              <th className="px-3 py-2 font-medium">Derived</th>
              <th className="px-3 py-2 font-medium">Owner</th>
              <th className="px-3 py-2 font-medium">AI</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {sprouts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-zinc-500">
                  No Sprouts in this plot yet.
                </td>
              </tr>
            ) : (
              sprouts.map((s) => (
                <SproutRowFields
                  key={`${s.id}-${s.updatedAt.toString()}`}
                  s={s}
                  aiBusy={aiBusy}
                  onPatch={patchSprout}
                  onRemove={removeSprout}
                  onSuggestTasks={(id) => void elaborate(id, false)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {aiPreview ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 text-sm dark:border-emerald-900 dark:bg-emerald-950/30">
          <p className="font-medium text-emerald-900 dark:text-emerald-200">
            Suggested breakdown
          </p>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Review below. Accept to add these as sub-sprouts, or dismiss to discard.
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            {aiPreview.suggestions.map((x, i) => (
              <li key={i}>
                {x.title}
                {x.description ? (
                  <span className="block text-xs text-zinc-600 dark:text-zinc-400">
                    {x.description}
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={aiBusy !== null}
              onClick={() => void elaborate(aiPreview.sproutId, true)}
              className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {aiBusy ? "Working…" : "Accept — create sub-sprouts"}
            </button>
            <button
              type="button"
              disabled={aiBusy !== null}
              onClick={() => setAiPreview(null)}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SproutRowFields({
  s,
  aiBusy,
  onPatch,
  onRemove,
  onSuggestTasks,
}: {
  s: SproutRow;
  aiBusy: string | null;
  onPatch: (
    id: string,
    p: Record<string, string | SproutStatus | null | undefined>,
  ) => void | Promise<void>;
  onRemove: (id: string) => void;
  onSuggestTasks: (id: string) => void;
}) {
  const [rowTitle, setRowTitle] = useState(s.title);
  const [rowDesc, setRowDesc] = useState(s.description ?? "");
  const [tl, setTl] = useState(s.timelineLabel ?? "");
  const [dateVal, setDateVal] = useState(() =>
    toDateInputLocal(s.targetCompletionAt),
  );

  return (
    <tr className="border-b border-zinc-100 dark:border-zinc-800">
      <td className="px-3 py-2 align-top font-medium">
        {s.parentSproutId ? <span className="text-zinc-400">↳ </span> : null}
        <input
          value={rowTitle}
          onChange={(e) => setRowTitle(e.target.value)}
          onBlur={() => {
            const v = rowTitle.trim();
            if (v && v !== s.title) void onPatch(s.id, { title: v });
          }}
          className="w-full rounded border border-transparent px-1 py-0.5 font-medium hover:border-zinc-200 dark:hover:border-zinc-700"
        />
        <textarea
          value={rowDesc}
          onChange={(e) => setRowDesc(e.target.value)}
          placeholder="Description"
          rows={2}
          onBlur={() => {
            const v = rowDesc.trim();
            const next = v || null;
            if (next !== (s.description ?? null)) void onPatch(s.id, { description: next });
          }}
          className="mt-1 w-full resize-y rounded border border-transparent px-1 py-0.5 text-xs font-normal text-zinc-600 hover:border-zinc-200 dark:text-zinc-400 dark:hover:border-zinc-700"
        />
      </td>
      <td className="px-3 py-2 align-top">
        <select
          value={s.status}
          onChange={(e) =>
            void onPatch(s.id, { status: e.target.value as SproutStatus })
          }
          className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-600 dark:bg-zinc-900"
        >
          {STATUSES.map((st) => (
            <option key={st} value={st}>
              {st.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2 align-top">
        <input
          value={tl}
          onChange={(e) => setTl(e.target.value)}
          placeholder="Q3'27"
          onBlur={() => {
            const v = tl.trim();
            const next = v || null;
            if (next !== (s.timelineLabel ?? null)) {
              void onPatch(s.id, { timelineLabel: next });
            }
          }}
          className="mb-1 w-full rounded border border-zinc-300 px-1 py-0.5 text-xs dark:border-zinc-600"
        />
        <input
          type="date"
          value={dateVal}
          onChange={(e) => setDateVal(e.target.value)}
          onBlur={() => {
            const server = toDateInputLocal(s.targetCompletionAt);
            const next = dateVal.trim() || null;
            const normalized = next || null;
            if (normalized !== (server || null)) {
              void onPatch(s.id, { targetCompletionAt: normalized });
            }
          }}
          className="min-h-[2rem] w-full rounded border border-zinc-300 px-1 py-0.5 text-xs dark:border-zinc-600"
        />
      </td>
      <td className="px-3 py-2 align-top text-xs text-zinc-500">
        {formatPlanningLine(
          s.targetCompletionAt ? new Date(s.targetCompletionAt) : null,
          s.timelineLabel,
        )}
      </td>
      <td className="px-3 py-2 align-top text-zinc-600 dark:text-zinc-400">
        {s.owner?.name ?? "—"}
      </td>
      <td className="px-3 py-2 align-top">
        <button
          type="button"
          disabled={aiBusy === s.id}
          onClick={() => onSuggestTasks(s.id)}
          className="text-left text-xs text-emerald-700 underline disabled:opacity-50 dark:text-emerald-400"
        >
          {aiBusy === s.id ? "…" : "Suggest tasks"}
        </button>
      </td>
      <td className="px-3 py-2 align-top text-right">
        <button
          type="button"
          onClick={() => void onRemove(s.id)}
          className="text-xs text-red-600 dark:text-red-400"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
