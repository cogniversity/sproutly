/** Parse optional ISO date from JSON; empty string → null (clear). */
export function optDate(
  s: string | null | undefined,
): Date | null | undefined {
  if (s === undefined) return undefined;
  if (s === null || s === "") return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Value for `<input type="date">` in the user's local calendar (avoids UTC off-by-one). */
export function toDateInputLocal(v: Date | string | null | undefined): string {
  if (v == null || v === "") return "";
  const d = typeof v === "string" ? new Date(v) : v;
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
