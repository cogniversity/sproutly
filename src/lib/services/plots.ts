import type { Plot } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function listPlots(workspaceId: string) {
  return prisma.plot.findMany({
    where: { workspaceId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function createPlot(input: {
  workspaceId: string;
  name: string;
  description?: string | null;
  timelineLabel?: string | null;
}): Promise<Plot> {
  return prisma.plot.create({
    data: {
      workspaceId: input.workspaceId,
      name: input.name,
      description: input.description ?? null,
      timelineLabel: input.timelineLabel ?? null,
    },
  });
}

export async function getPlotById(plotId: string) {
  return prisma.plot.findUnique({
    where: { id: plotId },
    include: { workspace: true },
  });
}

export async function updatePlot(
  plotId: string,
  data: {
    name?: string;
    description?: string | null;
    timelineLabel?: string | null;
    sortOrder?: number;
  },
) {
  return prisma.plot.update({
    where: { id: plotId },
    data,
  });
}

export async function deletePlot(plotId: string) {
  await prisma.plot.delete({ where: { id: plotId } });
}
