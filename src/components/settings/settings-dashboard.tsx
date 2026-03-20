"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Tab = "ai" | "templates" | "digest";

export function SettingsDashboard({
  workspaceId,
  isAdmin,
  defaultTab,
  initialTemplates,
}: {
  workspaceId: string;
  isAdmin: boolean;
  defaultTab: Tab;
  initialTemplates: { id: string; name: string; kind: string; subject: string }[];
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const raw = sp.get("tab");
  const tab: Tab =
    raw === "ai" || raw === "templates" || raw === "digest"
      ? raw
      : defaultTab;

  const setTab = useCallback(
    (t: Tab) => {
      router.push(`/app/settings?tab=${t}`);
    },
    [router],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 pb-2 dark:border-zinc-800">
        {isAdmin ? (
          <button
            type="button"
            onClick={() => setTab("ai")}
            className={`rounded-lg px-3 py-1.5 text-sm ${tab === "ai" ? "bg-emerald-100 font-medium dark:bg-emerald-950" : "text-zinc-600"}`}
          >
            AI (admin)
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setTab("templates")}
          className={`rounded-lg px-3 py-1.5 text-sm ${tab === "templates" ? "bg-emerald-100 font-medium dark:bg-emerald-950" : "text-zinc-600"}`}
        >
          Email templates
        </button>
        <button
          type="button"
          onClick={() => setTab("digest")}
          className={`rounded-lg px-3 py-1.5 text-sm ${tab === "digest" ? "bg-emerald-100 font-medium dark:bg-emerald-950" : "text-zinc-600"}`}
        >
            Digest preview
        </button>
      </div>

      {tab === "ai" && isAdmin ? (
        <AiSettingsPanel workspaceId={workspaceId} />
      ) : null}
      {tab === "templates" ? (
        <TemplatesPanel
          workspaceId={workspaceId}
          initialTemplates={initialTemplates}
        />
      ) : null}
      {tab === "digest" ? (
        <DigestPreviewPanel workspaceId={workspaceId} />
      ) : null}
      {!isAdmin && tab === "ai" ? (
        <p className="text-sm text-zinc-500">AI settings are workspace-admin only.</p>
      ) : null}
    </div>
  );
}

function AiSettingsPanel({ workspaceId }: { workspaceId: string }) {
  const [enabled, setEnabled] = useState(false);
  const [provider, setProvider] = useState<string>("OPENAI");
  const [apiKey, setApiKey] = useState("");
  const [masked, setMasked] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    void (async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/ai-settings`);
      if (!res.ok) return;
      const data = (await res.json()) as {
        enabled: boolean;
        provider: string | null;
        apiKeyMasked: string | null;
      };
      setEnabled(data.enabled);
      setProvider(data.provider ?? "OPENAI");
      setMasked(data.apiKeyMasked);
    })();
  }, [workspaceId]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const payload: Record<string, unknown> = { enabled, provider };
    if (apiKey.trim()) payload.apiKey = apiKey.trim();
    const res = await fetch(`/api/workspaces/${workspaceId}/ai-settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json().catch(() => ({}))) as {
      apiKeyMasked?: string | null;
      error?: string;
    };
    if (!res.ok) {
      setMsg(data.error ?? "Save failed");
      return;
    }
    setMasked(data.apiKeyMasked ?? null);
    setApiKey("");
    setMsg("Saved.");
  }

  async function clearKey() {
    setMsg("");
    const res = await fetch(`/api/workspaces/${workspaceId}/ai-settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: "" }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      apiKeyMasked?: string | null;
    };
    if (res.ok) {
      setMasked(data.apiKeyMasked ?? null);
      setMsg("Key cleared.");
    }
  }

  return (
    <form onSubmit={save} className="flex max-w-lg flex-col gap-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Editors see only generic “AI assist.” Provider and keys stay on this screen.
        Elaboration uses <strong>OpenAI</strong> in this build. Saving a non-empty API key
        automatically turns AI on unless you explicitly uncheck “Enable” in the same save.
      </p>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        Enable AI assist for this workspace
      </label>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">Provider</span>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600"
        >
          <option value="OPENAI">OpenAI</option>
          <option value="ANTHROPIC">Anthropic (UI only — elaboration not wired)</option>
          <option value="GOOGLE">Google (UI only — elaboration not wired)</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">API key</span>
        {masked ? (
          <p className="text-xs text-zinc-500">Current: {masked}</p>
        ) : null}
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Paste new key to rotate"
          className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600"
          autoComplete="off"
        />
      </div>
      {msg ? <p className="text-sm text-emerald-700 dark:text-emerald-400">{msg}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm text-white"
        >
          Save AI settings
        </button>
        <button
          type="button"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
          onClick={() => void clearKey()}
        >
          Clear API key
        </button>
      </div>
    </form>
  );
}

function TemplatesPanel({
  workspaceId,
  initialTemplates,
}: {
  workspaceId: string;
  initialTemplates: { id: string; name: string; kind: string; subject: string }[];
}) {
  const router = useRouter();
  const [templates, setTemplates] = useState(initialTemplates);
  const [name, setName] = useState("Digest");
  const [subject, setSubject] = useState("{{workspaceName}} — weekly digest");
  const [bodyHtml, setBodyHtml] = useState(
    "<p>Hi,</p>\n<p>{{workspaceName}}</p>\n<div>{{digestHtml}}</div>",
  );

  async function refresh() {
    const res = await fetch(`/api/workspaces/${workspaceId}/email-templates`);
    if (!res.ok) return;
    const data = (await res.json()) as {
      templates: { id: string; name: string; kind: string; subject: string }[];
    };
    setTemplates(data.templates);
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/workspaces/${workspaceId}/email-templates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "DIGEST",
        name,
        subject,
        bodyHtml,
      }),
    });
    if (!res.ok) return;
    setName("Digest");
    await refresh();
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete template?")) return;
    await fetch(`/api/email-templates/${id}`, { method: "DELETE" });
    await refresh();
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="space-y-2 text-sm">
        {templates.map((t) => (
          <li
            key={t.id}
            className="flex items-center justify-between rounded border border-zinc-200 px-2 py-1 dark:border-zinc-700"
          >
            <span>
              {t.name} <span className="text-zinc-400">({t.kind})</span>
            </span>
            <button
              type="button"
              onClick={() => void remove(t.id)}
              className="text-xs text-red-600"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={create} className="flex max-w-xl flex-col gap-3">
        <h3 className="text-sm font-semibold">New template</h3>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="rounded border px-2 py-1"
        />
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          className="rounded border px-2 py-1"
        />
        <textarea
          value={bodyHtml}
          onChange={(e) => setBodyHtml(e.target.value)}
          rows={6}
          className="rounded border px-2 py-1 font-mono text-xs"
        />
        <p className="text-xs text-zinc-500">
          Use merge fields: {"{{workspaceName}}"}, {"{{digestHtml}}"}
        </p>
        <button type="submit" className="w-fit rounded bg-zinc-800 px-3 py-1 text-sm text-white">
          Save template
        </button>
      </form>
    </div>
  );
}

function DigestPreviewPanel({ workspaceId }: { workspaceId: string }) {
  const sp = useSearchParams();
  const recent = Math.min(90, Math.max(1, Number(sp.get("recent") ?? 14) || 14));
  const [html, setHtml] = useState("");
  const [subject, setSubject] = useState("");

  useEffect(() => {
    void (async () => {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/digest-preview?recentDays=${recent}`,
      );
      if (!res.ok) return;
      const data = (await res.json()) as { html: string; subject: string };
      setHtml(data.html);
      setSubject(data.subject);
    })();
  }, [workspaceId, recent]);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Preview only — SMTP send comes later. Subject:{" "}
        <strong>{subject || "…"}</strong>
      </p>
      <iframe
        title="Digest preview"
        srcDoc={html}
        className="min-h-[480px] w-full rounded-lg border border-zinc-200 bg-white dark:border-zinc-700"
        sandbox="allow-same-origin"
      />
    </div>
  );
}
