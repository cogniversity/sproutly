"use client";

import type { Sprout, SproutStatus, SproutType, User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AiSuggestButton } from "@/components/ai/ai-suggest-button";
import { ConfirmActionButton } from "@/components/ui/confirm-action-button";
import { InlineNotice } from "@/components/ui/inline-notice";
import { toDateInputLocal } from "@/lib/date-parse";
import { formatSproutTypeLabel, SPROUT_TYPES } from "@/lib/sprout-types";
import { quarterLabelFromDate } from "@/lib/timeline";

export type SproutRow = Sprout & {
  owner: Pick<User, "id" | "name" | "email"> | null;
  comments: SproutCommentRow[];
};

type SproutCommentRow = {
  id: string;
  body: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  author: Pick<User, "id" | "name" | "email">;
};

type SuggestedSprout = {
  title: string;
  description?: string;
};

const STATUSES: SproutStatus[] = [
  "BACKLOG",
  "IN_PROGRESS",
  "PAUSED",
  "DEPRIORITIZED",
  "BLOCKED",
  "DONE",
];

type SproutPatchValue = string | SproutStatus | SproutType | null | undefined;

type Notice = {
  tone: "success" | "error";
  message: string;
};

type SproutTreeRow = {
  sprout: SproutRow;
  depth: number;
  childCount: number;
  parentTitle: string | null;
  rootId: string;
};

type HierarchyViewMode =
  | "all"
  | "feature_idea_only"
  | "feature_idea_with_tasks"
  | "single_feature_idea";

