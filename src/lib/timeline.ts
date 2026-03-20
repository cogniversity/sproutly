/** User-facing planning: free-text quarter/year label (e.g. Q3'27) and/or concrete target date. */

export type HorizonBucket =
  | "day"
  | "week"
  | "month"
  | "quarter"
  | "year"
  | "unset";

export function deriveHorizonBucket(
  targetCompletionAt: Date | null,
  timelineLabel: string | null,
): HorizonBucket {
  if (targetCompletionAt) {
    const now = Date.now();
    const t = targetCompletionAt.getTime();
    const d = Math.ceil((t - now) / 86400000);
    if (d <= 1) return "day";
    if (d <= 7) return "week";
    if (d <= 31) return "month";
    if (d <= 120) return "quarter";
    return "year";
  }
  const l = (timelineLabel ?? "").trim();
  if (!l) return "unset";
  if (/Q\s*[1-4]/i.test(l)) return "quarter";
  if (/\b20\d{2}\b/.test(l)) return "year";
  return "unset";
}

/** Single line for tables: label + date + derived bucket hint */
export function formatPlanningLine(
  targetCompletionAt: Date | null,
  timelineLabel: string | null,
): string {
  const parts: string[] = [];
  if (timelineLabel?.trim()) parts.push(timelineLabel.trim());
  if (targetCompletionAt) {
    parts.push(targetCompletionAt.toISOString().slice(0, 10));
  }
  const b = deriveHorizonBucket(targetCompletionAt, timelineLabel);
  if (b !== "unset") parts.push(`~${b}`);
  return parts.length ? parts.join(" · ") : "—";
}
