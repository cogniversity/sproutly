import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/auth";
import { getActiveWorkspaceContext } from "@/lib/active-workspace";

/** Use in server pages that need the workspace selected in the shell. */
export async function requireActiveWorkspace() {
  const session = await getAppSession();
  if (!session) redirect("/login");
  const ctx = await getActiveWorkspaceContext(session);
  if (!ctx) redirect("/app/workspaces");
  return ctx;
}
