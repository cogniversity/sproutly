import { prisma } from "@/lib/prisma";

export async function listInitiatives(workspaceId: string) {
  return prisma.initiative.findMany({
    where: { workspaceId },
    orderBy: { updatedAt: "desc" },
    include: {
      dri: { select: { id: true, name: true, email: true } },
      plots: { include: { plot: { select: { id: true, name: true } } } },
      sprouts: {
        include: {
          sprout: {
            select: { id: true, title: true, status: true, plotId: true },
          },
        },
      },
    },
  });
}

export async function getInitiative(id: string) {
  return prisma.initiative.findUnique({
    where: { id },
    include: {
      workspace: true,
      dri: { select: { id: true, name: true, email: true } },
      plots: { include: { plot: true } },
      sprouts: { include: { sprout: { include: { plot: true } } } },
    },
  });
}

export async function createInitiative(input: {
  workspaceId: string;
  name: string;
  description?: string | null;
  driUserId?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  timelineLabel?: string | null;
  targetCompletionAt?: Date | null;
}) {
  return prisma.initiative.create({
    data: {
      workspaceId: input.workspaceId,
      name: input.name,
      description: input.description ?? null,
      driUserId: input.driUserId ?? null,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      timelineLabel: input.timelineLabel ?? null,
      targetCompletionAt: input.targetCompletionAt ?? null,
    },
    include: {
      dri: { select: { id: true, name: true, email: true } },
      plots: true,
      sprouts: true,
    },
  });
}

export async function updateInitiative(
  id: string,
  data: {
    name?: string;
    description?: string | null;
    driUserId?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
    timelineLabel?: string | null;
    targetCompletionAt?: Date | null;
  },
) {
  return prisma.initiative.update({
    where: { id },
    data,
    include: {
      dri: { select: { id: true, name: true, email: true } },
      plots: { include: { plot: { select: { id: true, name: true } } } },
      sprouts: {
        include: {
          sprout: { select: { id: true, title: true, status: true } },
        },
      },
    },
  });
}

export async function deleteInitiative(id: string) {
  await prisma.initiative.delete({ where: { id } });
}

export async function linkPlot(initiativeId: string, plotId: string) {
  return prisma.initiativePlot.create({
    data: { initiativeId, plotId },
    include: { plot: { select: { id: true, name: true } } },
  });
}

export async function unlinkPlot(initiativeId: string, plotId: string) {
  await prisma.initiativePlot.delete({
    where: {
      initiativeId_plotId: { initiativeId, plotId },
    },
  });
}

export async function linkSprout(initiativeId: string, sproutId: string) {
  return prisma.initiativeSprout.create({
    data: { initiativeId, sproutId },
    include: {
      sprout: { select: { id: true, title: true, status: true, plotId: true } },
    },
  });
}

export async function unlinkSprout(initiativeId: string, sproutId: string) {
  await prisma.initiativeSprout.delete({
    where: {
      initiativeId_sproutId: { initiativeId, sproutId },
    },
  });
}
