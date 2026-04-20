"use client";

type Tone = "info" | "success" | "error";

const TONE_CLASSES: Record<Tone, string> = {
  info: "border-zinc-300 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300",
  error:
    "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300",
};

export function InlineNotice({
  message,
  tone = "info",
}: {
  message: string;
  tone?: Tone;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-lg border px-3 py-2 text-sm ${TONE_CLASSES[tone]}`}
    >
      {message}
    </div>
  );
}
