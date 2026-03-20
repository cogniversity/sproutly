import type { LlmProvider } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getAiSettings(workspaceId: string) {
  return prisma.workspaceAiSettings.findUnique({
    where: { workspaceId },
  });
}

export async function patchAiSettings(input: {
  workspaceId: string;
  enabled?: boolean;
  provider?: LlmProvider | null;
  /** undefined = leave unchanged; null or "" after trim = clear */
  apiKey?: string | null;
}) {
  const existing = await prisma.workspaceAiSettings.findUnique({
    where: { workspaceId: input.workspaceId },
  });

  let mergedEnabled = existing?.enabled ?? false;
  if (input.enabled !== undefined) {
    mergedEnabled = input.enabled;
  } else if (input.apiKey != null && input.apiKey.trim()) {
    mergedEnabled = true;
  }

  const nextProvider =
    input.provider !== undefined ? input.provider : existing?.provider ?? null;
  let nextKey = existing?.apiKey ?? null;
  if (input.apiKey !== undefined) {
    nextKey = input.apiKey?.trim() ? input.apiKey.trim() : null;
  }

  const touchesAuth =
    input.enabled !== undefined || input.apiKey !== undefined;

  return prisma.workspaceAiSettings.upsert({
    where: { workspaceId: input.workspaceId },
    create: {
      workspaceId: input.workspaceId,
      enabled: mergedEnabled,
      provider: nextProvider,
      apiKey: nextKey,
    },
    update: {
      ...(touchesAuth ? { enabled: mergedEnabled } : {}),
      ...(input.apiKey !== undefined ? { apiKey: nextKey } : {}),
      ...(input.provider !== undefined ? { provider: input.provider } : {}),
    },
  });
}

/** Mask key for admin UI (last 4 only). */
export function maskApiKey(key: string | null | undefined) {
  if (!key) return null;
  if (key.length <= 4) return "****";
  return `••••••••${key.slice(-4)}`;
}

export async function resolveLlmApiKey(workspaceId: string): Promise<{
  apiKey: string;
  provider: LlmProvider;
} | null> {
  const ws = await getAiSettings(workspaceId);
  if (ws && ws.enabled === false) {
    return null;
  }
  if (ws?.apiKey?.trim() && ws.provider === "OPENAI") {
    return { apiKey: ws.apiKey, provider: "OPENAI" };
  }
  const fallback = process.env.OPENAI_API_KEY?.trim();
  if (fallback) {
    return { apiKey: fallback, provider: "OPENAI" };
  }
  return null;
}
