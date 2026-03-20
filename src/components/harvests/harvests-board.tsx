"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type HarvestRow = {
  id: string;
  name: string;
  versionLabel: string | null;
  targetDate: Date | null;
  shippedAt: Date | null;
  sprouts: unknown[];
};

export function HarvestsBoard({
  workspaceId,
  initial,
}: {
  workspaceId: string;
  initial: HarvestRow[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [name, setName] = useState("");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const res = await fetch(`/api/workspaces/${workspaceId}/harvests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { harvest: HarvestRow };
    setItems((x) => [data.harvest, ...x]);
    setName("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={create} className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="hv-name" className="text-sm font-medium">
            New harvest (release)
          </label>
          <input
            id="hv-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. 2026.3 — Growth timeline"
            className="min-w-[280px] rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white"
        >
          Create
        </button>
      </form>

      <ul className="flex flex-col gap-3">
        {items.length === 0 ? (
          <li className="text-zinc-500">No harvests yet.</li>
        ) : (
          items.map((h) => (
            <li key={h.id}>
              <Link
                href={`/app/harvests/${h.id}`}
                className="block rounded-lg border border-zinc-200 px-4 py-3 hover:border-emerald-600/40 dark:border-zinc-700"
              >
                <span className="font-medium">{h.name}</span>
                {h.versionLabel ? (
                  <span className="ml-2 text-sm text-zinc-500">{h.versionLabel}</span>
                ) : null}
                <p className="mt-1 text-xs text-zinc-500">
                  {h.sprouts.length} sprout(s) in scope
                </p>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
