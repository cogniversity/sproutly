"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { InlineNotice } from "@/components/ui/inline-notice";

type HarvestDetail = {
  id: string;
  name: string;
  sprouts: {
    sprout: { id: string; title: string; plotId: string };
  }[];
};

export function HarvestDetailClient({ harvest }: { harvest: HarvestDetail }) {
  const router = useRouter();
  const [sproutId, setSproutId] = useState("");
  const [notice, setNotice] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!sproutId.trim()) return;
    setNotice(null);
    const res = await fetch(`/api/harvests/${harvest.id}/sprouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sproutId: sproutId.trim() }),
    });
    if (!res.ok) {
      setNotice({ tone: "error", message: "Could not link sprout." });
      return;
    }
    setSproutId("");
    setNotice({ tone: "success", message: "Sprout added to harvest." });
    router.refresh();
  }

  async function remove(sid: string) {
    setNotice(null);
    await fetch(
      `/api/harvests/${harvest.id}/sprouts?sproutId=${encodeURIComponent(sid)}`,
      { method: "DELETE" },
    );
    setNotice({ tone: "success", message: "Sprout removed from harvest." });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {notice ? <InlineNotice message={notice.message} tone={notice.tone} /> : null}
      <h2 className="text-sm font-semibold text-zinc-500">Sprouts in this release</h2>
      <ul className="space-y-2 text-sm">
        {harvest.sprouts.map((s) => (
          <li
            key={s.sprout.id}
            className="flex items-center justify-between gap-2 rounded border border-zinc-200 px-2 py-1 dark:border-zinc-700"
          >
            <span>{s.sprout.title}</span>
            <button
              type="button"
              onClick={() => void remove(s.sprout.id)}
              className="text-xs text-red-600"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="flex gap-2">
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
          Add to harvest
        </button>
      </form>
    </div>
  );
}
