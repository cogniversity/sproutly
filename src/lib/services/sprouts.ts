import type { Horizon, SproutStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function listSprouts(plotId: string) {
  return prisma.sprout.findMany({
    where: { plotId },
    orderBy: [{ updatedAt: "desc" }],
    include: { owner: { select: { id: true, name: true, email: true } } },
  });
}

export async function createSprout(input: {
  plotId: string;
  title: string;
  description?: string | null;
  status?: SproutStatus;
  horizon?: Horizon;
  ownerUserId?: string | null;
}) {
  return prisma.sprout.create({
    data: {
      plotId: input.plotId,
      title: input.title,
      description: input.description ?? null,
      status: input.status ?? "BACKLOG",
      horizon: input.horizon ?? "NONE",
      ownerUserId: input.ownerUserId ?? null,
    },
    include: { owner: { select: { id: true, name: true, email: true } } },
  });
}

export async function getSproutById(sproutId: string) {
  return prisma.sprout.findUnique({
    where: { id: sproutId },
    include: {
      plot: { include: { workspace: true } },
      owner: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function updateSprout(
  sproutId: string,
  data: {
    title?: string;
    description?: string | null;
    status?: SproutStatus;
    horizon?: Horizon;
    ownerUserId?: string | null;
  },
) {
  return prisma.sprout.update({
    where: { id: sproutId },
    data,
    include: { owner: { select: { id: true, name: true, email: true } } },
  });
}

export async function deleteSprout(sproutId: string) {
  await prisma.sprout.delete({ where: { id: sproutId } });
}
