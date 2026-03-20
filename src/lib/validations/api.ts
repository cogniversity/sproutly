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
});

export const patchSproutBodySchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(8000).optional().nullable(),
  status: sproutStatus.optional(),
  horizon: horizon.optional(),
  ownerUserId: z.string().min(1).max(40).optional().nullable(),
});
