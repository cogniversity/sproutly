import { getAppSession } from "@/lib/auth";
import { canEditWorkspace } from "@/lib/authz";
import { aiComposerApplySchema } from "@/lib/ai-composer";
import { optDate } from "@/lib/date-parse";
import { jsonError } from "@/lib/http";
import * as harvests from "@/lib/services/harvests";
import * as initiatives from "@/lib/services/initiatives";
import * as plots from "@/lib/services/plots";
import * as sprouts from "@/lib/services/sprouts";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ workspaceId: string }> },
) {
  const { workspaceId } = await ctx.params;
  const session = await getAppSession();
  if (!session) return jsonError("Unauthorized", 401);
  if (!canEditWorkspace(session, workspaceId)) {
    return jsonError("Forbidden", 403);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }
  const parsed = aiComposerApplySchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid request", 400);

  const availablePlots = await plots.listPlots(workspaceId);
  const validPlotIds = new Set(availablePlots.map((plot) => plot.id));

  const selectedSprouts = parsed.data.sprouts.filter((sprout) => sprout.selected);
  const selectedInitiatives = parsed.data.initiatives.filter(
    (initiative) => initiative.selected,
  );
  const selectedHarvests = parsed.data.harvests.filter((harvest) => harvest.selected);

  if (
    selectedSprouts.length === 0 &&
    selectedInitiatives.length === 0 &&
    selectedHarvests.length === 0
  ) {
    return jsonError("Select at least one item to create.", 400);
  }

  const selectedById = new Map(
    selectedSprouts.map((sprout) => [sprout.localId, sprout]),
  );
  const createdSproutIds = new Map<string, string>();
  const resolvedPlotIds = new Map<string, string>();
  const creating = new Set<string>();

  function resolvePlotId(localId: string): string | null {
    if (resolvedPlotIds.has(localId)) {
      return resolvedPlotIds.get(localId) ?? null;
    }
    const sprout = selectedById.get(localId);
    if (!sprout) return null;
    if (sprout.plotId) {
      resolvedPlotIds.set(localId, sprout.plotId);
      return sprout.plotId;
    }
    if (sprout.parentLocalId && selectedById.has(sprout.parentLocalId)) {
      const inherited = resolvePlotId(sprout.parentLocalId);
      if (inherited) {
        resolvedPlotIds.set(localId, inherited);
        return inherited;
      }
    }
    return null;
  }

  async function createSproutDraft(localId: string): Promise<string> {
    if (createdSproutIds.has(localId)) {
      return createdSproutIds.get(localId)!;
    }
    if (creating.has(localId)) {
      throw new Error("Circular sprout parent reference.");
    }
    const sprout = selectedById.get(localId);
    if (!sprout) {
      throw new Error("Missing selected sprout.");
    }

    creating.add(localId);
    try {
      const plotId = resolvePlotId(localId);
      if (!plotId || !validPlotIds.has(plotId)) {
        throw new Error(`Assign a valid plot to "${sprout.title}".`);
      }

      let parentSproutId: string | null = null;
      if (sprout.parentLocalId && selectedById.has(sprout.parentLocalId)) {
        parentSproutId = await createSproutDraft(sprout.parentLocalId);
      }

      const created = await sprouts.createSprout({
        plotId,
        parentSproutId,
        title: sprout.title,
        description: sprout.description ?? null,
        type: sprout.type,
        timelineLabel: sprout.timelineLabel ?? null,
        targetCompletionAt: optDate(sprout.targetCompletionAt ?? undefined),
      });
      createdSproutIds.set(localId, created.id);
      return created.id;
    } finally {
      creating.delete(localId);
    }
  }

  try {
    for (const sprout of selectedSprouts) {
      await createSproutDraft(sprout.localId);
    }

    for (const initiative of selectedInitiatives) {
      const created = await initiatives.createInitiative({
        workspaceId,
        name: initiative.name,
        description: initiative.description ?? null,
        timelineLabel: initiative.timelineLabel ?? null,
        targetCompletionAt: optDate(initiative.targetCompletionAt ?? undefined),
      });

      const linkedSproutIds = initiative.linkedSproutLocalIds
        .map((localId) => createdSproutIds.get(localId))
        .filter((id): id is string => Boolean(id));

      for (const sproutId of linkedSproutIds) {
        try {
          await initiatives.linkSprout(created.id, sproutId);
        } catch {
          // Ignore duplicate links during apply.
        }
      }

      const linkedPlotIds = new Set(
        initiative.linkedSproutLocalIds
          .map((localId) => resolvePlotId(localId))
          .filter((id): id is string => Boolean(id)),
      );

      for (const plotId of linkedPlotIds) {
        try {
          await initiatives.linkPlot(created.id, plotId);
        } catch {
          // Ignore duplicate links during apply.
        }
      }
    }

    for (const harvest of selectedHarvests) {
      const created = await harvests.createHarvest({
        workspaceId,
        name: harvest.name,
        versionLabel: harvest.versionLabel ?? null,
        targetDate: optDate(harvest.targetDate ?? undefined) ?? null,
        shippedAt: optDate(harvest.shippedAt ?? undefined) ?? null,
      });

      const linkedSproutIds = harvest.linkedSproutLocalIds
        .map((localId) => createdSproutIds.get(localId))
        .filter((id): id is string => Boolean(id));

      for (const sproutId of linkedSproutIds) {
        try {
          await harvests.linkSprout(created.id, sproutId);
        } catch {
          // Ignore duplicate links during apply.
        }
      }
    }
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Could not apply draft.",
      400,
    );
  }

  return Response.json({
    created: {
      sprouts: selectedSprouts.length,
      initiatives: selectedInitiatives.length,
      harvests: selectedHarvests.length,
    },
  });
}
