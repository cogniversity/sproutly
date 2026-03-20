"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type InitiativeRow = {
  id: string;
  name: string;
  description: string | null;
  plots: { plot: { id: string; name: string } }[];
  sprouts: { sprout: { id: string; title: string } }[];
};

export function InitiativesBoard({
  workspaceId,
  initial,
}: {
  workspaceId: string;
  initial: InitiativeRow[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [name, setName] = useState("");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const res = await fetch(`/api/workspaces/${workspaceId}/initiatives`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { initiative: InitiativeRow };
    setItems((x) => [data.initiative, ...x]);
    setName("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={create} className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="ini-name" className="text-sm font-medium">
            New initiative
          </label>
          <input
            id="ini-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Acme onsite — Q2"
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
          <li className="text-zinc-500">No cross-plot initiatives yet.</li>
        ) : (
          items.map((i) => (
            <li key={i.id}>
              <Link
                href={`/app/initiatives/${i.id}`}
                className="block rounded-lg border border-zinc-200 px-4 py-3 hover:border-emerald-600/40 dark:border-zinc-700"
              >
                <span className="font-medium">{i.name}</span>
                <p className="mt-1 text-xs text-zinc-500">
                  {i.plots.length} plot(s) · {i.sprouts.length} sprout(s)
                </p>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
