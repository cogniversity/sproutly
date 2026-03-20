"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Ws = { id: string; name: string; role: string };

export function WorkspaceSwitcher({
  memberships,
  activeWorkspaceId,
}: {
  memberships: Ws[];
  activeWorkspaceId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function switchTo(id: string) {
    if (id === activeWorkspaceId || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/workspaces/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: id }),
      });
      if (!res.ok) return;
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (memberships.length === 0) {
    return (
      <Link
        href="/app/workspaces"
        className="text-sm text-amber-800 underline dark:text-amber-300"
      >
        Create a workspace
      </Link>
    );
  }

  const safeValue =
    memberships.some((m) => m.id === activeWorkspaceId) && activeWorkspaceId
      ? activeWorkspaceId
      : memberships[0]!.id;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor="ws-switch">
        Workspace
      </label>
      <select
        id="ws-switch"
        value={safeValue}
        disabled={busy}
        onChange={(e) => void switchTo(e.target.value)}
        className="max-w-[200px] rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-800 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
      >
        {memberships.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name} ({m.role})
          </option>
        ))}
      </select>
      <Link
        href="/app/workspaces"
        className="text-xs text-emerald-700 underline dark:text-emerald-400"
      >
        All workspaces
      </Link>
    </div>
  );
}
