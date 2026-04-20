"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { InlineNotice } from "@/components/ui/inline-notice";

type InitiativeDetail = {
  id: string;
  name: string;
  description: string | null;
  workspaceId: string;
  plots: { plot: { id: string; name: string } }[];
  sprouts: { sprout: { id: string; title: string; plotId: string } }[];
};

export function InitiativeDetailClient({ initiative }: { initiative: InitiativeDetail }) {
  const router = useRouter();
  const [plotId, setPlotId] = useState("");
  const [sproutId, setSproutId] = useState("");
  const [notice, setNotice] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  async function addPlot(e: React.FormEvent) {
    e.preventDefault();
    if (!plotId.trim()) return;
    setNotice(null);
    const res = await fetch(`/api/initiatives/${initiative.id}/plots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plotId: plotId.trim() }),
    });
    if (!res.ok) {
      setNotice({
        tone: "error",
        message: "Could not link plot. Check the ID and confirm it belongs to this workspace.",
      });
      return;
    }
    setPlotId("");
    setNotice({ tone: "success", message: "Plot linked." });
    router.refresh();
  }

  async function removePlot(pid: string) {
    setNotice(null);
    await fetch(
      `/api/initiatives/${initiative.id}/plots?plotId=${encodeURIComponent(pid)}`,
      { method: "DELETE" },
    );
    setNotice({ tone: "success", message: "Plot unlinked." });
    router.refresh();
  }

  async function addSprout(e: React.FormEvent) {
    e.preventDefault();
    if (!sproutId.trim()) return;
    setNotice(null);
    const res = await fetch(`/api/initiatives/${initiative.id}/sprouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sproutId: sproutId.trim() }),
    });
    if (!res.ok) {
      setNotice({ tone: "error", message: "Could not link sprout." });
      return;
    }
    setSproutId("");
    setNotice({ tone: "success", message: "Sprout linked." });
    router.refresh();
  }

  async function removeSprout(sid: string) {
    setNotice(null);
    await fetch(
      `/api/initiatives/${initiative.id}/sprouts?sproutId=${encodeURIComponent(sid)}`,
      { method: "DELETE" },
    );
    setNotice({ tone: "success", message: "Sprout unlinked." });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-8">
      {notice ? <InlineNotice message={notice.message} tone={notice.tone} /> : null}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold text-zinc-500">Linked plots</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {initiative.plots.map((p) => (
              <li
                key={p.plot.id}
                className="flex items-center justify-between gap-2 rounded border border-zinc-200 px-2 py-1 dark:border-zinc-700"
              >
                <Link href={`/app/plots/${p.plot.id}`} className="hover:underline">
                  {p.plot.name}
                </Link>
                <button
                  type="button"
                  onClick={() => void removePlot(p.plot.id)}
                  className="text-xs text-red-600"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <form onSubmit={addPlot} className="mt-3 flex gap-2">
            <input
              value={plotId}
              onChange={(e) => setPlotId(e.target.value)}
              placeholder="Plot ID"
              className="flex-1 rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600"
            />
            <button
              type="submit"
              className="rounded bg-zinc-800 px-2 py-1 text-xs text-white"
            >
              Link
            </button>
          </form>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-zinc-500">Linked sprouts</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {initiative.sprouts.map((s) => (
              <li
                key={s.sprout.id}
                className="flex items-center justify-between gap-2 rounded border border-zinc-200 px-2 py-1 dark:border-zinc-700"
              >
                <span>{s.sprout.title}</span>
                <button
                  type="button"
                  onClick={() => void removeSprout(s.sprout.id)}
                  className="text-xs text-red-600"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <form onSubmit={addSprout} className="mt-3 flex gap-2">
            <input
              value={sproutId}
              onChange={(e) => setSproutId(e.target.value)}
              placeholder="Sprout ID"
              className="flex-1 rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600"
            />
            <button
              type="submit"
              className="rounded bg-zinc-800 px-2 py-1 text-xs text-white"
            >
              Link
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
