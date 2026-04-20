import type { SproutStatus, SproutType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function sproutInclude() {
  return {
    owner: { select: { id: true, name: true, email: true } },
    comments: {
      orderBy: [{ createdAt: "asc" as const }],
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    },
  };
}

export async function listSprouts(plotId: string) {
  return prisma.sprout.findMany({
    where: { plotId },
    orderBy: [{ updatedAt: "desc" }],
    include: sproutInclude(),
  });
}

export async function createSprout(input: {
  plotId: string;
  parentSproutId?: string | null;
  title: string;
  description?: string | null;
  type?: SproutType;
  status?: SproutStatus;
  timelineLabel?: string | null;
  targetCompletionAt?: Date | null;
  ownerUserId?: string | null;
}) {
  return prisma.sprout.create({
    data: {
      plotId: input.plotId,
      parentSproutId: input.parentSproutId ?? null,
      title: input.title,
      description: input.description ?? null,
      type: input.type ?? "IDEA",
      status: input.status ?? "BACKLOG",
      timelineLabel: input.timelineLabel ?? null,
      targetCompletionAt: input.targetCompletionAt ?? null,
      ownerUserId: input.ownerUserId ?? null,
    },
    include: sproutInclude(),
  });
}

export async function createChildSprouts(
  parentSproutId: string,
  plotId: string,
  suggestions: { title: string; description?: string; type?: SproutType }[],
) {
  return prisma.$transaction(
    suggestions.map((s) =>
      prisma.sprout.create({
        data: {
          plotId,
          parentSproutId,
          title: s.title.slice(0, 300),
          description: s.description?.slice(0, 8000) ?? null,
          type: s.type ?? "TASK",
          status: "BACKLOG",
        },
        include: sproutInclude(),
      }),
    ),
  );
}

export async function getSproutById(sproutId: string) {
  return prisma.sprout.findUnique({
    where: { id: sproutId },
    include: {
      plot: { include: { workspace: true } },
      ...sproutInclude(),
    },
  });
}

export async function updateSprout(
  sproutId: string,
  data: {
    title?: string;
    description?: string | null;
    type?: SproutType;
    status?: SproutStatus;
    timelineLabel?: string | null;
    targetCompletionAt?: Date | null;
    ownerUserId?: string | null;
  },
) {
  return prisma.sprout.update({
    where: { id: sproutId },
    data,
    include: sproutInclude(),
  });
}

export async function deleteSprout(sproutId: string) {
  await prisma.sprout.delete({ where: { id: sproutId } });
}
