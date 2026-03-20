"use client";

import type { Horizon, Sprout, SproutStatus, User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type SproutRow = Sprout & {
  owner: Pick<User, "id" | "name" | "email"> | null;
};

const STATUSES: SproutStatus[] = [
  "BACKLOG",
  "IN_PROGRESS",
  "PAUSED",
  "DEPRIORITIZED",
  "BLOCKED",
  "DONE",
];

const HORIZONS: Horizon[] = ["NONE", "DAY", "WEEK", "MONTH", "QUARTER", "YEAR"];

export function PlotSproutsManager({
  plotId,
  initialSprouts,
}: {
  plotId: string;
  initialSprouts: SproutRow[];
}) {
  const router = useRouter();
  const [sprouts, setSprouts] = useState(initialSprouts);
  const [title, setTitle] = useState("");

  async function createSprout(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const res = await fetch(`/api/plots/${plotId}/sprouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim() }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { sprout: SproutRow };
    setSprouts((s) => [data.sprout, ...s]);
    setTitle("");
    router.refresh();
  }

  async function patchSprout(id: string, patch: Partial<{ status: SproutStatus; horizon: Horizon }>) {
    const res = await fetch(`/api/sprouts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { sprout: SproutRow };
    setSprouts((s) => s.map((x) => (x.id === id ? data.sprout : x)));
    router.refresh();
  }

  async function removeSprout(id: string) {
    if (!confirm("Delete this Sprout?")) return;
    const res = await fetch(`/api/sprouts/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setSprouts((s) => s.filter((x) => x.id !== id));
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={createSprout} className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="sprout-title" className="text-sm font-medium">
            New sprout
          </label>
          <input
            id="sprout-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Feature or task title"
            className="min-w-[280px] rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          Add sprout
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50">
            <tr>
              <th className="px-3 py-2 font-medium">Title</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Horizon</th>
              <th className="px-3 py-2 font-medium">Owner</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {sprouts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-zinc-500">
                  No Sprouts in this plot yet.
                </td>
              </tr>
            ) : (
              sprouts.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-zinc-100 dark:border-zinc-800"
                >
                  <td className="px-3 py-2 font-medium">{s.title}</td>
                  <td className="px-3 py-2">
                    <select
                      value={s.status}
                      onChange={(e) =>
                        void patchSprout(s.id, {
                          status: e.target.value as SproutStatus,
                        })
                      }
                      className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-600 dark:bg-zinc-900"
                    >
                      {STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={s.horizon}
                      onChange={(e) =>
                        void patchSprout(s.id, {
                          horizon: e.target.value as Horizon,
                        })
                      }
                      className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-600 dark:bg-zinc-900"
                    >
                      {HORIZONS.map((h) => (
                        <option key={h} value={h}>
                          {h === "NONE" ? "—" : h}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                    {s.owner?.name ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => void removeSprout(s.id)}
                      className="text-xs text-red-600 hover:underline dark:text-red-400"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
