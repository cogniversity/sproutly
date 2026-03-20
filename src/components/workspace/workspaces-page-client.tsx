"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Ws = { id: string; name: string; slug: string; role: string };

export function WorkspacesPageClient({
  initialWorkspaces,
  activeWorkspaceId,
  initialMembers,
  canInvite,
}: {
  initialWorkspaces: Ws[];
  activeWorkspaceId: string;
  initialMembers: { id: string; role: string; user: { email: string; name: string } }[];
  canInvite: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"EDITOR" | "VIEWER" | "ADMIN">("EDITOR");
  const [msg, setMsg] = useState("");

  async function createWs(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setMsg("");
    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (!res.ok) {
      setMsg("Could not create workspace.");
      return;
    }
    setName("");
    router.refresh();
  }

  async function switchWs(id: string) {
    const res = await fetch("/api/workspaces/active", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: id }),
    });
    if (res.ok) router.refresh();
  }

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim() || !activeWorkspaceId) return;
    setMsg("");
    const res = await fetch(`/api/workspaces/${activeWorkspaceId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: inviteEmail.trim().toLowerCase(),
        role: inviteRole,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setMsg(data.error ?? "Invite failed.");
      return;
    }
    setInviteEmail("");
    setMsg("Added to workspace.");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-10">
      <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Your workspaces
        </h2>
        <ul className="mt-3 space-y-2">
          {initialWorkspaces.length === 0 ? (
            <li className="text-sm text-zinc-500">None yet — create one below.</li>
          ) : (
            initialWorkspaces.map((w) => (
              <li
                key={w.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-100 px-3 py-2 dark:border-zinc-800"
              >
                <div>
                  <span className="font-medium">{w.name}</span>
                  <span className="ml-2 text-xs text-zinc-500">{w.role}</span>
                </div>
                <div className="flex gap-2">
                  {w.id === activeWorkspaceId ? (
                    <span className="text-xs text-emerald-700 dark:text-emerald-400">
                      Current
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void switchWs(w.id)}
                      className="text-xs text-emerald-700 underline dark:text-emerald-400"
                    >
                      Switch here
                    </button>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Create workspace
        </h2>
        <form onSubmit={createWs} className="mt-3 flex flex-wrap items-end gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Workspace name"
            className="min-w-[200px] flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600"
            required
          />
          <button
            type="submit"
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white"
          >
            Create
          </button>
        </form>
      </section>

      {activeWorkspaceId ? (
        <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            People in current workspace
          </h2>
          <ul className="mt-3 space-y-1 text-sm">
            {initialMembers.map((m) => (
              <li key={m.id} className="text-zinc-600 dark:text-zinc-400">
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {m.user.name}
                </span>{" "}
                <span className="text-zinc-500">&lt;{m.user.email}&gt;</span> · {m.role}
              </li>
            ))}
          </ul>

          {canInvite ? (
            <form onSubmit={invite} className="mt-4 flex flex-col gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <p className="text-xs text-zinc-500">
                Invite by email — they must already have registered. No invitation email is sent
                yet.
              </p>
              <div className="flex flex-wrap items-end gap-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="min-w-[200px] flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as typeof inviteRole)}
                  className="rounded-lg border border-zinc-300 px-2 py-2 text-sm dark:border-zinc-600"
                >
                  <option value="EDITOR">Editor</option>
                  <option value="VIEWER">Viewer</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <button
                  type="submit"
                  className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-white dark:bg-zinc-200 dark:text-zinc-900"
                >
                  Add member
                </button>
              </div>
            </form>
          ) : (
            <p className="mt-3 text-xs text-zinc-500">
              Only workspace admins can add members.
            </p>
          )}
        </section>
      ) : null}

      {msg ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400" role="status">
          {msg}
        </p>
      ) : null}
    </div>
  );
}
