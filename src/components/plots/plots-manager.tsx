"use client";

import type { Plot } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function PlotsManager({
  workspaceId,
  initialPlots,
}: {
  workspaceId: string;
  initialPlots: Plot[];
}) {
  const router = useRouter();
  const [plots, setPlots] = useState(initialPlots);
  const [name, setName] = useState("");

  async function createPlot(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const res = await fetch(`/api/workspaces/${workspaceId}/plots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { plot: Plot };
    setPlots((p) => [...p, data.plot]);
    setName("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={createPlot} className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="plot-name" className="text-sm font-medium">
            New plot
          </label>
          <input
            id="plot-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mobile app"
            className="min-w-[240px] rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          Add plot
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {plots.length === 0 ? (
          <li className="text-zinc-500">No plots yet. Create one to start planting Sprouts.</li>
        ) : (
          plots.map((p) => (
            <li key={p.id}>
              <Link
                href={`/app/plots/${p.id}`}
                className="block rounded-lg border border-zinc-200 px-4 py-3 hover:border-emerald-600/40 hover:bg-emerald-50/50 dark:border-zinc-700 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-950/20"
              >
                <span className="font-medium">{p.name}</span>
                {p.description ? (
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {p.description}
                  </p>
                ) : null}
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
