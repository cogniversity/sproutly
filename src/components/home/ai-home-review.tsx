"use client";

import type { SproutType } from "@prisma/client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { InlineNotice } from "@/components/ui/inline-notice";
import {
  type AiComposerDraft,
  type AiComposerReviewDraft,
} from "@/lib/ai-composer";
import { formatSproutTypeLabel, SPROUT_TYPES } from "@/lib/sprout-types";
import { quarterLabelFromDate } from "@/lib/timeline";

type PlotOption = {
  id: string;
  name: string;
};

type DraftSproutRow = {
  localId: string;
  depth: number;
};

function matchPlotId(plotName: string | null | undefined, plots: PlotOption[]) {
  const normalized = plotName?.trim().toLowerCase();
  if (!normalized) return null;
  const match = plots.find((plot) => plot.name.trim().toLowerCase() === normalized);
  return match?.id ?? null;
}

function buildReviewDraft(
  draft: AiComposerDraft,
  plots: PlotOption[],
): AiComposerReviewDraft {
  return {
    summary: draft.summary,
    sprouts: draft.sprouts.map((sprout) => ({
      ...sprout,
      selected: true,
      plotId: matchPlotId(sprout.plotName, plots),
    })),
    initiatives: draft.initiatives.map((initiative) => ({
      ...initiative,
      selected: true,
    })),
    harvests: draft.harvests.map((harvest) => ({
      ...harvest,
      selected: true,
    })),
  };
}

function buildDraftSproutRows(
  sprouts: AiComposerReviewDraft["sprouts"],
): DraftSproutRow[] {
  const byId = new Map(sprouts.map((sprout) => [sprout.localId, sprout]));
  const childrenByParent = new Map<string, AiComposerReviewDraft["sprouts"]>();

  for (const sprout of sprouts) {
    if (!sprout.parentLocalId || !byId.has(sprout.parentLocalId)) continue;
    const siblings = childrenByParent.get(sprout.parentLocalId) ?? [];
    siblings.push(sprout);
    childrenByParent.set(sprout.parentLocalId, siblings);
  }

  const roots = sprouts.filter(
    (sprout) => !sprout.parentLocalId || !byId.has(sprout.parentLocalId),
  );

  const rows: DraftSproutRow[] = [];

  function walk(localId: string, depth: number) {
    rows.push({ localId, depth });
    const children = childrenByParent.get(localId) ?? [];
    for (const child of children) {
      walk(child.localId, depth + 1);
    }
  }

  for (const root of roots) {
    walk(root.localId, 0);
  }

  return rows;
}