function sortSproutsByUpdatedAtDesc(sprouts: SproutRow[]) {
  return [...sprouts].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

function buildSproutRows(sprouts: SproutRow[]): SproutTreeRow[] {
  const byId = new Map(sprouts.map((sprout) => [sprout.id, sprout]));
  const childrenByParent = new Map<string, SproutRow[]>();

  for (const sprout of sortSproutsByUpdatedAtDesc(sprouts)) {
    if (!sprout.parentSproutId || !byId.has(sprout.parentSproutId)) continue;
    const siblings = childrenByParent.get(sprout.parentSproutId) ?? [];
    siblings.push(sprout);
    childrenByParent.set(sprout.parentSproutId, siblings);
  }

  const roots = sortSproutsByUpdatedAtDesc(
    sprouts.filter(
      (sprout) => !sprout.parentSproutId || !byId.has(sprout.parentSproutId),
    ),
  );

  const rows: SproutTreeRow[] = [];

  function walk(sprout: SproutRow, depth: number, rootId: string) {
    const children = childrenByParent.get(sprout.id) ?? [];
    rows.push({
      sprout,
      depth,
      childCount: children.length,
      parentTitle: sprout.parentSproutId
        ? (byId.get(sprout.parentSproutId)?.title ?? null)
        : null,
      rootId,
    });

    for (const child of children) {
      walk(child, depth + 1, rootId);
    }
  }

  for (const root of roots) {
    walk(root, 0, root.id);
  }

  return rows;
}

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
  const [isComposerOpen, setIsComposerOpen] = useState(initialSprouts.length === 0);
  const [title, setTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newType, setNewType] = useState<SproutType>("IDEA");
  const [newTimeline, setNewTimeline] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [viewMode, setViewMode] = useState<HierarchyViewMode>("all");
  const [selectedRootId, setSelectedRootId] = useState("");
  const [aiPreview, setAiPreview] = useState<{
    sproutId: string;
    suggestions: SuggestedSprout[];
    selectedIndexes: number[];
  } | null>(null);
  const [aiBusy, setAiBusy] = useState<string | null>(null);

  useEffect(() => {
    setIsComposerOpen(sprouts.length === 0);
  }, [sprouts.length]);

  const sproutRows = buildSproutRows(sprouts);
  const featureIdeaRoots = sproutRows.filter(
    ({ sprout, depth }) =>
      depth === 0 && (sprout.type === "FEATURE" || sprout.type === "IDEA"),
  );
  const featureIdeaRootIds = new Set(featureIdeaRoots.map(({ sprout }) => sprout.id));

  useEffect(() => {
    if (featureIdeaRoots.length === 0) {
      if (selectedRootId !== "") setSelectedRootId("");
      return;
    }

    const hasSelectedRoot = featureIdeaRoots.some(
      ({ sprout }) => sprout.id === selectedRootId,
    );
    if (!hasSelectedRoot) {
      setSelectedRootId(featureIdeaRoots[0].sprout.id);
    }
  }, [featureIdeaRoots, selectedRootId]);

  const visibleRows = sproutRows.filter((row) => {
    switch (viewMode) {
      case "feature_idea_only":
        return (
          row.depth === 0 &&
          (row.sprout.type === "FEATURE" || row.sprout.type === "IDEA")
        );
      case "feature_idea_with_tasks":
        return featureIdeaRootIds.has(row.rootId);
      case "single_feature_idea":
        return selectedRootId ? row.rootId === selectedRootId : false;
      case "all":
      default:
        return true;
    }
  });

  async function createSprout(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setNotice(null);
    const res = await fetch(`/api/plots/${plotId}/sprouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: newDescription.trim() || null,
        type: newType,
        timelineLabel: newTimeline.trim() || null,
        targetCompletionAt: newTarget.trim() || null,
      }),
    });
    if (!res.ok) {
      setNotice({ tone: "error", message: "Could not create the sprout." });
      return;
    }
    const data = (await res.json()) as { sprout: SproutRow };
    setSprouts((s) => [data.sprout, ...s]);
    setTitle("");
    setNewDescription("");
    setNewType("IDEA");
    setNewTimeline("");
    setNewTarget("");
    setNotice({ tone: "success", message: "Sprout created." });
    router.refresh();
  }

  async function patchSprout(
    id: string,
    patch: Record<string, SproutPatchValue>,
  ) {
    setNotice(null);
    const res = await fetch(`/api/sprouts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      setNotice({ tone: "error", message: "Could not update the sprout." });
      return;
    }
    const data = (await res.json()) as { sprout: SproutRow };
    setSprouts((s) => s.map((x) => (x.id === id ? data.sprout : x)));
    router.refresh();
  }

  async function removeSprout(id: string) {
    setNotice(null);
    const res = await fetch(`/api/sprouts/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setNotice({ tone: "error", message: "Could not delete the sprout." });
      return;
    }
    setSprouts((s) => s.filter((x) => x.id !== id));
    setNotice({ tone: "success", message: "Sprout deleted." });
    router.refresh();
  }

  async function requestSuggestedBreakdown(sproutId: string) {
    setAiBusy(sproutId);
    setAiPreview(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/sprouts/${sproutId}/elaborate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ create: false }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        suggestions?: SuggestedSprout[];
        created?: SproutRow[];
        error?: string;
        hint?: string;
      };
      if (!res.ok) {
        setNotice({
          tone: "error",
          message:
            [data.error, data.hint].filter(Boolean).join(" ") ||
            "Could not generate a suggested breakdown.",
        });
        return;
      }
      if (data.suggestions?.length) {
        setAiPreview({
          sproutId,
          suggestions: data.suggestions,
          selectedIndexes: data.suggestions.map((_, index) => index),
        });
      }
    } finally {
      setAiBusy(null);
    }
  }

  async function createSelectedSuggestions() {
    if (!aiPreview) return;
    const selectedSuggestions = aiPreview.suggestions.filter((_, index) =>
      aiPreview.selectedIndexes.includes(index),
    );
    if (selectedSuggestions.length === 0) return;

    setAiBusy(aiPreview.sproutId);
    setNotice(null);
    try {
      const res = await fetch(`/api/sprouts/${aiPreview.sproutId}/elaborate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          create: true,
          selectedSuggestions,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        created?: SproutRow[];
        error?: string;
        hint?: string;
      };
      if (!res.ok) {
        setNotice({
          tone: "error",
          message:
            [data.error, data.hint].filter(Boolean).join(" ") ||
            "Could not create the selected sub-sprouts.",
        });
        return;
      }
      const created = data.created;
      if (created?.length) {
        setSprouts((prev) => [...created, ...prev]);
        setAiPreview(null);
        setNotice({
          tone: "success",
          message: `Created ${created.length} sub-sprout${created.length === 1 ? "" : "s"}.`,
        });
        router.refresh();
      }
    } finally {
      setAiBusy(null);
    }
  }

  function toggleSuggestedSuggestion(index: number) {
    setAiPreview((current) => {
      if (!current) return current;
      const selectedIndexes = current.selectedIndexes.includes(index)
        ? current.selectedIndexes.filter((value) => value !== index)
        : [...current.selectedIndexes, index].sort((a, b) => a - b);
      return {
        ...current,
        selectedIndexes,
      };
    });
  }

  function selectAllSuggestedSuggestions(selected: boolean) {
    setAiPreview((current) => {
      if (!current) return current;
      return {
        ...current,
        selectedIndexes: selected
          ? current.suggestions.map((_, index) => index)
          : [],
      };
    });
  }

  async function createComment(sproutId: string, body: string) {
    setNotice(null);
    const res = await fetch(`/api/sprouts/${sproutId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      comment?: SproutCommentRow;
      error?: string;
    };
    if (!res.ok || !data.comment) {
      setNotice({
        tone: "error",
        message: data.error ?? "Could not add the comment.",
      });
      return;
    }
    const comment = data.comment;
    setSprouts((current) =>
      current.map((sprout) =>
        sprout.id === sproutId
          ? { ...sprout, comments: [...sprout.comments, comment] }
          : sprout,
      ),
    );
    setNotice({ tone: "success", message: "Comment added." });
  }

  async function updateComment(
    sproutId: string,
    commentId: string,
    body: string,
  ) {
    setNotice(null);
    const res = await fetch(`/api/sprout-comments/${commentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      comment?: SproutCommentRow;
      error?: string;
    };
    if (!res.ok || !data.comment) {
      setNotice({
        tone: "error",
        message: data.error ?? "Could not update the comment.",
      });
      return;
    }
    const updatedComment = data.comment;
    setSprouts((current) =>
      current.map((sprout) =>
        sprout.id === sproutId
          ? {
              ...sprout,
              comments: sprout.comments.map((existingComment) =>
                existingComment.id === commentId ? updatedComment : existingComment,
              ),
            }
          : sprout,
      ),
    );
    setNotice({ tone: "success", message: "Comment updated." });
  }

  async function deleteComment(sproutId: string, commentId: string) {
    setNotice(null);
    const res = await fetch(`/api/sprout-comments/${commentId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setNotice({ tone: "error", message: "Could not delete the comment." });
      return;
    }
    setSprouts((current) =>
      current.map((sprout) =>
        sprout.id === sproutId
          ? {
              ...sprout,
              comments: sprout.comments.filter((comment) => comment.id !== commentId),
            }
          : sprout,
      ),
    );
    setNotice({ tone: "success", message: "Comment deleted." });
  }

  return (
    <div className="flex flex-col gap-8">
      {notice ? <InlineNotice message={notice.message} tone={notice.tone} /> : null}
      <details
        open={isComposerOpen}
        onToggle={(e) => setIsComposerOpen(e.currentTarget.open)}
        className="rounded-xl border border-zinc-200 dark:border-zinc-800"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold marker:hidden">
          <span>New sprout</span>
          <span
            className={`text-xs text-zinc-500 transition-transform ${
              isComposerOpen ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          >
            v
          </span>
        </summary>
        <form onSubmit={createSprout} className="flex flex-col gap-3 border-t border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex flex-wrap items-center gap-2">
            <AiSuggestButton
              workspaceId={workspaceId}
              entity="sprout"
              title={title}
              description={newDescription}
              plotName={plotName}
              onResult={(d) => {
                if (typeof d.description === "string") setNewDescription(d.description);
                if (d.targetCompletionAt === null || typeof d.targetCompletionAt === "string") {
                  const nextDate = d.targetCompletionAt
                    ? String(d.targetCompletionAt).slice(0, 10)
                    : "";
                  setNewTarget(
                    nextDate,
                  );
                  if (nextDate) {
                    setNewTimeline(quarterLabelFromDate(nextDate));
                  } else if (typeof d.timelineLabel === "string") {
                    setNewTimeline(d.timelineLabel);
                  }
                } else if (typeof d.timelineLabel === "string") {
                  setNewTimeline(d.timelineLabel);
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
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as SproutType)}
              className="min-w-[10rem] rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
            >
              {SPROUT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {formatSproutTypeLabel(type)}
                </option>
              ))}
            </select>
            <input
              value={newTimeline}
              onChange={(e) => setNewTimeline(e.target.value)}
              placeholder="Timeline e.g. Q1'28"
              className="min-w-[160px] flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600"
            />
            <input
              type="date"
              value={newTarget}
              onChange={(e) => {
                const nextDate = e.target.value;
                setNewTarget(nextDate);
                const quarterLabel = quarterLabelFromDate(nextDate);
                if (quarterLabel) setNewTimeline(quarterLabel);
              }}
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
      </details>

      <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex min-w-[220px] flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              View
            </span>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as HierarchyViewMode)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
            >
              <option value="all">All sprouts</option>
              <option value="feature_idea_only">Features and ideas only</option>
              <option value="feature_idea_with_tasks">
                Features and ideas with tasks
              </option>
              <option value="single_feature_idea">
                One feature or idea with its tasks
              </option>
            </select>
          </label>

          {viewMode === "single_feature_idea" ? (
            <label className="flex min-w-[260px] flex-col gap-1 text-sm">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                Feature or idea
              </span>
              <select
                value={selectedRootId}
                onChange={(e) => setSelectedRootId(e.target.value)}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                disabled={featureIdeaRoots.length === 0}
              >
                {featureIdeaRoots.length === 0 ? (
                  <option value="">No feature or idea roots yet</option>
                ) : (
                  featureIdeaRoots.map(({ sprout }) => (
                    <option key={sprout.id} value={sprout.id}>
                      {sprout.title}
                    </option>
                  ))
                )}
              </select>
            </label>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <p>Sprouts are grouped by parent so features stay above their sub-sprouts.</p>
          <p>Showing {visibleRows.length} of {sproutRows.length} sprouts.</p>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50">
            <tr>
              <th className="px-3 py-2 font-medium">Title</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Planning</th>
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
            ) : visibleRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-zinc-500">
                  {viewMode === "single_feature_idea"
                    ? "No sprouts in this feature or idea yet."
                    : "No sprouts match the current hierarchy view."}
                </td>
              </tr>
            ) : (
              visibleRows.map(({ sprout, depth, childCount, parentTitle }) => (
                <SproutRowFields
                  key={`${sprout.id}-${sprout.updatedAt.toString()}`}
                  s={sprout}
                  depth={depth}
                  childCount={childCount}
                  parentTitle={parentTitle}
                  aiBusy={aiBusy}
                  onPatch={patchSprout}
                  onRemove={removeSprout}
                  onCreateComment={createComment}
                  onUpdateComment={updateComment}
                  onDeleteComment={deleteComment}
                  onSuggestTasks={(id) => void requestSuggestedBreakdown(id)}
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
            Pick the suggestions you want to create as sub-sprouts, or dismiss to discard.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={aiBusy !== null}
              onClick={() => selectAllSuggestedSuggestions(true)}
              className="rounded-lg border border-zinc-300 px-3 py-1 text-xs dark:border-zinc-600"
            >
              Select all
            </button>
            <button
              type="button"
              disabled={aiBusy !== null}
              onClick={() => selectAllSuggestedSuggestions(false)}
              className="rounded-lg border border-zinc-300 px-3 py-1 text-xs dark:border-zinc-600"
            >
              Clear all
            </button>
          </div>
          <ul className="mt-3 space-y-2">
            {aiPreview.suggestions.map((x, i) => {
              const checked = aiPreview.selectedIndexes.includes(i);
              return (
                <li key={i} className="rounded-lg border border-emerald-200/70 bg-white/70 p-3 dark:border-emerald-900/60 dark:bg-zinc-950/40">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSuggestedSuggestion(i)}
                      className="mt-1 h-4 w-4 rounded border-zinc-300 text-emerald-700 focus:ring-emerald-600"
                    />
                    <span className="min-w-0">
                      <span className="block font-medium text-zinc-900 dark:text-zinc-100">
                        {x.title}
                      </span>
                      {x.description ? (
                        <span className="mt-1 block text-xs text-zinc-600 dark:text-zinc-400">
                          {x.description}
                        </span>
                      ) : null}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={aiBusy !== null || aiPreview.selectedIndexes.length === 0}
              onClick={() => void createSelectedSuggestions()}
              className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {aiBusy
                ? "Working…"
                : `Create selected (${aiPreview.selectedIndexes.length})`}
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
  depth,
  childCount,
  parentTitle,
  aiBusy,
  onPatch,
  onRemove,
  onCreateComment,
  onUpdateComment,
  onDeleteComment,
  onSuggestTasks,
}: {
  s: SproutRow;
  depth: number;
  childCount: number;
  parentTitle: string | null;
  aiBusy: string | null;
  onPatch: (
    id: string,
    p: Record<string, SproutPatchValue>,
  ) => void | Promise<void>;
  onRemove: (id: string) => void;
  onCreateComment: (sproutId: string, body: string) => void | Promise<void>;
  onUpdateComment: (
    sproutId: string,
    commentId: string,
    body: string,
  ) => void | Promise<void>;
  onDeleteComment: (sproutId: string, commentId: string) => void | Promise<void>;
  onSuggestTasks: (id: string) => void;
}) {
  const [rowTitle, setRowTitle] = useState(s.title);
  const [rowDesc, setRowDesc] = useState(s.description ?? "");
  const [rowType, setRowType] = useState(s.type);
  const [tl, setTl] = useState(s.timelineLabel ?? "");
  const [dateVal, setDateVal] = useState(() =>
    toDateInputLocal(s.targetCompletionAt),
  );

  return (
    <>
      <tr
        className={`border-b border-zinc-100 dark:border-zinc-800 ${
          depth > 0 ? "bg-zinc-50/40 dark:bg-zinc-900/20" : ""
        }`}
      >
      <td className="px-3 py-2 align-top font-medium">
        <div
          className="min-w-0"
          style={{ paddingLeft: `${depth * 24}px` }}
        >
          <div className="flex items-start gap-2">
            {depth > 0 ? (
              <span className="mt-3 block h-px w-4 shrink-0 bg-zinc-400/60" />
            ) : (
              <span className="w-4 shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                {depth > 0 && parentTitle ? (
                  <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    Child of {parentTitle}
                  </span>
                ) : null}
                {childCount > 0 ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                    {childCount} sub-sprout{childCount === 1 ? "" : "s"}
                  </span>
                ) : null}
                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-medium text-sky-800 dark:bg-sky-950/40 dark:text-sky-300">
                  {s.comments.length} comment{s.comments.length === 1 ? "" : "s"}
                </span>
              </div>
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
            </div>
          </div>
        </div>
      </td>
      <td className="px-3 py-2 align-top">
        <select
          value={rowType}
          onChange={(e) => {
            const next = e.target.value as SproutType;
            setRowType(next);
            void onPatch(s.id, { type: next });
          }}
          className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-600 dark:bg-zinc-900"
        >
          {SPROUT_TYPES.map((type) => (
            <option key={type} value={type}>
              {formatSproutTypeLabel(type)}
            </option>
          ))}
        </select>
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
          onChange={(e) => {
            const nextDate = e.target.value;
            setDateVal(nextDate);
            const quarterLabel = quarterLabelFromDate(nextDate);
            if (quarterLabel) setTl(quarterLabel);
          }}
          onBlur={() => {
            const server = toDateInputLocal(s.targetCompletionAt);
            const next = dateVal.trim() || null;
            const normalized = next || null;
            const nextTimeline = (tl.trim() || null);
            const patch: Record<string, SproutPatchValue> = {};
            if (normalized !== (server || null)) {
              patch.targetCompletionAt = normalized;
            }
            if (nextTimeline !== (s.timelineLabel ?? null)) {
              patch.timelineLabel = nextTimeline;
            }
            if (Object.keys(patch).length > 0) {
              void onPatch(s.id, patch);
            }
          }}
          className="min-h-[2rem] w-full rounded border border-zinc-300 px-1 py-0.5 text-xs dark:border-zinc-600"
        />
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
          <ConfirmActionButton
            buttonLabel="Delete"
            title="Delete sprout?"
            message={`Delete "${s.title}"? Child sprouts will remain, but their parent link will be cleared.`}
            confirmLabel="Delete sprout"
            onConfirm={() => onRemove(s.id)}
            className="text-xs text-red-600 dark:text-red-400"
            confirmClassName="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          />
        </td>
      </tr>
      <tr className="border-b border-zinc-100 dark:border-zinc-800">
        <td colSpan={7} className="bg-zinc-50/60 px-3 py-3 dark:bg-zinc-950/20">
          <SproutCommentsPanel
            sprout={s}
            onCreateComment={onCreateComment}
            onUpdateComment={onUpdateComment}
            onDeleteComment={onDeleteComment}
          />
        </td>
      </tr>
    </>
  );
}

function SproutCommentsPanel({
  sprout,
  onCreateComment,
  onUpdateComment,
  onDeleteComment,
}: {
  sprout: SproutRow;
  onCreateComment: (sproutId: string, body: string) => void | Promise<void>;
  onUpdateComment: (
    sproutId: string,
    commentId: string,
    body: string,
  ) => void | Promise<void>;
  onDeleteComment: (sproutId: string, commentId: string) => void | Promise<void>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [newCommentBody, setNewCommentBody] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState("");
  const [busy, setBusy] = useState(false);

  function commentTimestamp(value: Date | string) {
    return new Date(value).toLocaleString();
  }

  async function submitNewComment() {
    const body = newCommentBody.trim();
    if (!body) return;
    setBusy(true);
    try {
      await onCreateComment(sprout.id, body);
      setNewCommentBody("");
      setIsOpen(true);
    } finally {
      setBusy(false);
    }
  }

  async function submitCommentEdit() {
    if (!editingCommentId) return;
    const body = editingBody.trim();
    if (!body) return;
    setBusy(true);
    try {
      await onUpdateComment(sprout.id, editingCommentId, body);
      setEditingCommentId(null);
      setEditingBody("");
    } finally {
      setBusy(false);
    }
  }

  async function removeComment(commentId: string) {
    setBusy(true);
    try {
      await onDeleteComment(sprout.id, commentId);
    } finally {
      setBusy(false);
    }
  }

  return (
    <details open={isOpen} onToggle={(e) => setIsOpen(e.currentTarget.open)}>
      <summary className="cursor-pointer list-none text-sm font-medium text-zinc-700 marker:hidden dark:text-zinc-300">
        Comments ({sprout.comments.length})
      </summary>
      <div className="mt-3 space-y-3">
        {sprout.comments.length === 0 ? (
          <p className="text-sm text-zinc-500">No comments yet.</p>
        ) : (
          sprout.comments.map((comment) => {
            const isEditing = editingCommentId === comment.id;
            return (
              <div
                key={comment.id}
                className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {comment.author.name || comment.author.email}
                    </span>
                    <span className="mx-1">·</span>
                    <span>{commentTimestamp(comment.createdAt)}</span>
                    {String(comment.updatedAt) !== String(comment.createdAt) ? (
                      <>
                        <span className="mx-1">·</span>
                        <span>edited {commentTimestamp(comment.updatedAt)}</span>
                      </>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        setEditingCommentId(comment.id);
                        setEditingBody(comment.body);
                      }}
                      className="text-emerald-700 underline disabled:opacity-50 dark:text-emerald-400"
                    >
                      Edit
                    </button>
                    <ConfirmActionButton
                      buttonLabel="Delete"
                      title="Delete comment?"
                      message="This comment will be permanently removed."
                      confirmLabel="Delete comment"
                      onConfirm={() => removeComment(comment.id)}
                      disabled={busy}
                      className="text-red-600 dark:text-red-400"
                    />
                  </div>
                </div>

                {isEditing ? (
                  <div className="mt-3 space-y-2">
                    <textarea
                      value={editingBody}
                      onChange={(e) => setEditingBody(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy || !editingBody.trim()}
                        onClick={() => void submitCommentEdit()}
                        className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                      >
                        {busy ? "Saving…" : "Save"}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditingBody("");
                        }}
                        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs dark:border-zinc-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                    {comment.body}
                  </p>
                )}
              </div>
            );
          })
        )}

        <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Add comment
          </p>
          <textarea
            value={newCommentBody}
            onChange={(e) => setNewCommentBody(e.target.value)}
            rows={3}
            placeholder="Add context, decisions, blockers, or updates..."
            className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              disabled={busy || !newCommentBody.trim()}
              onClick={() => void submitNewComment()}
              className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              {busy ? "Saving…" : "Add comment"}
            </button>
          </div>
        </div>
      </div>
    </details>
  );
}
