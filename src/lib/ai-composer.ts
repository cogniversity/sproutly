import { z } from "zod";
import { SPROUT_TYPES } from "@/lib/sprout-types";

export const aiComposerSproutDraftSchema = z.object({
  localId: z.string().min(1).max(80),
  title: z.string().min(1).max(300),
  description: z.string().max(8000).optional().nullable(),
  type: z.enum(SPROUT_TYPES),
  timelineLabel: z.string().max(80).optional().nullable(),
  targetCompletionAt: z.string().max(40).optional().nullable(),
  parentLocalId: z.string().min(1).max(80).optional().nullable(),
  plotName: z.string().max(200).optional().nullable(),
});

export const aiComposerInitiativeDraftSchema = z.object({
  localId: z.string().min(1).max(80),
  name: z.string().min(1).max(200),
  description: z.string().max(4000).optional().nullable(),
  timelineLabel: z.string().max(80).optional().nullable(),
  targetCompletionAt: z.string().max(40).optional().nullable(),
  linkedSproutLocalIds: z.array(z.string().min(1).max(80)).default([]),
});

export const aiComposerHarvestDraftSchema = z.object({
  localId: z.string().min(1).max(80),
  name: z.string().min(1).max(200),
  versionLabel: z.string().max(80).optional().nullable(),
  targetDate: z.string().max(40).optional().nullable(),
  shippedAt: z.string().max(40).optional().nullable(),
  linkedSproutLocalIds: z.array(z.string().min(1).max(80)).default([]),
});

export const aiComposerDraftSchema = z.object({
  summary: z.string().min(1).max(2000),
  sprouts: z.array(aiComposerSproutDraftSchema).default([]),
  initiatives: z.array(aiComposerInitiativeDraftSchema).default([]),
  harvests: z.array(aiComposerHarvestDraftSchema).default([]),
});

export const aiComposerPromptSchema = z.object({
  prompt: z.string().trim().min(1).max(12000),
});

export const aiComposerReviewSproutSchema = aiComposerSproutDraftSchema.extend({
  selected: z.boolean(),
  plotId: z.string().min(1).max(40).optional().nullable(),
});

export const aiComposerReviewInitiativeSchema =
  aiComposerInitiativeDraftSchema.extend({
    selected: z.boolean(),
  });

export const aiComposerReviewHarvestSchema = aiComposerHarvestDraftSchema.extend({
  selected: z.boolean(),
});

export const aiComposerApplySchema = z.object({
  summary: z.string().min(1).max(2000),
  sprouts: z.array(aiComposerReviewSproutSchema),
  initiatives: z.array(aiComposerReviewInitiativeSchema),
  harvests: z.array(aiComposerReviewHarvestSchema),
});

export type AiComposerDraft = z.infer<typeof aiComposerDraftSchema>;
export type AiComposerReviewDraft = z.infer<typeof aiComposerApplySchema>;
