import { z } from "zod";

export const registerBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
  name: z.string().min(1).max(120),
});

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
});

export const createPlotBodySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(4000).optional().nullable(),
});

export const patchPlotBodySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(4000).optional().nullable(),
  sortOrder: z.number().int().optional(),
});

const sproutStatus = z.enum([
  "BACKLOG",
  "IN_PROGRESS",
  "PAUSED",
  "DEPRIORITIZED",
  "BLOCKED",
  "DONE",
]);

const horizon = z.enum(["NONE", "DAY", "WEEK", "MONTH", "QUARTER", "YEAR"]);

export const createSproutBodySchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(8000).optional().nullable(),
  status: sproutStatus.optional(),
  horizon: horizon.optional(),
  ownerUserId: z.string().min(1).max(40).optional().nullable(),
  parentSproutId: z.string().min(1).max(40).optional().nullable(),
});

export const patchSproutBodySchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(8000).optional().nullable(),
  status: sproutStatus.optional(),
  horizon: horizon.optional(),
  ownerUserId: z.string().min(1).max(40).optional().nullable(),
});

const llmProvider = z.enum(["OPENAI", "ANTHROPIC", "GOOGLE"]);

export const patchAiSettingsSchema = z.object({
  enabled: z.boolean().optional(),
  provider: llmProvider.optional().nullable(),
  apiKey: z.string().max(500).optional().nullable(),
});

export const elaborateSproutBodySchema = z.object({
  create: z.boolean().optional(),
});

export const createInitiativeBodySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(4000).optional().nullable(),
  driUserId: z.string().min(1).max(40).optional().nullable(),
  startDate: z.string().max(40).optional().nullable(),
  endDate: z.string().max(40).optional().nullable(),
});

export const patchInitiativeBodySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(4000).optional().nullable(),
  driUserId: z.string().min(1).max(40).optional().nullable(),
  startDate: z.string().max(40).optional().nullable(),
  endDate: z.string().max(40).optional().nullable(),
});

export const linkPlotBodySchema = z.object({
  plotId: z.string().min(1).max(40),
});

export const linkSproutBodySchema = z.object({
  sproutId: z.string().min(1).max(40),
});

export const createHarvestBodySchema = z.object({
  name: z.string().min(1).max(200),
  versionLabel: z.string().max(80).optional().nullable(),
  targetDate: z.string().max(40).optional().nullable(),
  shippedAt: z.string().max(40).optional().nullable(),
});

export const patchHarvestBodySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  versionLabel: z.string().max(80).optional().nullable(),
  targetDate: z.string().max(40).optional().nullable(),
  shippedAt: z.string().max(40).optional().nullable(),
});

const emailTemplateKind = z.enum(["INVITE", "DIGEST", "GENERIC"]);

export const createEmailTemplateBodySchema = z.object({
  kind: emailTemplateKind.optional(),
  name: z.string().min(1).max(120),
  subject: z.string().min(1).max(300),
  bodyHtml: z.string().min(1).max(100000),
});

export const patchEmailTemplateBodySchema = z.object({
  kind: emailTemplateKind.optional(),
  name: z.string().min(1).max(120).optional(),
  subject: z.string().min(1).max(300).optional(),
  bodyHtml: z.string().min(1).max(100000).optional(),
});