export function AiHomeReview({
  workspaceId,
  plots,
  draftId,
}: {
  workspaceId: string;
  plots: PlotOption[];
  draftId: string | undefined;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [reviewDraft, setReviewDraft] = useState<AiComposerReviewDraft | null>(null);
  const [applying, setApplying] = useState(false);
  const [appliedMessage, setAppliedMessage] = useState("");

  useEffect(() => {
    if (!draftId) {
      setError("No draft was provided.");
      setLoading(false);
      return;
    }

    try {
      const raw = sessionStorage.getItem(`ai-composer-draft:${draftId}`);
      if (!raw) {
        setError("Draft not found. Start from the home composer again.");
        setLoading(false);
        return;
      }
      const parsed = JSON.parse(raw) as {
        originalPrompt?: string;
        draft?: AiComposerDraft;
      };
      if (!parsed.draft) {
        setError("Draft data is invalid.");
        setLoading(false);
        return;
      }
      setOriginalPrompt(parsed.originalPrompt ?? "");
      setReviewDraft(buildReviewDraft(parsed.draft, plots));
    } catch {
      setError("Could not load the draft.");
    } finally {
      setLoading(false);
    }
  }, [draftId, plots]);

  const sproutRows = useMemo(
    () => buildDraftSproutRows(reviewDraft?.sprouts ?? []),
    [reviewDraft],
  );

  const plotNameById = useMemo(
    () => new Map(plots.map((plot) => [plot.id, plot.name])),
    [plots],
  );

  function inheritedPlotId(localId: string): string | null {
    if (!reviewDraft) return null;
    const byId = new Map(reviewDraft.sprouts.map((sprout) => [sprout.localId, sprout]));
    let current = byId.get(localId);
    const seen = new Set<string>();
    while (current) {
      if (current.plotId) return current.plotId;
      if (!current.parentLocalId || seen.has(current.parentLocalId)) return null;
      seen.add(current.parentLocalId);
      current = byId.get(current.parentLocalId);
    }
    return null;
  }

  function updateSprout(localId: string, patch: Partial<AiComposerReviewDraft["sprouts"][number]>) {
    setReviewDraft((current) => {
      if (!current) return current;
      return {
        ...current,
        sprouts: current.sprouts.map((sprout) =>
          sprout.localId === localId ? { ...sprout, ...patch } : sprout,
        ),
      };
    });
  }

  function updateInitiative(
    localId: string,
    patch: Partial<AiComposerReviewDraft["initiatives"][number]>,
  ) {
    setReviewDraft((current) => {
      if (!current) return current;
      return {
        ...current,
        initiatives: current.initiatives.map((initiative) =>
          initiative.localId === localId ? { ...initiative, ...patch } : initiative,
        ),
      };
    });
  }

  function updateHarvest(
    localId: string,
    patch: Partial<AiComposerReviewDraft["harvests"][number]>,
  ) {
    setReviewDraft((current) => {
      if (!current) return current;
      return {
        ...current,
        harvests: current.harvests.map((harvest) =>
          harvest.localId === localId ? { ...harvest, ...patch } : harvest,
        ),
      };
    });
  }

  function selectAll(selected: boolean) {
    setReviewDraft((current) => {
      if (!current) return current;
      return {
        ...current,
        sprouts: current.sprouts.map((sprout) => ({ ...sprout, selected })),
        initiatives: current.initiatives.map((initiative) => ({
          ...initiative,
          selected,
        })),
        harvests: current.harvests.map((harvest) => ({ ...harvest, selected })),
      };
    });
  }

  async function applyDraft() {
    if (!reviewDraft) return;
    setApplying(true);
    setError("");
    setAppliedMessage("");
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/ai/compose-apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewDraft),
      });
      const data = (await res.json().catch(() => ({}))) as {
        created?: { sprouts: number; initiatives: number; harvests: number };
        error?: string;
      };
      if (!res.ok || !data.created) {
        setError(data.error ?? "Could not apply the draft.");
        return;
      }
      setAppliedMessage(
        `Created ${data.created.sprouts} sprout(s), ${data.created.initiatives} initiative(s), and ${data.created.harvests} harvest(s).`,
      );
      if (draftId) {
        sessionStorage.removeItem(`ai-composer-draft:${draftId}`);
      }
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading draft…</p>;
  }

  if (error && !reviewDraft) {
    return (
      <div className="flex flex-col gap-4">
        <InlineNotice message={error} tone="error" />
        <Link href="/app" className="text-sm text-emerald-700 underline dark:text-emerald-400">
          Back to home
        </Link>
      </div>
    );
  }

  if (!reviewDraft) return null;

  const selectedCount =
    reviewDraft.sprouts.filter((sprout) => sprout.selected).length +
    reviewDraft.initiatives.filter((initiative) => initiative.selected).length +
    reviewDraft.harvests.filter((harvest) => harvest.selected).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/app" className="text-sm text-emerald-700 underline dark:text-emerald-400">
          ← Back to home
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Review AI draft
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Edit, partially accept, or remove any proposed items before creation.
        </p>
      </div>

      {error ? <InlineNotice message={error} tone="error" /> : null}
      {appliedMessage ? <InlineNotice message={appliedMessage} tone="success" /> : null}

      <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <p className="text-xs uppercase tracking-wide text-zinc-500">Original prompt</p>
        <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
          {originalPrompt || "—"}
        </p>
        <p className="mt-4 text-xs uppercase tracking-wide text-zinc-500">AI summary</p>
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{reviewDraft.summary}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {selectedCount} item{selectedCount === 1 ? "" : "s"} selected
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => selectAll(true)}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
          >
            Select all
          </button>
          <button
            type="button"
            onClick={() => selectAll(false)}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
          >
            Clear all
          </button>
          <button
            type="button"
            disabled={applying || selectedCount === 0}
            onClick={() => void applyDraft()}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {applying ? "Applying…" : "Create selected"}
          </button>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold">Sprouts</h2>
          <p className="text-sm text-zinc-500">
            Every new sprout needs a home plot. Child sprouts can inherit the parent plot.
          </p>
        </div>
        {reviewDraft.sprouts.length === 0 ? (
          <p className="text-sm text-zinc-500">No sprouts proposed.</p>
        ) : (
          sproutRows.map(({ localId, depth }) => {
            const sprout = reviewDraft.sprouts.find((item) => item.localId === localId);
            if (!sprout) return null;
            const parent = sprout.parentLocalId
              ? reviewDraft.sprouts.find((item) => item.localId === sprout.parentLocalId)
              : null;
            const inheritedPlot = inheritedPlotId(localId);
            return (
              <div
                key={localId}
                className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
                style={{ marginLeft: `${depth * 20}px` }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={sprout.selected}
                      onChange={(e) => updateSprout(localId, { selected: e.target.checked })}
                    />
                    Include sprout
                  </label>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                    {formatSproutTypeLabel(sprout.type)}
                  </span>
                </div>

                {parent ? (
                  <p className="mt-2 text-xs text-zinc-500">
                    Child of <span className="font-medium">{parent.title}</span>
                  </p>
                ) : null}

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <input
                    value={sprout.title}
                    onChange={(e) => updateSprout(localId, { title: e.target.value })}
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                  />
                  <select
                    value={sprout.type}
                    onChange={(e) =>
                      updateSprout(localId, { type: e.target.value as SproutType })
                    }
                    className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                  >
                    {SPROUT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {formatSproutTypeLabel(type)}
                      </option>
                    ))}
                  </select>
                  <textarea
                    value={sprout.description ?? ""}
                    onChange={(e) =>
                      updateSprout(localId, {
                        description: e.target.value || null,
                      })
                    }
                    rows={3}
                    placeholder="Description"
                    className="md:col-span-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                  />
                  <select
                    value={sprout.plotId ?? ""}
                    onChange={(e) =>
                      updateSprout(localId, {
                        plotId: e.target.value || null,
                      })
                    }
                    className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                  >
                    <option value="">Choose plot</option>
                    {plots.map((plot) => (
                      <option key={plot.id} value={plot.id}>
                        {plot.name}
                      </option>
                    ))}
                  </select>
                  <input
                    value={sprout.timelineLabel ?? ""}
                    onChange={(e) =>
                      updateSprout(localId, {
                        timelineLabel: e.target.value || null,
                      })
                    }
                    placeholder="Timeline label"
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                  />
                  <input
                    type="date"
                    value={sprout.targetCompletionAt ?? ""}
                    onChange={(e) => {
                      const nextDate = e.target.value;
                      updateSprout(localId, {
                        targetCompletionAt: nextDate || null,
                        timelineLabel: nextDate
                          ? quarterLabelFromDate(nextDate)
                          : sprout.timelineLabel,
                      });
                    }}
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                  />
                  <div className="rounded-lg border border-dashed border-zinc-300 px-3 py-2 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                    {sprout.plotId
                      ? `Selected plot: ${plotNameById.get(sprout.plotId) ?? "Unknown"}`
                      : inheritedPlot
                        ? `Will inherit plot: ${plotNameById.get(inheritedPlot) ?? "Unknown"}`
                        : "Choose a plot or inherit from a selected parent"}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold">Initiatives</h2>
          <p className="text-sm text-zinc-500">
            Choose which proposed sprouts this initiative should include.
          </p>
        </div>
        {reviewDraft.initiatives.length === 0 ? (
          <p className="text-sm text-zinc-500">No initiatives proposed.</p>
        ) : (
          reviewDraft.initiatives.map((initiative) => (
            <div
              key={initiative.localId}
              className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={initiative.selected}
                  onChange={(e) =>
                    updateInitiative(initiative.localId, { selected: e.target.checked })
                  }
                />
                Include initiative
              </label>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <input
                  value={initiative.name}
                  onChange={(e) =>
                    updateInitiative(initiative.localId, { name: e.target.value })
                  }
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                />
                <input
                  value={initiative.timelineLabel ?? ""}
                  onChange={(e) =>
                    updateInitiative(initiative.localId, {
                      timelineLabel: e.target.value || null,
                    })
                  }
                  placeholder="Timeline label"
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                />
                <textarea
                  value={initiative.description ?? ""}
                  onChange={(e) =>
                    updateInitiative(initiative.localId, {
                      description: e.target.value || null,
                    })
                  }
                  rows={3}
                  placeholder="Description"
                  className="md:col-span-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                />
                <input
                  type="date"
                  value={initiative.targetCompletionAt ?? ""}
                  onChange={(e) => {
                    const nextDate = e.target.value;
                    updateInitiative(initiative.localId, {
                      targetCompletionAt: nextDate || null,
                      timelineLabel: nextDate
                        ? quarterLabelFromDate(nextDate)
                        : initiative.timelineLabel,
                    });
                  }}
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                />
              </div>
              <div className="mt-3 flex flex-col gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Linked sprouts
                </p>
                {reviewDraft.sprouts.length === 0 ? (
                  <p className="text-sm text-zinc-500">No proposed sprouts to link.</p>
                ) : (
                  reviewDraft.sprouts.map((sprout) => (
                    <label key={sprout.localId} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={initiative.linkedSproutLocalIds.includes(sprout.localId)}
                        onChange={(e) =>
                          updateInitiative(initiative.localId, {
                            linkedSproutLocalIds: e.target.checked
                              ? [...initiative.linkedSproutLocalIds, sprout.localId]
                              : initiative.linkedSproutLocalIds.filter(
                                  (id) => id !== sprout.localId,
                                ),
                          })
                        }
                      />
                      <span>{sprout.title}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold">Harvests</h2>
          <p className="text-sm text-zinc-500">
            Choose which proposed sprouts this harvest should include.
          </p>
        </div>
        {reviewDraft.harvests.length === 0 ? (
          <p className="text-sm text-zinc-500">No harvests proposed.</p>
        ) : (
          reviewDraft.harvests.map((harvest) => (
            <div
              key={harvest.localId}
              className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={harvest.selected}
                  onChange={(e) =>
                    updateHarvest(harvest.localId, { selected: e.target.checked })
                  }
                />
                Include harvest
              </label>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <input
                  value={harvest.name}
                  onChange={(e) =>
                    updateHarvest(harvest.localId, { name: e.target.value })
                  }
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                />
                <input
                  value={harvest.versionLabel ?? ""}
                  onChange={(e) =>
                    updateHarvest(harvest.localId, {
                      versionLabel: e.target.value || null,
                    })
                  }
                  placeholder="Version label"
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                />
                <input
                  type="date"
                  value={harvest.targetDate ?? ""}
                  onChange={(e) =>
                    updateHarvest(harvest.localId, {
                      targetDate: e.target.value || null,
                    })
                  }
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                />
                <input
                  type="date"
                  value={harvest.shippedAt ?? ""}
                  onChange={(e) =>
                    updateHarvest(harvest.localId, {
                      shippedAt: e.target.value || null,
                    })
                  }
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                />
              </div>
              <div className="mt-3 flex flex-col gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Linked sprouts
                </p>
                {reviewDraft.sprouts.length === 0 ? (
                  <p className="text-sm text-zinc-500">No proposed sprouts to link.</p>
                ) : (
                  reviewDraft.sprouts.map((sprout) => (
                    <label key={sprout.localId} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={harvest.linkedSproutLocalIds.includes(sprout.localId)}
                        onChange={(e) =>
                          updateHarvest(harvest.localId, {
                            linkedSproutLocalIds: e.target.checked
                              ? [...harvest.linkedSproutLocalIds, sprout.localId]
                              : harvest.linkedSproutLocalIds.filter(
                                  (id) => id !== sprout.localId,
                                ),
                          })
                        }
                      />
                      <span>{sprout.title}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
