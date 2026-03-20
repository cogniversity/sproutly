import { prisma } from "@/lib/prisma";

export async function listHarvests(workspaceId: string) {
  return prisma.harvest.findMany({
    where: { workspaceId },
    orderBy: [{ targetDate: "asc" }, { createdAt: "desc" }],
    include: {
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

export async function getHarvest(id: string) {
  return prisma.harvest.findUnique({
    where: { id },
    include: {
      workspace: true,
      sprouts: {
        include: {
          sprout: { include: { plot: { select: { id: true, name: true } } } },
        },
      },
    },
  });
}

export async function createHarvest(input: {
  workspaceId: string;
  name: string;
  versionLabel?: string | null;
  targetDate?: Date | null;
  shippedAt?: Date | null;
}) {
  return prisma.harvest.create({
    data: {
      workspaceId: input.workspaceId,
      name: input.name,
      versionLabel: input.versionLabel ?? null,
      targetDate: input.targetDate ?? null,
      shippedAt: input.shippedAt ?? null,
    },
    include: { sprouts: true },
  });
}

export async function updateHarvest(
  id: string,
  data: {
    name?: string;
    versionLabel?: string | null;
    targetDate?: Date | null;
    shippedAt?: Date | null;
  },
) {
  return prisma.harvest.update({
    where: { id },
    data,
    include: {
      sprouts: {
        include: {
          sprout: { select: { id: true, title: true, status: true } },
        },
      },
    },
  });
}

export async function deleteHarvest(id: string) {
  await prisma.harvest.delete({ where: { id } });
}

export async function linkSprout(harvestId: string, sproutId: string) {
  return prisma.harvestSprout.create({
    data: { harvestId, sproutId },
    include: {
      sprout: { select: { id: true, title: true, status: true } },
    },
  });
}

export async function unlinkSprout(harvestId: string, sproutId: string) {
  await prisma.harvestSprout.delete({
    where: {
      harvestId_sproutId: { harvestId, sproutId },
    },
  });
}
