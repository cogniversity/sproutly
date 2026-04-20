import type { SproutType } from "@prisma/client";

export const SPROUT_TYPES = [
  "IDEA",
  "FEATURE",
  "BUG",
  "DEBT",
  "TASK",
] as const;

const SPROUT_TYPE_LABELS: Record<SproutType, string> = {
  IDEA: "Idea",
  FEATURE: "Feature",
  BUG: "Bug",
  DEBT: "Debt",
  TASK: "Task",
};

export function formatSproutTypeLabel(type: SproutType) {
  return SPROUT_TYPE_LABELS[type];
}
