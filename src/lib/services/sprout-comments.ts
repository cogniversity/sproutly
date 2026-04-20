import { prisma } from "@/lib/prisma";

const commentInclude = {
  author: { select: { id: true, name: true, email: true } },
} as const;

export async function createSproutComment(input: {
  sproutId: string;
  authorUserId: string;
  body: string;
}) {
  return prisma.sproutComment.create({
    data: {
      sproutId: input.sproutId,
      authorUserId: input.authorUserId,
      body: input.body,
    },
    include: commentInclude,
  });
}

export async function getSproutCommentById(commentId: string) {
  return prisma.sproutComment.findUnique({
    where: { id: commentId },
    include: {
      ...commentInclude,
      sprout: {
        include: {
          plot: { include: { workspace: true } },
        },
      },
    },
  });
}

export async function updateSproutComment(
  commentId: string,
  body: string,
) {
  return prisma.sproutComment.update({
    where: { id: commentId },
    data: { body },
    include: commentInclude,
  });
}

export async function deleteSproutComment(commentId: string) {
  await prisma.sproutComment.delete({ where: { id: commentId } });
}
