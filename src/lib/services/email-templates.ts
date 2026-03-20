import type { EmailTemplateKind } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function listTemplates(workspaceId: string) {
  return prisma.emailTemplate.findMany({
    where: { workspaceId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getTemplate(id: string) {
  return prisma.emailTemplate.findUnique({
    where: { id },
    include: { workspace: true },
  });
}

export async function createTemplate(input: {
  workspaceId: string;
  kind?: EmailTemplateKind;
  name: string;
  subject: string;
  bodyHtml: string;
}) {
  return prisma.emailTemplate.create({
    data: {
      workspaceId: input.workspaceId,
      kind: input.kind ?? "GENERIC",
      name: input.name,
      subject: input.subject,
      bodyHtml: input.bodyHtml,
    },
  });
}

export async function updateTemplate(
  id: string,
  data: {
    kind?: EmailTemplateKind;
    name?: string;
    subject?: string;
    bodyHtml?: string;
  },
) {
  return prisma.emailTemplate.update({
    where: { id },
    data,
  });
}

export async function deleteTemplate(id: string) {
  await prisma.emailTemplate.delete({ where: { id } });
}

/** Simple merge: {{workspaceName}}, {{digestHtml}} */
export function mergeTemplate(
  subject: string,
  bodyHtml: string,
  vars: Record<string, string>,
) {
  let sub = subject;
  let body = bodyHtml;
  for (const [k, v] of Object.entries(vars)) {
    const re = new RegExp(`{{\\s*${k}\\s*}}`, "g");
    sub = sub.replace(re, v);
    body = body.replace(re, v);
  }
  return { subject: sub, bodyHtml: body };
}
