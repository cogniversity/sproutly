/** Parse optional ISO date from JSON; empty string → null (clear). */
export function optDate(
  s: string | null | undefined,
): Date | null | undefined {
  if (s === undefined) return undefined;
  if (s === null || s === "") return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}
